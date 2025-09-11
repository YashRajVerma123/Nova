
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X, Bookmark } from 'lucide-react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import NotificationBell from '@/components/notification-bell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SearchBar from '@/components/search-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/bulletin', label: 'Bulletin' },
  { href: '/about', label: 'About' },
];

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        'py-3 bg-background/80 backdrop-blur-lg border-b border-border/10'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                     <Link
                        href={link.href}
                        className={cn(
                          'text-sm font-medium transition-colors hover:text-primary',
                          pathname === link.href ? 'text-primary' : 'text-foreground/80'
                        )}
                      >
                        {link.label}
                      </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center gap-1">
               <nav className="flex items-center gap-0">
                  {navLinks.map((link) => (
                    <Button key={link.href} asChild variant="ghost" className={cn(pathname === link.href && 'text-primary')}>
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
              </nav>
            </div>
             <SearchBar />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="icon" className={cn(pathname === '/bookmarks' && 'text-primary')}>
                <Link href="/bookmarks">
                    <Bookmark className="h-5 w-5"/>
                    <span className="sr-only">Bookmarks</span>
                </Link>
            </Button>
            <NotificationBell />
            <div className="hidden md:flex">
              <UserNav />
            </div>
             <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm bg-background/95 backdrop-blur-xl p-0">
                   <div className="flex flex-col h-full">
                      <div className="flex justify-between items-center p-6 border-b border-border/10">
                        <div className="[&>a]:text-foreground">
                          <Logo />
                        </div>
                      </div>
                      <nav className="flex flex-col items-start gap-2 p-6">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              'text-2xl font-medium transition-colors hover:text-primary w-full p-3 rounded-md',
                              pathname === link.href ? 'text-primary bg-secondary' : 'text-foreground/80'
                            )}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </nav>
                      <div className="mt-auto p-6 border-t border-border/10">
                          <UserNav />
                      </div>
                   </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
