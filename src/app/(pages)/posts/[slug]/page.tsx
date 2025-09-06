'use client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { posts, Post, Comment } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommentSection from '@/components/comment-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import BlogPostCard from '@/components/blog-post-card';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useMemo } from 'react';

const PostPage = ({ params }: { params: { slug: string } }) => {
  const { user } = useAuth();
  const post = useMemo(() => posts.find(p => p.slug === params.slug), [params.slug]);
  const [comments, setComments] = useState<Comment[]>(post?.comments || []);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (post) {
      // In a real app, you'd fetch like count and user's like status from a DB
      setLikeCount(post.comments.reduce((acc, c) => acc + c.likes, 0) + 15); // mock likes
    }
  }, [post]);
  
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts.filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag))).slice(0, 3);
  }, [post]);

  if (!post) {
    return notFound();
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };
  
  const handleCommentClick = () => {
    document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddComment = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    // In a real app, you would also persist this comment to your database
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
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
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
            className="prose prose-invert prose-lg max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="my-10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLike}>
                <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {likeCount}
              </Button>
               <Button variant="outline" size="sm" onClick={handleCommentClick}>
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>{comments.length}</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

        </article>

        <Separator className="my-12" />

        <CommentSection comments={comments} user={user} onAddComment={handleAddComment} />

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
    </>
  );
};

export default PostPage;
