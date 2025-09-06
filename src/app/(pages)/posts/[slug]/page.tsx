
'use client';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { posts, Post, Comment, Author } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommentSection from '@/components/comment-section';
import { Button } from '@/components/ui/button';
import BlogPostCard from '@/components/blog-post-card';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { addComment, addReply, deleteComment, deleteReply, updateComment, updateReply } from '@/app/actions/comment-actions';
import { useToast } from '@/hooks/use-toast';

const PostPage = ({ params }: { params: { slug: string } }) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // This useEffect correctly handles finding the post based on params
  // and setting all related state.
  useEffect(() => {
    const currentPost = posts.find(p => p.slug === params.slug);
    if (currentPost) {
      setPost(currentPost);
      setComments(currentPost.comments);
      setLikeCount(currentPost.comments.reduce((acc, c) => acc + c.likes, 0) + 15); // mock likes
      
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (likedPosts[currentPost.slug]) {
        setLiked(true);
      }
    } else {
        // If post not found after client-side check, trigger notFound
        notFound();
    }
  }, [params.slug]);
  
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts.filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag))).slice(0, 3);
  }, [post]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  const handleLike = () => {
    if (!post) return;
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    if (newLikedState) {
      likedPosts[post.slug] = true;
    } else {
      delete likedPosts[post.slug];
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  };
  
  const handleCommentClick = () => {
    document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    if (!post) return;
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
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const handleAddComment = async (content: string) => {
    if (!post || !user) return;
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      author: user,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    setComments(prev => [optimisticComment, ...prev]);
    try {
      const newComments = await addComment(post.slug, content, user.id);
      setComments(newComments);
      toast({ title: 'Comment posted!' });
    } catch {
      toast({ title: 'Failed to post comment.', variant: 'destructive' });
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    if (!post || !user) return;
    const newComments = await addReply(post.slug, parentCommentId, content, user.id);
    setComments(newComments);
    toast({ title: 'Reply posted!' });
  };

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    if (!post) return;
    const newComments = await updateComment(post.slug, commentId, newContent);
    setComments(newComments);
    toast({ title: 'Comment updated!' });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    const newComments = await deleteComment(post.slug, commentId);
    setComments(newComments);
    toast({ title: 'Comment deleted.' });
  };
  
  const handleUpdateReply = async (commentId: string, replyId: string, newContent: string) => {
    if (!post) return;
    const newComments = await updateReply(post.slug, commentId, replyId, newContent);
    setComments(newComments);
    toast({ title: 'Reply updated!' });
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!post) return;
    const newComments = await deleteReply(post.slug, commentId, replyId);
    setComments(newComments);
    toast({ title: 'Reply deleted.' });
  };


  const handleLikeComment = useCallback((commentId: string, isLiked: boolean) => {
    // This is a client-side only like for now
    const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
    if (isLiked) {
        likedComments[commentId] = true;
    } else {
        delete likedComments[commentId];
    }
    localStorage.setItem('likedComments', JSON.stringify(likedComments));

    const updateLikes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
            let newLikes = comment.likes;
            if (comment.id === commentId) {
                // This logic is simplified; a real app would prevent double-liking
                newLikes = isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1);
            }
            return {
                ...comment,
                likes: newLikes,
                replies: comment.replies ? updateLikes(comment.replies) : [],
            };
        });
    };
    setComments(prev => updateLikes(prev));
  }, []);

  const handleTagClick = (tag: string) => {
    router.push(`/posts?q=${encodeURIComponent(tag)}`);
  };
  
  if (!post) {
    // Render a loading state or skeleton while the post is being found.
    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
                <div className="aspect-video bg-muted rounded-xl mb-8"></div>
                <div className="space-y-4">
                    <div className="h-6 bg-muted rounded w-full"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                    <div className="h-6 bg-muted rounded w-2/3"></div>
                </div>
            </div>
        </div>
    );
  }

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
                 <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleTagClick(tag)}>{tag}</Badge>
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

        <CommentSection 
            comments={comments} 
            user={user}
            isAdmin={isAdmin}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onUpdateReply={handleUpdateReply}
            onDeleteReply={handleDeleteReply}
            onLikeComment={handleLikeComment}
        />

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
