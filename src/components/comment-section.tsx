
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addComment, toggleCommentLike } from '@/app/actions/comment-actions';
import { posts, Comment as CommentType, Author } from '@/lib/data';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CommentSectionProps {
  postSlug: string;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const LIKED_COMMENTS_STORAGE_KEY = 'likedComments';

// Sub-component for submitting a comment or reply
const CommentForm = ({ 
    postSlug, 
    onCommentAdded, 
    parentId = null,
    buttonText = "Post Comment"
}: { 
    postSlug: string, 
    onCommentAdded: (newComment: CommentType) => void,
    parentId?: string | null,
    buttonText?: string
}) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, signIn } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        if (!user) {
            toast({
                title: 'Please sign in',
                description: 'You need to be signed in to post a comment.',
                action: <Button onClick={signIn}>Sign In</Button>
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addComment(postSlug, comment, user, parentId);
            if (result.error) throw new Error(result.error);
            if (result.comment) {
                onCommentAdded(result.comment);
                setComment('');
            }
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Failed to post comment.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
     if (!user) return null;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <Textarea
                    placeholder={parentId ? "Write a reply..." : "Add your comment..."}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                />
            </div>
            <Button type="submit" className="self-end" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : buttonText}
            </Button>
        </form>
    )
}

// Sub-component for rendering a single comment and its replies
const Comment = ({ 
    comment, 
    postSlug, 
    onReply,
    likedComments,
    onLikeToggle
}: { 
    comment: CommentType, 
    postSlug: string,
    onReply: (newReply: CommentType, parentId: string) => void,
    likedComments: { [key: string]: boolean },
    onLikeToggle: (commentId: string) => void
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const isLiked = likedComments[comment.id] || false;

    const handleLikeClick = () => {
        onLikeToggle(comment.id);
        toggleCommentLike(postSlug, comment.id);
    }

    return (
       <div className="flex items-start gap-4">
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
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <button onClick={handleLikeClick} className={cn("flex items-center gap-1 hover:text-primary", { 'text-red-500': isLiked })}>
                      <Heart className={cn("h-4 w-4", { 'fill-current': isLiked })} />
                      <span>{comment.likes}</span>
                  </button>
                  <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1 hover:text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span>Reply</span>
                  </button>
              </div>

              {showReplyForm && (
                  <div className="mt-4">
                      <CommentForm 
                          postSlug={postSlug}
                          parentId={comment.id}
                          buttonText="Post Reply"
                          onCommentAdded={(newReply) => {
                            onReply(newReply, comment.id);
                            setShowReplyForm(false);
                          }}
                      />
                  </div>
              )}
              
              {comment.replies && comment.replies.length > 0 && (
                 <Collapsible className="mt-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="link" className="p-0 h-auto text-xs">View {comment.replies.length} replies</Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-6 border-l-2 pl-6">
                       {comment.replies.map(reply => (
                           <Comment 
                                key={reply.id} 
                                comment={reply} 
                                postSlug={postSlug}
                                onReply={onReply}
                                likedComments={likedComments}
                                onLikeToggle={onLikeToggle}
                            />
                       ))}
                    </CollapsibleContent>
                 </Collapsible>
              )}
            </div>
          </div>
    )
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const post = useMemo(() => posts.find(p => p.slug === postSlug), [postSlug]);
  const [comments, setComments] = useState<CommentType[]>(post?.comments || []);
  const [likedComments, setLikedComments] = useState<{ [key: string]: boolean }>({});
  const { user, signIn } = useAuth();
  
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem(LIKED_COMMENTS_STORAGE_KEY) || '{}');
    setLikedComments(storedLikes[postSlug] || {});
  }, [postSlug]);

  const handleLikeToggle = (commentId: string) => {
    setLikedComments(prev => {
        const newLikedState = !prev[commentId];
        const newLikes = { ...prev, [commentId]: newLikedState };
        
        const allStoredLikes = JSON.parse(localStorage.getItem(LIKED_COMMENTS_STORAGE_KEY) || '{}');
        allStoredLikes[postSlug] = newLikes;
        localStorage.setItem(LIKED_COMMENTS_STORAGE_KEY, JSON.stringify(allStoredLikes));

        // Optimistically update the like count on the comment
        const updateLikes = (list: CommentType[]): CommentType[] => {
            return list.map(c => {
                if (c.id === commentId) {
                    return { ...c, likes: c.likes + (newLikedState ? 1 : -1) };
                }
                if (c.replies) {
                    return { ...c, replies: updateLikes(c.replies) };
                }
                return c;
            });
        };
        setComments(updateLikes);

        return newLikes;
    });
  }

  const addCommentToState = (newComment: CommentType) => {
      setComments(prev => [newComment, ...prev]);
  }
  
  const addReplyToState = (newReply: CommentType, parentId: string) => {
      const addReplyRecursively = (list: CommentType[]): CommentType[] => {
          return list.map(comment => {
              if (comment.id === parentId) {
                  return { ...comment, replies: [newReply, ...comment.replies] };
              }
              if (comment.replies && comment.replies.length > 0) {
                  return { ...comment, replies: addReplyRecursively(comment.replies) };
              }
              return comment;
          });
      };
      setComments(prev => addReplyRecursively(prev));
  }
  
  return (
    <section>
      <h2 className="text-3xl font-headline font-bold mb-8">Comments ({comments.length})</h2>
      <div className="glass-card p-6">
        {user ? (
          <CommentForm postSlug={postSlug} onCommentAdded={addCommentToState} />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You must be signed in to leave a comment.</p>
            <Button onClick={signIn}>Sign In to Comment</Button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {comments.map((comment) => (
          <Comment 
            key={comment.id} 
            comment={comment}
            postSlug={postSlug}
            onReply={addReplyToState}
            likedComments={likedComments}
            onLikeToggle={handleLikeToggle}
          />
        ))}
      </div>
    </section>
  );
}
