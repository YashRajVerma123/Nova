'use client';
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Comment, Author } from '@/lib/data';
import { addComment, deleteComment, editComment, toggleLike, togglePin, toggleHeart } from '@/app/actions/comment-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, MessageSquare, MoreVertical, Trash2, Edit, Pin, Heart, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface CommentSectionProps {
    postSlug: string;
    initialComments: Comment[];
    postAuthorId: string;
}

const CommentSection = ({ postSlug, initialComments, postAuthorId }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const { toast } = useToast();
    const { user, isAdmin, firebaseUser } = useAuth();
    
    const handleAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string) => {
        try {
            await action();
            // This is a temporary solution for in-memory data. In a real db, you'd re-fetch.
            // For now, we rely on server action's revalidatePath to refresh the page.
            // To see immediate changes without a full reload, we'd need more complex client-side state management.
            toast({ title: 'Success', description: successMessage });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: (error as Error).message || errorMessage,
                variant: 'destructive',
            });
        }
    };

    const onAddComment = (content: string, parentId: string | null) => {
        if (!firebaseUser) {
            toast({ title: 'Please sign in to comment.', variant: 'destructive' });
            return;
        }
        handleAction(
            async () => {
                const token = await firebaseUser.getIdToken();
                await addComment(postSlug, content, parentId, token);
            },
            'Comment posted successfully!',
            'Failed to post comment.'
        );
    };

    const onDeleteComment = (commentId: string) => {
        if (!firebaseUser) return;
        handleAction(
            async () => {
                const token = await firebaseUser.getIdToken();
                await deleteComment(postSlug, commentId, token);
            },
            'Comment deleted.',
            'Failed to delete comment.'
        );
    };
    
    const onEditComment = (commentId: string, newContent: string) => {
        if (!firebaseUser) return;
        handleAction(
            async () => {
                const token = await firebaseUser.getIdToken();
                await editComment(postSlug, commentId, newContent, token);
            },
            'Comment updated.',
            'Failed to update comment.'
        );
    };

    const onToggleLike = (commentId: string) => {
         if (!firebaseUser) {
            toast({ title: 'Please sign in to like comments.', variant: 'destructive' });
            return;
        }
        handleAction(
            async () => {
                 const token = await firebaseUser.getIdToken();
                 await toggleLike(postSlug, commentId, token);
            },
            'Like toggled.',
            'Failed to toggle like.'
        );
    };

    const onTogglePin = (commentId: string) => {
        if (!firebaseUser) return;
        handleAction(
            async () => {
                const token = await firebaseUser.getIdToken();
                await togglePin(postSlug, commentId, token);
            },
            'Pin toggled.',
            'Failed to toggle pin.'
        );
    };
    
    const onToggleHeart = (commentId: string) => {
        if (!firebaseUser) return;
        handleAction(
            async () => {
                const token = await firebaseUser.getIdToken();
                await toggleHeart(postSlug, commentId, token);
            },
            'Heart toggled.',
            'Failed to toggle heart.'
        );
    };

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [comments]);


    return (
        <section>
            <h2 className="text-3xl font-headline font-bold mb-8">Comments ({comments.length})</h2>
            <div className="space-y-8">
                {user && <CommentForm onSubmit={(content) => onAddComment(content, null)} />}
                <div>
                    {sortedComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            user={user}
                            isAdmin={isAdmin}
                            postAuthorId={postAuthorId}
                            onReply={onAddComment}
                            onDelete={onDeleteComment}
                            onEdit={onEditComment}
                            onToggleLike={onToggleLike}
                            onTogglePin={onTogglePin}
                            onToggleHeart={onToggleHeart}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

interface CommentFormProps {
    onSubmit: (content: string) => void;
    initialContent?: string;
    onCancel?: () => void;
    isEdit?: boolean;
}

const CommentForm = ({ onSubmit, initialContent = '', onCancel, isEdit = false }: CommentFormProps) => {
    const [content, setContent] = useState(initialContent);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="pr-20"
                    rows={3}
                    required
                />
                 <Button type="submit" size="icon" className="absolute top-3 right-3 h-8 w-8">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
            {isEdit && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        </form>
    );
};


interface CommentItemProps {
    comment: Comment;
    user: Author | null;
    isAdmin: boolean;
    postAuthorId: string;
    onReply: (content: string, parentId: string | null) => void;
    onDelete: (commentId: string) => void;
    onEdit: (commentId: string, newContent: string) => void;
    onToggleLike: (commentId: string) => void;
    onTogglePin: (commentId: string) => void;
    onToggleHeart: (commentId: string) => void;
    depth?: number;
}

const CommentItem = ({ comment, user, isAdmin, postAuthorId, onReply, onDelete, onEdit, onToggleLike, onTogglePin, onToggleHeart, depth = 0 }: CommentItemProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const isAuthor = user?.id === comment.author.id;
    const canEdit = isAuthor || isAdmin;
    const canDelete = isAuthor || isAdmin;
    const canHeart = isAdmin || user?.id === postAuthorId;
    const canPin = isAdmin && depth === 0;

    const hasReplyFromAuthorOrAdmin = useMemo(() => {
        return comment.replies.some(reply => reply.author.id === postAuthorId || reply.author.email === 'yashrajverma916@gmail.com');
    }, [comment.replies, postAuthorId]);
    
    const isCommentByAdmin = comment.author.email === 'yashrajverma916@gmail.com';
    const isLiked = user && comment.likes.includes(user.id);
    
    const getInitials = (name: string) => {
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
    };

    const cardClasses = cn(
        'transition-colors',
        {
            'bg-primary/5 border-primary/20': comment.isPinned,
            'bg-amber-400/5 border-amber-400/20': comment.isHearted,
            'bg-green-400/5 border-green-400/20': hasReplyFromAuthorOrAdmin && !comment.isHearted,
            'bg-secondary/50': isCommentByAdmin && !comment.isHearted,
        }
    );

    return (
         <Card className={cardClasses} style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : '0', borderLeftWidth: depth > 0 ? '2px' : '1px' }}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                             <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                             <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{comment.author.name}</p>
                                { isCommentByAdmin && <Badge variant="secondary">Admin</Badge> }
                                { comment.author.id === postAuthorId && <Badge variant="outline">Author</Badge>}
                                <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                            </div>
                            
                            {isEditing ? (
                                <CommentForm
                                    onSubmit={(content) => { onEdit(comment.id, content); setIsEditing(false); }}
                                    initialContent={comment.content}
                                    onCancel={() => setIsEditing(false)}
                                    isEdit
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <button onClick={() => onToggleLike(comment.id)} className={cn("flex items-center gap-1 hover:text-primary", isLiked && "text-primary")}>
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{comment.likes.length}</span>
                                </button>
                                <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 hover:text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Reply</span>
                                </button>
                                {comment.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && <DropdownMenuItem onSelect={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
                            {canDelete && <DropdownMenuItem onSelect={() => setDeleteAlertOpen(true)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
                            {canPin && <DropdownMenuItem onSelect={() => onTogglePin(comment.id)}><Pin className="mr-2 h-4 w-4" />{comment.isPinned ? 'Unpin' : 'Pin'}</DropdownMenuItem>}
                            {canHeart && <DropdownMenuItem onSelect={() => onToggleHeart(comment.id)}><Heart className="mr-2 h-4 w-4" />{comment.isHearted ? 'Unheart' : 'Heart'}</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                {isReplying && (
                    <div className="mt-4">
                        <CommentForm onSubmit={(content) => { onReply(content, comment.id); setIsReplying(false); }} />
                    </div>
                )}
                
                <div className="mt-4 space-y-4">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            user={user}
                            isAdmin={isAdmin}
                            postAuthorId={postAuthorId}
                            onReply={onReply}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onToggleLike={onToggleLike}
                            onTogglePin={onTogglePin}
                            onToggleHeart={onToggleHeart}
                            depth={depth + 1}
                        />
                    ))}
                </div>

                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete this comment.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { onDelete(comment.id); setDeleteAlertOpen(false); }} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
};

export default CommentSection;
