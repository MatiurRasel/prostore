import {z} from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const currency = z
.string()
.refine((value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
"Price must have exactly two decimal places");


const phoneNumberSchema = z
  .string()
  .nullable()
  .optional()
  .refine(
    (val) =>
      !val ||
      (typeof val === 'string' &&
        !!parsePhoneNumberFromString(val)?.isValid()),
    {
      message: 'Invalid phone number',
    }
  );


//Schema for inserting products
export const insertProductSchema = z.object({
    name: z.string().min(3,'Name must be at least 3 characters'),
    slug: z.string().min(3,'Slug must be at least 3 characters'),
    category: z.string().min(3,'Category must be at least 3 characters'),
    brand: z.string().min(3,'Brand must be at least 3 characters'),
    description: z.string().min(3,'Description must be at least 3 characters'),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1,'Product must be at least one image'),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
});

//Schema for updating products
export const updateProductSchema = insertProductSchema.extend({
    id: z.string().min(1, 'Id is required'),
});

//Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email('Invalid Email Address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

//Schema for signing up a user
export const signUpFormSchema = z.object({
    name: z.string().min(3,'Name must be at least 3 characters'),
    email: z.string().email('Invalid Email Address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
    phoneNumber: phoneNumberSchema,
    //tempPassword: z.string().nullable(),
}).refine((data) => data.password === data.confirmPassword,{
    message: "Passwords don't match",
    path: ['confirmPassword']
});

//Cart Schemas
export const cartItemsSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image is required'),
    price: currency
});

export const insertCartSchema = z.object({
    items: z.array(cartItemsSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    sessionCartId: z.string().min(1,'Session cart id is required'),
    userId: z.string().optional().nullable(),
});


// Schema for shipping address
export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
    city: z.string().min(3, 'City must be at least 3 characters'),
    postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
    country: z.string().min(3, 'Country must be at least 3 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

//Schema for payment method
export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method is required'),
}).refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method',
});

//Schema for inserting order
export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: 'Invalid payment method',
    }),
    shippingAddress: shippingAddressSchema,
    
});

//Schema for inserting an order item
export const insertOrderItemSchema = z.object({

    productId: z.string(),//.min(1, 'Product is required'),
    slug: z.string(),//.min(1, 'Slug is required'),
    name: z.string(),//.min(1, 'Name is required'),
    image: z.string(),//.min(1, 'Image is required'),
    price: currency,
    qty: z.number(),//.int().nonnegative('Quantity must be a positive number'),

});

export const paymentResultSchema = z.object({
    id: z.string(),//.min(1, 'Id is required'),
    status: z.string(),//.min(1, 'Status is required'),
    email_address: z.string(),//.email('Invalid Email Address'),
    pricePaid: z.string(),//.min(1, 'Price is required'),
});


//Schema for updating the user profile .
export const updateProfileSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().min(3, 'Email must be at least 3 characters'),
});

//Schema for updating the users
export const updateUserSchema = updateProfileSchema.extend({
    id: z.string(),
    role: z.string(),
    imageUrl: z.string().optional(),
    phoneNumber: phoneNumberSchema,
});

//Schema for inserting a review
export const insertReviewSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    userId: z.string().min(1, 'User is required'),
    rating: z.coerce
      .number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
});

export const placeOrderSchema = z.object({
    itemsPrice: z.number(),
    shippingPrice: z.number(),
    taxPrice: z.number(),
    totalPrice: z.number(),
});