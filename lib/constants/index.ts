export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pro Store';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A Modern E-Commerce platform built with Next.js';
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
    email: 'user@prostore.com',
    password: '123456',
    // email: '',
    // password: '',
  };
  
  export const signUpDefaultValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  export const shippingAddressDefaultValues = {
    fullName: 'John Bob',
    streetAddress: '84 Zoo Road, Mirpur',
    city: 'Dhaka',
    postalCode: '1207',
    country: 'BD'
  };