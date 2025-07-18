import NextAuth from 'next-auth';
import {PrismaAdapter} from '@auth/prisma-adapter';
import {prisma} from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { mergeGuestCartWithUserCart } from '@/lib/cart-merge';

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

                // Merge guest cart with user cart on sign in
                if(trigger === 'signIn' || trigger === 'signUp') {
                    await mergeGuestCartWithUserCart(user.id);
                }
            }

            //Handle session updates
            if(session?.user.name && trigger === 'update') {
                //If the session has a name, set the token name to the session name
                token.name = session.user.name;
            }

            return token;
        },
    },
} satisfies NextAuthConfig;

export const {handlers, auth, signIn, signOut} = NextAuth(config);