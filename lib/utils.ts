import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from 'query-string';
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { CartItem } from '@/types';
//Conditionally join classNames together
// This is useful for conditionally applying classNames to elements
// based on certain conditions or props.
// It takes an array of classNames and merges them into a single string
// while removing any duplicates or conflicting styles.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//Convert prisma object into a regular JS Object
// This is useful when you want to serialize the object or send it over the network
// because Prisma objects can have circular references or other non-serializable properties.
// The function uses JSON.stringify to convert the object to a JSON string
// and then parses it back to a regular JavaScript object using JSON.parse.

export function convertToPlainObject<T>(value: T) : T {
  return JSON.parse(JSON.stringify(value));
}

//FORMAT number with decimal places
// This function takes a number as input and formats it to always have two decimal places.
// It does this by splitting the number into its integer and decimal parts
// and then padding the decimal part with zeros if necessary.
// For example, if the input is 123.4, it will return '123.40', and if the input is 123,
// it will return '123.00'.

export function formatNumberWithDecimal(num: number): string {
  const [int,decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2,'0')}` : `${int}.00`;
}

//Add calcPrice function here
//Calculate cart prices
export const calcPrice = (items:CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc,item) => acc + Number(item.price) * item.qty,0)
    );
    const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
    const taxPrice = round2(0.15*itemsPrice);
    const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

    return {
        itemsPrice: itemsPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    }
}

//Format errors
// This function takes an error object as input and formats it into a user-friendly message.
// It checks the type of error and handles different cases, such as ZodError or PrismaClientKnownRequestError.
// For ZodError, it extracts the field errors and joins them into a single string.
// For PrismaClientKnownRequestError, it checks for a specific error code (P2002) and formats the message accordingly.
// For other errors, it simply returns the error message as a string.
// This is useful for displaying error messages to users in a consistent and readable format.

// type CustomError = ZodError | Prisma.PrismaClientKnownRequestError | Error | unknown;
// export async function formatError(error: CustomError): Promise<string> {
//   if (error instanceof ZodError) {
//     const fieldErrors = error.errors.map((err) => err.message);
//     return fieldErrors.join('. ');
//   } else if (
//     error instanceof Prisma.PrismaClientKnownRequestError &&
//     error.code === 'P2002'
//   ) {
//     const field = Array.isArray(error.meta?.target) && typeof error.meta?.target[0] === 'string'
//       ? error.meta.target[0]
//       : 'Field';
//     return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
//   } else if (error instanceof Error) {
//     return error.message;
//   } else {
//     return JSON.stringify(error);
//   }
// }

type CustomError = ZodError | Prisma.PrismaClientKnownRequestError | Error | unknown;
export function formatError(error: CustomError): string {
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((err) => err.message);
    return fieldErrors.join('. ');
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const field =
      Array.isArray(error.meta?.target) && typeof error.meta.target[0] === 'string'
        ? error.meta.target[0]
        : 'Field';

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
// export async function formatError(error: any) {
//   if(error.name === 'ZodError') {
//     //Handle Zod Error
//     const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);

//     return fieldErrors.join('. ')
//   } else if(error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
//     //handle prisma error
//     const field = error.meta?.target ? error.meta.target[0] : 'Field';
//     return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
//   } else {
//     //handle others error
//     return typeof error.message === 'string'
//       ? error.message
//       : JSON.stringify(error.message);
//   }
// }

//Round number to 2 decimal places
// This function takes a number or string as input and rounds it to two decimal places.
// It uses the Math.round function to perform the rounding.
// If the input is a number, it rounds it directly.
// If the input is a string, it converts it to a number first before rounding.
// If the input is neither a number nor a string, it throws an error.
// This is useful for ensuring that numerical values are consistently formatted to two decimal places,
// which is common in financial applications or when displaying prices.
 
export function round2(value: number |string) {
  if(typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100)/100;
  } else if(typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100)/100;
  } else {
    throw new Error('Value is not a number or string');
  }
 }

//  bn-BD
//Format currency
// This function formats a given number or string as a currency value.
// It uses the Intl.NumberFormat API to create a currency formatter for US dollars (USD).
// The formatter is configured to always show two decimal places.
// The function takes an amount as input, which can be a number, string, or null.
// If the amount is a number, it formats it directly.
// If the amount is a string, it converts it to a number first before formatting.
// If the amount is null, it returns an error.
// The function returns the formatted currency string.
// The formatter is created using the 'en-US' locale and the 'USD' currency.
// The minimumFractionDigits option is set to 2 to ensure that the formatted value always has two decimal places.
 
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
 });

 //Format currency using the formatter above
  // This function takes an amount as input, which can be a number, string, or null.
  // It uses the CURRENCY_FORMATTER to format the amount as a currency string.
  // If the amount is a number, it formats it directly.
  // If the amount is a string, it converts it to a number first before formatting.
  // If the amount is null, it returns an error.
  // The function returns the formatted currency string.
  // The formatter is created using the 'en-US' locale and the 'USD' currency.
  // The minimumFractionDigits option is set to 2 to ensure that the formatted value always has two decimal places.
 
  export function formatCurrency(amount: number | string | null): string {
    if (typeof amount === 'number') {
      return CURRENCY_FORMATTER.format(amount);
    } else if (typeof amount === 'string') {
      const num = Number(amount);
      return isNaN(num) ? 'Invalid amount' : CURRENCY_FORMATTER.format(num);
    } else {
      return 'Invalid amount';
    }
  }
  
  //Format Number
  const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

  export function formatNumber(number: number) {
    return NUMBER_FORMATTER.format(number);
  }

//Shorten UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

//Format the date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', //abbreviated month name (e.g., "Jan")
    year: 'numeric', //full numeric year (e.g., "2023")
    day:'numeric', //numeric day of the month (e.g., "15")
    hour:'numeric', //numeric hour (e.g., "3")
    minute:'numeric', //numeric minute (e.g., "45")
    second:'numeric', //numeric second (e.g., "30")
    hour12: true, //12-hour clock format (e.g., "3:45 PM")
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', //abbreviated weekday name (e.g., "Mon")
    month: 'short', //abbreviated month name (e.g., "Jan")
    year: 'numeric', //full numeric year (e.g., "2023")
    day: 'numeric', //numeric day of the month (e.g., "15")
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', //numeric hour (e.g., "3")
    minute: 'numeric', //numeric minute (e.g., "45")
    //second: 'numeric', //numeric second (e.g., "30")
    hour12: true, //12-hour clock format (e.g., "3:45 PM")
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };

};

// Form the pagination links
export function formUrlQuery({
  params,
  key, 
  value
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl({
    url:window.location.pathname,
    query,
  },{
    skipNull: true,
  });

}