
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/app/actions/comment-actions';
import { posts, Comment } from '@/lib/data';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface CommentSectionProps {
  postSlug: string;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const post = posts.find(p => p.slug === postSlug);
  const [comments, setComments] = useState<Comment[]>(post?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn } = useAuth();
  const { toast } = useToast();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
        toast({
            title: 'Please sign in',
            description: 'You need to be signed in to post a comment.',
            action: <Button onClick={signIn}>Sign In</Button>
        })
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await addComment(postSlug, newComment, user);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if(result.comment){
        setComments(prev => [result.comment!, ...prev]);
        setNewComment('');
      }

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Failed to post comment. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-3xl font-headline font-bold mb-8">Comments ({comments.length})</h2>
      <div className="glass-card p-6">
        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <Textarea
                    placeholder="Add your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                />
            </div>
            <Button type="submit" className="self-end" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You must be signed in to leave a comment.</p>
            <Button onClick={signIn}>Sign In to Comment</Button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-muted-foreground mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
