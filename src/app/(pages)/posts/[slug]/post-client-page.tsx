
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
import PostActions from '@/components/post-actions';
import CommentSection from '@/components/comment-section';
import AboutTheAuthor from '@/components/about-the-author';
import { cn } from '@/lib/utils';

// Local storage keys
const READING_PROGRESS_KEY = 'reading_progress';

interface PostClientPageProps {
  post: Post;
  relatedPosts: Post[];
  initialComments: CommentType[];
}

export default function PostClientPage({ post, relatedPosts, initialComments }: PostClientPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Restore reading progress
  useEffect(() => {
    const readingProgress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
    const scrollPosition = readingProgress[post.slug];
    if (typeof scrollPosition === 'number') {
        setTimeout(() => window.scrollTo(0, scrollPosition), 100);
    }
  }, [post.slug]);

  // Reading progress saving logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
        if (contentRef.current) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const bookmarkedPosts = JSON.parse(localStorage.getItem('bookmarked_posts') || '{}');
                // Only save progress for bookmarked posts
                if (bookmarkedPosts[post.slug]) {
                    const readingProgress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
                    readingProgress[post.slug] = window.scrollY;
                    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(readingProgress));
                }
            }, 250); // Debounce scroll event
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeout);
    };
  }, [post.slug]);

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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-10 max-w-4xl" ref={contentRef}>
        <article>
          <header className="mb-8">
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
          
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              data-ai-hint="blog cover"
            />
          </div>

          <div 
            className="prose prose-invert prose-xl max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg font-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <Separator className="my-12" />
          
        </article>

        <AboutTheAuthor />

        <Separator className="my-12" />

        <CommentSection postId={post.id} initialComments={initialComments} />

        {relatedPosts.length > 0 && (
          <>
            <Separator className="my-12" />
            <section>
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
