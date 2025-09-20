
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post, Comment as CommentType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BlogPostCard from '@/components/blog-post-card';
import CommentSection from '@/components/comment-section';
import AboutTheAuthor from '@/components/about-the-author';
import PostActions from '@/components/post-actions';
import { useAuth } from '@/hooks/use-auth';
import { updateReadingProgress } from '@/app/actions/user-data-actions';
import { useDynamicTheme } from '@/contexts/dynamic-theme-context';

interface PostClientPageProps {
  post: Post;
  relatedPosts: Post[];
  initialComments: CommentType[];
}

export default function PostClientPage({ post, relatedPosts, initialComments }: PostClientPageProps) {
  const { user, bookmarks } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const isBookmarked = bookmarks[post.id];
  const { setTheme, resetTheme } = useDynamicTheme();
  
  useEffect(() => {
    // Set theme based on the first tag
    if (post.tags && post.tags.length > 0) {
      setTheme(post.tags[0]);
    }

    // Cleanup function to reset theme when component unmounts
    return () => {
      resetTheme();
    };
  }, [post.tags, setTheme, resetTheme]);

  // Restore reading progress
  useEffect(() => {
    if (isBookmarked) {
        const scrollPosition = bookmarks[post.id]?.scrollPosition;
        if (typeof scrollPosition === 'number') {
            setTimeout(() => window.scrollTo(0, scrollPosition), 100);
        }
    }
  }, [post.id, isBookmarked, bookmarks]);

  // Reading progress saving logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
        if (contentRef.current && user && isBookmarked) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Only save progress for bookmarked posts by logged-in users
                updateReadingProgress(user.id, post.id, window.scrollY);
            }, 250); // Debounce scroll event
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeout);
    };
  }, [post.id, user, isBookmarked]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
  };
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://theglare.netlify.app/posts/${post.slug}`,
    },
    publisher: {
        '@type': 'Organization',
        name: 'Glare',
        logo: {
            '@type': 'ImageObject',
            url: 'https://theglare.netlify.app/logo.png', // Replace with your actual logo URL
        },
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.max(5 * ( (post.likes || 0) / 100), 3.5).toFixed(1), // Mock rating based on likes
        reviewCount: (post.likes || 0) + initialComments.length,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-10 max-w-4xl" ref={contentRef}>
        <article>
          <header className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                    <Link href={`/posts?q=${encodeURIComponent(tag)}`} key={tag}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">{tag}</Badge>
                    </Link>
                ))}
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              <Separator orientation="vertical" className="h-4"/>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </header>
          
          <div 
            className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-lg animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              data-ai-hint="blog post header"
            />
          </div>

          <div 
            className="prose prose-invert prose-xl max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg font-content animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <Separator className="my-12" />
          
        </article>

        <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <AboutTheAuthor />
        </div>

        <Separator className="my-12" />

        <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <CommentSection postId={post.id} initialComments={initialComments} />
        </div>

        {relatedPosts.length > 0 && (
          <>
            <Separator className="my-12" />
            <section className="animate-fade-in-up" style={{animationDelay: '1s'}}>
              <h2 className="text-3xl font-headline font-bold mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map(relatedPost => (
                  <BlogPostCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <PostActions post={post} />
    </>
  );
};
