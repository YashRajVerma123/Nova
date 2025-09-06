'use client';
import { CreditCard, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';

// This is a mock sign in page component.
const SignInPage = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  
  const handleSignIn = () => {
    // In a real app, this would open a Google Auth popup.
    // For this demo, we'll simulate signing in with the admin user.
    signIn('yashrajverma916@gmail.com');
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button onClick={handleSignIn}>Sign in with Google</Button>
    </div>
  );
};

// This is the main component for the header.
const UserNav = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />;
  }

  if (!user) {
    // In a real app, this link would go to a dedicated sign-in page.
    // For this demo, we will just simulate the sign in flow by refreshing.
    // A proper implementation would use NextAuth.js or similar.
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/#signin-simulation')}>
        Sign In
      </Button>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
