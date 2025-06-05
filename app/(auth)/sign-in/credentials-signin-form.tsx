'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInDefaultValues } from '@/lib/constants';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';
import { AtSign, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingButton from '@/components/ui/loading-button';

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { toast } = useToast();

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <LoadingButton 
        type="submit"
        isLoading={pending}
        loadingText="Signing In..."
        className="w-full rounded-full transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
        variant="default"
        size="lg"
      >
        Sign In
      </LoadingButton>
    );
  };

  const handleClientValidation = (e: React.FormEvent<HTMLFormElement>) => {
    if (!emailValue.trim() || !passwordValue.trim()) {
      e.preventDefault();
      toast({
        title: 'Sign In Error',
        description: 'Please fill in both email and password.',
        variant: 'destructive',
      });
      return;
    }
  };

  return (
    <form action={action} className="space-y-6" autoComplete="on" onSubmit={handleClientValidation}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <AtSign 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                emailFocused || emailValue
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={signInDefaultValues.email}
              className="pl-10 rounded-lg h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
              placeholder="Enter your email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onChange={e => setEmailValue(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                passwordFocused || passwordValue
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              defaultValue={signInDefaultValues.password}
              className="pl-10 pr-10 rounded-lg h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
              placeholder="Enter your password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onChange={e => setPasswordValue(e.target.value)}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <SignInButton />
        {data && !data.success && data.message && (
          <div className="text-center text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">
            {data.message}
          </div>
        )}
      </div>
    </form>
  );
};

export default CredentialsSignInForm;