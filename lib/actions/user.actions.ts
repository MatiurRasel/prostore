'use server';

import { shippingAddressSchema, 
    signInFormSchema, 
    signUpFormSchema,
    paymentMethodSchema,
    updateUserSchema
} from "../validators";
import{ auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from '@/db/prisma';
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { hash } from 'bcrypt';
import { utapi } from '../uploadthing-server';

//Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown,
    fromData:FormData
) {
    try {

        const user = signInFormSchema.parse({
            email: fromData.get('email'),
            password: fromData.get('password')
        });

        await signIn('credentials',user);

        return {
            success: true,
            message: 'Signed in successfully'
        }
    } 
    catch(error) {

        if(isRedirectError(error)) {
            throw error;
        }

        return {
            success: false,
            message: 'Invalid email or password'
        };

    }

}



//Sign user out
export async function signOutUser() {
    await signOut();
}

//Sign up user
export async function signUpUser(prevState: unknown,formData: FormData) {

    try {
        
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });
        const plainPassword =  user.password;
        user.password = hashSync(user.password, 10);
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                tempPassword: plainPassword,
                password:user.password
            }
        });

        await signIn('credentials', {
            email: user.email,
            password: plainPassword,
        });

        return {
            success: true,
            message: 'User registered successfully'
        }

    } catch(error) {
        // console.log(error.name);
        // console.log(error.code);
        // console.log(error.errors);
        // console.log(error.meta?.target);

        if(isRedirectError(error)) {
            throw error;
        }

        return {
            success: false,
            message: formatError(error)
        };
    }

}

//Get user by the ID
export async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
        where: {id: userId}
    });

    if(!user) throw new Error('User not found');
    return user;
}

//Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
    try {
        const session = await auth();
        
        const currentUser = await prisma.user.findFirst({
            where: {   id: session?.user?.id }

            });
        if(!currentUser) throw new Error('User not found');

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where: { id: currentUser.id },  
            data: {address}
        });

        return {
            success: true,
            message: 'User Address updated successfully'
        };

    } catch(error) { 
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//Update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try {

        const session = await auth();
        
        const currentUser = await prisma.user.findFirst({
            where: {   
                    id: session?.user?.id 
                }
            });

        if(!currentUser) throw new Error('User not found');

        const paymentMethod = paymentMethodSchema.parse(data);

        await prisma.user.update({
            where: { id: currentUser.id },  
            data: {paymentMethod: paymentMethod.type}
        });

        return {
            success: true,
            message: 'User Payment Method updated successfully'
        };

    } catch(error) { 
        return {
            success: false,
            message: formatError(error)
        }
    }
}
//Update user profile
export async function updateProfile(user: {name: string; email: string}) {
    try {
        const session = await auth();

        const currentUser = await  prisma.user.findFirst({
            where: {
                id: session?.user?.id
            }
        });

        if(!currentUser)  throw new Error('User not found');

        await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                name: user.name
            }
        });

        return {
            success: true,
            message: 'User updated successfully.'
        }


    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        }
    }

}

//Get all the users
export async function getAllUsers({
    limit= PAGE_SIZE,
    page,
    query,
    sort = 'createdAt',
    order = 'desc',
}: {
    limit?: number;
    page: number;
    query: string;
    sort?: string;
    order?: 'asc' | 'desc';
}) {
    try {
        const queryFilter: Prisma.UserWhereInput = query && query !== 'all' ? {
            name: {
                contains: query,
                mode: 'insensitive'
            } as Prisma.StringFilter
        } : {};

        // Map sort keys to Prisma orderBy fields
        let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
        if (sort === 'id') orderBy = { id: order };
        else if (sort === 'name') orderBy = { name: order };
        else if (sort === 'email') orderBy = { email: order };
        else if (sort === 'role') orderBy = { role: order };
        else if (sort === 'createdAt') orderBy = { createdAt: order };

        const data = await prisma.user.findMany({
            where: {
                ...queryFilter
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit
        });
        const dataCount = await prisma.user.count();
        const totalPages = Math.ceil(dataCount / limit);
        return {
            data,
            totalPages
        };
    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        };
    }
}

//Delete user
export async function deleteUser(userId: string) {
    try {
        const session = await auth();

        if(session?.user?.role !== 'admin') throw new Error('Unauthorized');

        await prisma.user.delete({
            where: {id: userId}
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'User deleted successfully'
        }

    } catch(error) {
        return {
            success: false,
            message: formatError(error)
        };
    }
}

//Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
    debugger
    try {
        const session = await auth();

        if(session?.user?.role !== 'admin') throw new Error('Unauthorized');

        await prisma.user.update({
            where: {id: user.id},
            data: {
                name: user.name,
                role: user.role,
                image: user.imageUrl,
                phoneNumber: user.phoneNumber ?? null,
            }
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'User updated successfully'
        }
        
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        };
    }
}

export async function createUserWithPhoto(formData: FormData) {
  try {
    const session = await auth();

    if(session?.user?.role !== 'admin') throw new Error('Unauthorized');

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const imageUrl = formData.get('imageUrl') as string | undefined;
    const phoneNumber = formData.get('phoneNumber') as string | undefined;

    await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 10),
        role,
        image: imageUrl,
        phoneNumber: phoneNumber ?? null,
      }
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User created successfully'
    }
    
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    };
  }
}

export async function createUsersBulkWithPhoto(users: Array<{ name: string; email: string; password: string; imageUrl?: string; }>) {
    const results: Array<{ email: string; success: boolean; userId?: string; image?: string; message?: string }> = [];
    for (const user of users) {
        const plainPassword =  user.password;
        user.password = hashSync(user.password, 10);
        try {
            const created = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    tempPassword: plainPassword,
                    password: user.password, // or hash if needed
                    role: 'user',
                }
            });
            let imagePath = undefined;
            if (user.imageUrl) {
                const ext = user.imageUrl.split('.').pop();
                imagePath = `/user/${created.id}.${ext}`;
                await prisma.user.update({
                    where: { id: created.id },
                    data: { image: imagePath }
                });
            }
            results.push({ email: user.email, success: true, userId: created.id, image: imagePath });
        } catch (error) {
            results.push({ email: user.email, success: false, message: formatError(error) });
        }
    }
    return results;
}

export async function createUsersFromExcel(users: Array<{ name: string; email: string; password: string; }>) {
    const results: Array<{ email: string; success: boolean; userId?: string; message?: string }> = [];
    for (const user of users) {
        const plainPassword =  user.password;
        user.password = hashSync(user.password, 10);
        try {
            const created = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    tempPassword: plainPassword,
                    password: user.password, // or hash if needed
                    role: 'user',
                }
            });
            results.push({ email: user.email, success: true, userId: created.id });
        } catch (error) {
            results.push({ email: user.email, success: false, message: formatError(error) });
        }
    }
    return results;
}

export async function deleteUserImage(imageUrl: string) {
  try {
    // Extract the file key from the imageUrl (after /f/)
    const match = imageUrl.match(/\/f\/(.+)$/);
    const fileKey = match ? match[1] : null;
    if (!fileKey) throw new Error('Invalid image URL');
    await utapi.deleteFiles(fileKey);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function clearUserImage(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { image: null }
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

