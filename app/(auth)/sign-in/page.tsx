import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import CredentialsSignInForm from './credentials-signin-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Sign In' };

const SignInPage = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  if (session) return redirect(callbackUrl || '/');

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="rounded-2xl shadow-xl border-none bg-white/90 dark:bg-[#0f172a]/90 max-h-[90vh] overflow-auto">
        <CardContent className="py-10 px-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link href="/">
              <Image
                src="/images/logo.svg"
                width={56}
                height={56}
                alt={`${APP_NAME} logo`}
                className="mb-2"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to {APP_NAME}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Please enter your details.</p>
          </div>
          <CredentialsSignInForm />
          <div className="text-center text-xs text-gray-400 mt-2">
            <span>Don&apos;t have an account? </span>
            <Link href="/sign-up" className="text-primary font-medium hover:underline">Sign Up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;