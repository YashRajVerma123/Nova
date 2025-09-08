import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="text-3xl font-bold font-headline tracking-tighter text-foreground transition-opacity hover:opacity-80">
      Nova<span className="text-primary">.</span>
    </Link>
  );
};

export default Logo;
