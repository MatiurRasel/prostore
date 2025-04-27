import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

//Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// This function takes an error object as input and formats it into a user-friendly message.
// It checks the type of error and handles different cases, such as ZodError or PrismaClientKnownRequestError.
// For ZodError, it extracts the field errors and joins them into a single string.
// For PrismaClientKnownRequestError, it checks for a specific error code (P2002) and formats the message accordingly.
// For other errors, it simply returns the error message as a string.
// This is useful for displaying error messages to users in a consistent and readable format.
export async function formatError(error: any) {
  if(error.name === 'ZodError') {
    //Handle Zod Error
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);

    return fieldErrors.join('. ')
  } else if(error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    //handle prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    //handle others error
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

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
 export function formatCurrency(amount: number | string | null) {
  
  if (typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  } 
  else if (typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  } 
  else {
    return Error('NaN');
  }
}