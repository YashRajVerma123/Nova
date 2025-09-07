
'use client';

import { useState, useEffect, useMemo, useRef, KeyboardEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addComment, toggleCommentLike, updateComment, deleteComment, toggleCommentHighlight, toggleCommentPin } from '@/app/actions/comment-actions';
import { Comment as CommentType, Author, getPost } from '@/lib/data';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageSquare, MoreHorizontal, Trash2, Edit, Pin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';

interface CommentSectionProps {
  postSlug: string;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const LIKED_COMMENTS_STORAGE_KEY = 'likedComments';

const sortComments = (commentList: CommentType[]) => {
    return [...commentList].sort((a,b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Sub-component for submitting a comment or reply
const CommentForm = ({ 
    postSlug, 
    onCommentAdded, 
    parentId = null,
    buttonText = "Post Comment",
    initialContent = '',
    onCancel,
    isEditing = false,
    commentId,
}: { 
    postSlug: string, 
    onCommentAdded: (newComment: CommentType) => void,
    parentId?: string | null,
    buttonText?: string,
    initialContent?: string,
    onCancel?: () => void,
    isEditing?: boolean,
    commentId?: string,
}) => {
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAdmin, signIn } = useAuth();
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (isEditing) {
            textareaRef.current?.focus();
            textareaRef.current?.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    const handleSubmit = async () => {
        if (!content.trim()) return;

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
            if (isEditing && commentId) {
                const result = await updateComment(postSlug, commentId, content, user.id, isAdmin);
                if (result.error) throw new Error(result.error);
                if (result.success && result.updatedComment) {
                    onCommentAdded(result.updatedComment);
                }
            } else {
                const result = await addComment(postSlug, content, user, parentId);
                if (result.error) throw new Error(result.error);
                if (result.comment) {
                    onCommentAdded(result.comment);
                    setContent('');
                }
            }
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'An error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
            if (onCancel) onCancel();
        }
    };
    
     if (!user) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
                {!isEditing && (
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                )}
                <Textarea
                    ref={textareaRef}
                    placeholder={parentId ? "Write a reply..." : "Add your comment..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className={isEditing ? 'ml-14' : ''}
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : buttonText}
                </Button>
            </div>
        </div>
    )
}

// Sub-component for rendering a single comment and its replies
const Comment = ({ 
    comment, 
    postSlug, 
    onReply,
    onUpdate,
    onDelete,
    onAdminAction,
    likedComments,
    onLikeToggle
}: { 
    comment: CommentType, 
    postSlug: string,
    onReply: (newReply: CommentType, parentId: string) => void,
    onUpdate: (updatedComment: CommentType) => void,
    onDelete: (commentId: string) => void,
    onAdminAction: (updatedComment: CommentType) => void,
    likedComments: { [key: string]: boolean },
    onLikeToggle: (commentId: string, isLiked: boolean) => void
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { user, isAdmin } = useAuth();

    const isLiked = likedComments[comment.id] || false;
    const canModify = user && (user.id === comment.author.id || isAdmin);

    const handleLikeClick = async () => {
        const result = await toggleCommentLike(postSlug, comment.id, isLiked);
        if (result.success) {
            onLikeToggle(comment.id, isLiked);
        }
    }
    
    const handleDelete = async () => {
        if (!canModify || !user) return;
        const result = await deleteComment(postSlug, comment.id, user.id, isAdmin);
        setDeleteDialogOpen(false);
        if(result.success) {
            onDelete(comment.id);
        }
    }

    const handleHighlight = async () => {
        if (!isAdmin) return;
        const result = await toggleCommentHighlight(postSlug, comment.id, isAdmin);
        if (result.success && result.updatedComment) {
            onAdminAction(result.updatedComment);
        }
    }

    const handlePin = async () => {
         if (!isAdmin) return;
        const result = await toggleCommentPin(postSlug, comment.id, isAdmin);
        if (result.success && result.updatedComment) {
            onAdminAction(result.updatedComment);
        }
    }

    return (
       <div className={cn("flex items-start gap-4 p-4 rounded-lg transition-colors duration-300 relative", {
           "bg-primary/10 border-l-4 border-primary": comment.highlighted,
           "border-amber-500/30": comment.highlighted,
       })}>
            <Avatar>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {!isEditing ? (
                <>
                <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {comment.pinned && <Badge variant="secondary"><Pin className="h-3 w-3 mr-1" /> Pinned</Badge>}
                    {comment.highlighted && <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"><Star className="h-3 w-3 mr-1" /> Highlighted</Badge>}
                </div>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={handleLikeClick} className={cn("flex items-center gap-1 hover:text-primary transition-colors", { 'text-red-500': isLiked })}>
                        <Heart className={cn("h-4 w-4 transition-all transform", { 'fill-current scale-110': isLiked })} />
                        <span>{comment.likes}</span>
                    </button>
                    <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1 hover:text-primary">
                        <MessageSquare className="h-4 w-4" />
                        <span>Reply</span>
                    </button>
                </div>
                </>
              ) : (
                <CommentForm
                    postSlug={postSlug}
                    isEditing={true}
                    commentId={comment.id}
                    initialContent={comment.content}
                    onCommentAdded={(updated) => {
                        onUpdate(updated);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                    buttonText="Save"
                />
              )}

              {canModify && !isEditing && (
                  <div className="absolute top-2 right-2">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                              </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onSelect={handleHighlight}>
                                            <Star className="mr-2 h-4 w-4" />
                                            <span>{comment.highlighted ? "Unhighlight" : "Highlight"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handlePin}>
                                            <Pin className="mr-2 h-4 w-4" />
                                            <span>{comment.pinned ? "Unpin" : "Pin"}</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                              <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              )}

              {showReplyForm && !isEditing && (
                  <div className="mt-4">
                      <CommentForm 
                          postSlug={postSlug}
                          parentId={comment.id}
                          buttonText="Post Reply"
                          onCommentAdded={(newReply) => {
                            onReply(newReply, comment.id);
                            setShowReplyForm(false);
                          }}
                          onCancel={() => setShowReplyForm(false)}
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
                           <div className="relative" key={reply.id}>
                           <Comment 
                                comment={reply} 
                                postSlug={postSlug}
                                onReply={onReply}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onAdminAction={onAdminAction}
                                likedComments={likedComments}
                                onLikeToggle={onLikeToggle}
                            />
                            </div>
                       ))}
                    </CollapsibleContent>
                 </Collapsible>
              )}
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
    )
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likedComments, setLikedComments] = useState<{ [key: string]: boolean }>({});
  const { user, signIn } = useAuth();
  
  useEffect(() => {
    const post = getPost(postSlug);
    if (post) {
      setComments(post.comments || [])
    }
  }, [postSlug])

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem(LIKED_COMMENTS_STORAGE_KEY) || '{}');
    setLikedComments(storedLikes[postSlug] || {});
  }, [postSlug]);
  
  const commentCount = useMemo(() => {
    let count = 0;
    const countReplies = (list: CommentType[]) => {
        list.forEach(c => {
            count++;
            if (c.replies) countReplies(c.replies);
        })
    }
    countReplies(comments);
    return count;
  }, [comments])

  const updateCommentsState = (list: CommentType[], updatedComment: CommentType): CommentType[] => {
      return list.map(c => {
          if (c.id === updatedComment.id) {
              // Ensure replies are carried over from the old state
              const oldComment = list.find(oldC => oldC.id === updatedComment.id);
              return { ...updatedComment, replies: oldComment?.replies || [] };
          }
          if (c.replies) {
              return { ...c, replies: updateCommentsState(c.replies, updatedComment) };
          }
          return c;
      });
  }
  
  const deleteCommentFromState = (list: CommentType[], commentId: string): CommentType[] => {
    return list.reduce((acc, c) => {
        if (c.id === commentId) {
            return acc; // filter it out
        }
        if (c.replies) {
            c.replies = deleteCommentFromState(c.replies, commentId);
        }
        acc.push(c);
        return acc;
    }, [] as CommentType[]);
  }

  const handleLikeToggle = (commentId: string, isLiked: boolean) => {
    setLikedComments(prev => {
        const newLikes = { ...prev, [commentId]: !isLiked };
        const allStoredLikes = JSON.parse(localStorage.getItem(LIKED_COMMENTS_STORAGE_KEY) || '{}');
        allStoredLikes[postSlug] = newLikes;
        localStorage.setItem(LIKED_COMMENTS_STORAGE_KEY, JSON.stringify(allStoredLikes));
        return newLikes;
    });

    const updateLikesRecursively = (list: CommentType[]): CommentType[] => {
      return list.map(c => {
        if (c.id === commentId) {
          return { ...c, likes: c.likes + (isLiked ? -1 : 1) };
        }
        if (c.replies) {
          return { ...c, replies: updateLikesRecursively(c.replies) };
        }
        return c;
      });
    };
    setComments(prevComments => updateLikesRecursively(prevComments));
  }

  const addCommentToState = (newComment: CommentType) => {
      setComments(prev => sortComments([newComment, ...prev]));
  }
  
  const addReplyToState = (newReply: CommentType, parentId: string) => {
      const addReplyRecursively = (list: CommentType[]): CommentType[] => {
          return list.map(comment => {
              if (comment.id === parentId) {
                  const newReplies = comment.replies ? sortComments([newReply, ...comment.replies]) : [newReply];
                  return { ...comment, replies: newReplies };
              }
              if (comment.replies && comment.replies.length > 0) {
                  return { ...comment, replies: addReplyRecursively(comment.replies) };
              }
              return comment;
          });
      };
      setComments(prev => addReplyRecursively(prev));
  }

  const handleUpdateComment = (updatedComment: CommentType) => {
      setComments(prev => updateCommentsState(prev, updatedComment));
  }
  
  const handleAdminAction = (updatedComment: CommentType) => {
    setComments(prev => {
        const updatedList = updateCommentsState(prev, updatedComment);
        return sortComments(updatedList);
    });
  }
  
  const handleDeleteComment = (commentId: string) => {
      setComments(prev => deleteCommentFromState(prev, commentId));
  }
  
  return (
    <section>
      <h2 className="text-3xl font-headline font-bold mb-8">Comments ({commentCount})</h2>
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
          <div className="relative" key={comment.id}>
            <Comment 
                comment={comment}
                postSlug={postSlug}
                onReply={addReplyToState}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onAdminAction={handleAdminAction}
                likedComments={likedComments}
                onLikeToggle={handleLikeToggle}
            />
           </div>
        ))}
      </div>
    </section>
  );
}
