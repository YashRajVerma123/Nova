'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserNav from '@/components/user-nav';
import NotificationBell from '@/components/notification-bell';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact Us' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/posts?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/posts');
    }
  };


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
          <Logo />
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

        <div className="hidden md:flex items-center gap-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input 
                type="search" 
                placeholder="Search articles..." 
                className="pr-10 h-9 w-40 lg:w-64 bg-secondary" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </form>
          <NotificationBell />
          <UserNav />
        </div>

        <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <UserNav />
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-background/95 backdrop-blur-xl">
                 <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                      <Logo />
                       <SheetTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                          </Button>
                       </SheetTrigger>
                    </div>
                    <nav className="flex flex-col items-start gap-6">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'text-xl font-medium transition-colors hover:text-primary',
                            pathname === link.href ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto">
                      <form onSubmit={handleSearch} className="relative">
                        <Input 
                          type="search" 
                          placeholder="Search..." 
                          className="pr-10 h-10 w-full bg-secondary"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                         />
                         <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Search className="h-5 w-5 text-muted-foreground" />
                         </button>
                      </form>
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
