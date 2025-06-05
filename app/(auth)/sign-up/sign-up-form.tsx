'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpDefaultValues } from '@/lib/constants';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpUser } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';
import { AtSign, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingButton from '@/components/ui/loading-button';

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });
  const [nameFocused, setNameFocused] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const confirmToastShown = useRef(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (data && !data.success && data.message) {
      toast({
        title: 'Sign Up Error',
        description: data.message,
        variant: 'destructive',
      });
    }
  }, [data, toast]);

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <LoadingButton 
        type="submit"
        isLoading={pending}
        loadingText="Creating Account..."
        className="w-full rounded-full transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
        variant="default"
        size="lg"
      >
        Sign Up
      </LoadingButton>
    );
  };

  // Show toast on blur if passwords do not match
  const handleConfirmBlur = () => {
    setConfirmFocused(false);
    if (
      passwordValue &&
      confirmValue &&
      passwordValue !== confirmValue &&
      !confirmToastShown.current
    ) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      confirmToastShown.current = true;
    }
    if (passwordValue === confirmValue) {
      confirmToastShown.current = false;
    }
  };

  // On submit, check for match
  const handleClientValidation = (e: React.FormEvent<HTMLFormElement>) => {
    if (!nameValue.trim() || !emailValue.trim() || !passwordValue.trim() || !confirmValue.trim()) {
      e.preventDefault();
      toast({
        title: 'Sign Up Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    if (passwordValue !== confirmValue) {
      e.preventDefault();
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
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
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${nameFocused || nameValue ? 'text-primary' : 'text-gray-400'}`} />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={signUpDefaultValues.name}
              className="pl-10 rounded-lg h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
              placeholder="Enter your full name"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              onChange={e => setNameValue(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <AtSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${emailFocused || emailValue ? 'text-primary' : 'text-gray-400'}`} />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={signUpDefaultValues.email}
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
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${passwordFocused || passwordValue ? 'text-primary' : 'text-gray-400'}`} />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              defaultValue={signUpDefaultValues.password}
              className="pl-10 pr-10 rounded-lg h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
              placeholder="Create a password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${confirmFocused || confirmValue ? 'text-primary' : 'text-gray-400'}`} />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              defaultValue={signUpDefaultValues.confirmPassword}
              className="pl-10 pr-10 rounded-lg h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary"
              placeholder="Confirm your password"
              onFocus={() => setConfirmFocused(true)}
              onBlur={handleConfirmBlur}
              onChange={e => setConfirmValue(e.target.value)}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <SignUpButton />
      </div>
    </form>
  );
};

export default SignUpForm;