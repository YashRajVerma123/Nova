
'use client';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { posts as initialPosts, Post, Comment } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, MessageCircle, Share2, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommentSection from '@/components/comment-section';
import { Button } from '@/components/ui/button';
import BlogPostCard from '@/components/blog-post-card';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { addComment, addReply, deleteComment, deleteReply, updateComment, updateReply } from '@/app/actions/comment-actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const PostPage = ({ params }: { params: { slug: string } }) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug;
  
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const post = useMemo(() => posts.find(p => p.slug === slug), [posts, slug]);
  const [liked, setLiked] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const [likeCount, setLikeCount] = useState(() => {
     const initialPost = initialPosts.find(p => p.slug === slug);
     return initialPost?.comments.reduce((acc, c) => acc + c.likes, 0) + 15 || 0;
  });


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    if (!post) return;
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    if (likedPosts[post.slug]) {
      setLiked(true);
    }
  }, [post, slug]);

  const updatePostState = (updatedPost: Post) => {
    const newPosts = posts.map(p => p.slug === updatedPost.slug ? updatedPost : p);
    setPosts(newPosts);
  }

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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: 'Link copied to clipboard!' });
  };

  const handleCommentClick = () => {
    document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleAddComment = async (content: string) => {
    if (!user || !post) {
        toast({ title: 'Please sign in to comment.', variant: 'destructive' });
        return;
    }
    try {
      const updatedPost = await addComment(post.slug, content, user.id);
      updatePostState(updatedPost);
      toast({ title: 'Comment posted!' });
    } catch (e) {
      toast({ title: 'Failed to post comment.', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    if (!user || !post) {
       toast({ title: 'Please sign in to reply.', variant: 'destructive' });
       return;
    }
    try {
        const updatedPost = await addReply(post.slug, parentCommentId, content, user.id);
        updatePostState(updatedPost);
        toast({ title: 'Reply posted!' });
    } catch (e) {
        toast({ title: 'Failed to post reply.', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    if (!post) return;
    try {
        const updatedPost = await updateComment(post.slug, commentId, newContent);
        updatePostState(updatedPost);
        toast({ title: 'Comment updated!' });
    } catch(e) {
        toast({ title: 'Failed to update comment.', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
        const updatedPost = await deleteComment(post.slug, commentId);
        updatePostState(updatedPost);
        toast({ title: 'Comment deleted.' });
    } catch (e) {
        toast({ title: 'Failed to delete comment.', description: (e as Error).message, variant: 'destructive' });
    }
  };
  
  const handleUpdateReply = async (commentId: string, replyId: string, newContent: string) => {
    if (!post) return;
    try {
        const updatedPost = await updateReply(post.slug, commentId, replyId, newContent);
        updatePostState(updatedPost);
        toast({ title: 'Reply updated!' });
    } catch (e) {
        toast({ title: 'Failed to update reply.', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!post) return;
    try {
        const updatedPost = await deleteReply(post.slug, commentId, replyId);
        updatePostState(updatedPost);
        toast({ title: 'Reply deleted.' });
    } catch (e) {
        toast({ title: 'Failed to delete reply.', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleLikeComment = useCallback((commentId: string) => {
    if (!post) return;
    const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
    const isLiked = !likedComments[commentId];
    
    if (isLiked) {
        likedComments[commentId] = true;
    } else {
        delete likedComments[commentId];
    }
    localStorage.setItem('likedComments', JSON.stringify(likedComments));

    const updateLikes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => ({
            ...comment,
            likes: comment.id === commentId ? (isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1)) : comment.likes,
            replies: comment.replies ? updateLikes(comment.replies) : [],
        }));
    };
    
    const updatedPost = {...post, comments: updateLikes(post.comments)};
    updatePostState(updatedPost);
  }, [post]);

  if (!post) {
      return notFound();
  }

  const relatedPosts = posts.filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag))).slice(0, 3);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
  };
  
  const handleTagClick = (tag: string) => {
    router.push(`/posts?q=${encodeURIComponent(tag)}`);
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
                <span>{post.comments.length}</span>
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share this post</DialogTitle>
                  <DialogDescription>
                    Anyone with this link will be able to view this post.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      id="link"
                      defaultValue={currentUrl}
                      readOnly
                    />
                  </div>
                  <Button type="button" size="icon" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </article>

        <Separator className="my-12" />

        <CommentSection 
            comments={post.comments} 
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
