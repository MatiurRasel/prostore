import {
    Card,
    CardContent,
    CardHeader,
  } from '@/components/ui/card';
  import { Metadata } from 'next';
  import Link from 'next/link';
  import Image from 'next/image';
  import { APP_NAME } from '@/lib/constants';
  import CredentialsSignInForm from './credentials-signin-form';
  import { auth } from '@/auth';
  import { redirect } from 'next/navigation';
  
  export const metadata: Metadata = {
    title: 'Sign In',
  };
  
  const SignInPage = async (props: {
    searchParams: Promise<{
      callbackUrl: string;
    }>;
  }) => {
    const { callbackUrl } = await props.searchParams;
  
    const session = await auth();
  
    if (session) {
      return redirect(callbackUrl || '/');
    }
  
    return (
      <div className='min-h-[80vh] flex items-center justify-center p-4'>
        <div className='w-full max-w-md mx-auto'>
          <Card className="border-none shadow-lg">
            <CardHeader className='space-y-6'>
              <Link 
                href='/' 
                className='flex justify-center hover:scale-105 transition-transform duration-300'
              >
                <Image
                  src='/images/logo.svg'
                  width={64}
                  height={64}
                  alt={`${APP_NAME} logo`}
                  priority={true}
                  className="drop-shadow-lg"
                />
              </Link>

            </CardHeader>
            <CardContent>
              <CredentialsSignInForm />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  export default SignInPage;