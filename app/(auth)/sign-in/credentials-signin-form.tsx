'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInDefaultValues } from '@/lib/constants';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AtSign, Lock } from 'lucide-react';

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: '',
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignInButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button 
        disabled={pending} 
        className='w-full rounded-full transition-all duration-300 hover:scale-[1.02]' 
        variant='default'
        size="lg"
      >
        {pending ? 'Signing In...' : 'Sign In'}
      </Button>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <input type='hidden' name='callbackUrl' value={callbackUrl} />
          
          <div className='space-y-2'>
            <Label htmlFor='email' className="text-sm font-medium">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                defaultValue={signInDefaultValues.email}
                className="pl-10 rounded-lg"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password' className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                defaultValue={signInDefaultValues.password}
                className="pl-10 rounded-lg"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className='space-y-4'>
            <SignInButton />
            
            {data && !data.success && data.message && (
              <div className='text-center text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg'>
                {data.message}
              </div>
            )}

            <div className='text-sm text-center text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link 
                href='/sign-up' 
                target='_self' 
                className='text-primary font-medium hover:underline transition-all duration-300'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CredentialsSignInForm;