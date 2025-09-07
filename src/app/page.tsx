
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getPosts } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const posts = getPosts();
  const featuredPosts = posts.filter(p => p.featured);
  const recentPosts = posts
    .filter(p => !p.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center pt-16 md:pt-24">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter mb-6">
            Cutting through the noise.
            <br />
            <span className="text-primary">Delivering clarity.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Your essential destination for making sense of today. Sharp, focused journalism for the modern reader.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/posts">
                Explore Articles <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">Featured Stories</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredPosts.map((post, index) => (
              <CarouselItem key={post.slug} className="md:basis-1/2 lg:basis-1/3">
                 <div className="p-1">
                    <BlogPostCard post={post} priority={index === 0} />
                 </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </section>

      <Separator className="container mx-auto bg-border/10"/>

      {/* Recent Posts Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">Recent News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
            ))}
        </div>
        <div className="text-center mt-12">
            <Button asChild variant="outline">
                <Link href="/posts">View All Posts</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
