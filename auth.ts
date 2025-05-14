import NextAuth from 'next-auth';
import {PrismaAdapter} from '@auth/prisma-adapter';
import {prisma} from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const config = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in'
    },
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60,//7 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials:{
            email: {type: 'email'},
            password: {type: 'password'}
        },
        async authorize(credentials) {
            if(credentials === null)  return null;
           
            //Find user in database
            const user = await prisma.user.findFirst({
                where: {
                    email: credentials.email as string
                }
            });

            //Check if user exists and if the password matches
            if(user && user.password) {
                const isMatch = compareSync(credentials.password as string, user.password);

                //If password is correct , return user
                if(isMatch) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                }
            }

            //If User does not exist or password does not match return null
            return null;
        },
        }),
    ],
    callbacks: {
        async session({
            session,user,trigger,token
        } : any) {
            //set the user id from the token
            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            //console.log(token);

            //if there is an update, set the user name
            if(trigger === 'update') {
                session.user.name = user.name;
            }

            return session;
        },
        async jwt({token, user, trigger, session} : any) {
            //assign user fields to the token
            if(user) {
                token.id = user.id;
                token.role = user.role;

                //if user has no name then  use the email
                if(user.name ==='NO_NAME') {
                    token.name = user.email!.split('@')[0];

                    //Update database to reflect the token name
                    await prisma.user.update({
                        where: {id: user.id},
                        data: {name: token.name}
                    });
                }

                if(trigger === 'signIn' || trigger === 'signUp') {
                    const cookieObject = await cookies();
                    const sessionCartId = cookieObject.get('sessionCartId')?.value;

                    if(sessionCartId) {
                        const sessionCart = await prisma.cart.findFirst({
                            where: {
                                id: sessionCartId
                            }
                        });

                        if(sessionCart) {
                            //Delete the session cart
                            await prisma.cart.deleteMany({
                                where: {
                                    userId: user.id,
                                },

                            });

                            //assign new cart 
                            await prisma.cart.update({
                                where: {
                                    id: sessionCart.id
                                },
                                data: {
                                    userId: user.id,
                                }
                            });
                        }
                    }
                }
            }

            //Handle session updates
            if(session?.user.name && trigger === 'update') {
                //If the session has a name, set the token name to the session name
                token.name = session.user.name;

            }

            return token;
        },
        authorized({request, auth}: any) {
            //Array of regex patterns to match the paths that should be protected
            const protectedPaths = [
                /\/shipping-address/,
                /\/payment-method/,
                /\/place-order/,
                /\/profile/,
                /\/user\/(.*)/,
                /\/order\/(.*)/,
                /\/admin/,
            ];
debugger
            //Get pathname from the request URL object.
            const {pathname} = request.nextUrl;

            //check if user is not authenticated and accessing a protected path
            if(!auth && protectedPaths.some((path) => path.test(pathname))) return false;

             // 🚫 Additional check: Block non-admin users from accessing /admin routes
            // if (/^\/admin/.test(pathname) && auth?.user?.role !== 'admin') {
            //     return false;
            // }


            // Check for session cart cookie
            if(!request.cookies.get('sessionCartId')) {
                
                //Generate new session cart id cookie
                const sessionCartId = crypto.randomUUID();

                //Clone the req headers
                const newRequestHeaders = new Headers(request.headers);

                //Create new response and add the new headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders
                    }
                });

                //Set newly generated sessionCartId in the response cookies
                response.cookies.set('sessionCartId', sessionCartId);

                return response;
            }
            else {
                return true;
            }
        }
    },
} satisfies NextAuthConfig;

export const {handlers, auth, signIn, signOut} = NextAuth(config);