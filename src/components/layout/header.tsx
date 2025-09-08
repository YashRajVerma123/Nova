
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import NotificationBell from '@/components/notification-bell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SearchBar from '@/components/search-bar';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/bulletin', label: 'Bulletin' },
  { href: '/about', label: 'About' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        scrolled ? 'py-3 bg-background/80 backdrop-blur-lg border-b border-border/10' : 'py-5 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="[&>a]:text-foreground">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           <div className="hidden sm:block">
            <SearchBar />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell />
            <UserNav />
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1">
            <SearchBar />
            <NotificationBell />
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
    </header>
  );
};

export default Header;
