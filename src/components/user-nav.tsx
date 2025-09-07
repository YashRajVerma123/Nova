'use client';
import { CreditCard, LogOut, User as UserIcon, Upload } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

// This is the main component for the header.
const UserNav = () => {
  const { user, signIn, signOut, loading, updateUserProfile, uploadAvatar } = useAuth();
  const [isSignInOpen, setSignInOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.name || '');
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleSignIn = async () => {
    try {
      await signIn();
      setSignInOpen(false);
    } catch (error) {
      console.error('Sign in failed', error);
      toast({
        title: 'Sign In Failed',
        description: 'Could not sign you in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUsername.trim()) return;

    setIsUploading(true);
    try {
      let newAvatarUrl = user.avatar;
      if (newAvatarFile) {
        newAvatarUrl = await uploadAvatar(newAvatarFile, user.id);
      }
      
      await updateUserProfile({ name: newUsername.trim(), avatar: newAvatarUrl });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setNewAvatarFile(null);
      setProfileOpen(false);
    } catch (error) {
      console.error('Profile update failed', error);
       toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
   // Update local state if user object changes (e.g. after login)
  useState(() => {
    if (user) {
      setNewUsername(user.name);
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatarFile(e.target.files[0]);
    }
  }

  if (loading) {
    return <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };

  const previewUrl = newAvatarFile ? URL.createObjectURL(newAvatarFile) : user?.avatar;

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setSignInOpen(true)}>
          Sign In
        </Button>
        <Dialog open={isSignInOpen} onOpenChange={setSignInOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                To continue to Nova, sign in with your Google account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSignIn} className="w-full">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C297.1 114.5 273.5 104 248 104c-73.8 0-134.3 60.5-134.3 134.3s60.5 134.3 134.3 134.3c84.1 0 115.3-63.8 119.9-95.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Sign in with Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
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
            <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {isAdmin && (
               <DropdownMenuItem onSelect={() => window.location.href='/admin'}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate}>
            <div className="grid gap-4 py-4">
               <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl} alt={newUsername} />
                    <AvatarFallback>{getInitials(newUsername)}</AvatarFallback>
                  </Avatar>
                  <Input 
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserNav;
