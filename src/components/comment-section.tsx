
'use client';
import type { Comment, Author } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Heart, MessageSquare, Send, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog"


const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 && names[0] && names[1] ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

interface CommentFormProps {
    user: Author;
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    initialContent?: string;
    placeholder: string;
    isReply?: boolean;
}

const CommentForm = ({ user, onSubmit, onCancel, initialContent = '', placeholder, isReply = false }: CommentFormProps) => {
    const [content, setContent] = useState(initialContent);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() && user) {
            onSubmit(content.trim());
            setContent('');
            onCancel?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex items-start gap-2 ${isReply ? 'mt-4 ml-8' : 'mb-8'}`}>
             <Avatar className={isReply ? 'h-8 w-8' : 'h-10 w-10'}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
                <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="pr-20"
                    rows={isReply ? 2 : 3}
                    required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    {onCancel && (
                     <Button size="icon" variant="ghost" type="button" className="h-7 w-7 text-xs" onClick={onCancel}>X</Button>
                    )}
                    <Button size="icon" variant="ghost" type="submit" className="h-7 w-7" disabled={!content.trim()}>
                        <Send className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </form>
    );
};


interface CommentItemProps {
    comment: Comment;
    user: Author | null;
    isAdmin: boolean;
    onAddReply: (parentCommentId: string, content: string) => void;
    onUpdateComment: (commentId: string, content: string) => void;
    onDeleteComment: (commentId: string) => void;
    onUpdateReply: (commentId: string, replyId: string, content: string) => void;
    onDeleteReply: (commentId: string, replyId: string) => void;
    onLikeComment: (commentId: string) => void;
    isReply?: boolean;
    parentCommentId?: string;
}

const CommentItem = ({ comment, user, isAdmin, onAddReply, onUpdateComment, onDeleteComment, onUpdateReply, onDeleteReply, onLikeComment, isReply=false, parentCommentId }: CommentItemProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [liked, setLiked] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const canEdit = user?.id === comment.author.id;
    const canDelete = canEdit || isAdmin;

    useEffect(() => {
        const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
        setLiked(!!likedComments[comment.id]);
    }, [comment.id]);
    
    const handleLikeClick = () => {
        setLiked(!liked);
        onLikeComment(comment.id);
    };

    const handleUpdateSubmit = (content: string) => {
        if(isReply && parentCommentId) {
            onUpdateReply(parentCommentId, comment.id, content)
        } else {
            onUpdateComment(comment.id, content);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if(isReply && parentCommentId) {
            onDeleteReply(parentCommentId, comment.id)
        } else {
            onDeleteComment(comment.id);
        }
        setDeleteDialogOpen(false);
    };
    
    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <div>
                <div className="flex items-start gap-4">
                    <Avatar className={isReply ? 'h-8 w-8' : 'h-10 w-10'}>
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{comment.author.name}</p>
                              <p className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                           {(canEdit || canDelete) && !isEditing && (
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                {canEdit && <DropdownMenuItem onSelect={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
                                {canDelete && 
                                    <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-red-500 focus:text-red-500">
                                      <Trash2 className="mr-2 h-4 w-4" />Delete
                                    </DropdownMenuItem>
                                 }
                               </DropdownMenuContent>
                             </DropdownMenu>
                           )}
                        </div>
                        {isEditing && user ? (
                            <CommentForm 
                              user={user}
                              initialContent={comment.content}
                              onSubmit={handleUpdateSubmit}
                              onCancel={() => setIsEditing(false)}
                              placeholder="Edit your comment..."
                              isReply
                            />
                        ) : (
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                        )}
                        
                        {!isEditing && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-primary group" onClick={handleLikeClick}>
                                <Heart className={`h-3 w-3 transition-colors group-hover:fill-red-500 group-hover:text-red-500 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{comment.likes}</span>
                            </button>
                            {user && (
                            <button className="flex items-center gap-1 hover:text-primary" onClick={() => setIsReplying(!isReplying)}>
                                <MessageSquare className="h-3 w-3"/>
                                <span>Reply</span>
                            </button>
                            )}
                        </div>
                        )}
                    </div>
                </div>
                {isReplying && user && (
                     <CommentForm 
                        user={user} 
                        onSubmit={(content) => {
                            onAddReply(comment.id, content)
                            setIsReplying(false);
                        }}
                        onCancel={() => setIsReplying(false)}
                        placeholder="Write a reply..."
                        isReply
                     />
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-6 border-l border-border/50">
                        {comment.replies.map(reply => (
                             <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                user={user}
                                isAdmin={isAdmin}
                                onAddReply={onAddReply} 
                                onUpdateComment={onUpdateComment}
                                onDeleteComment={onDeleteComment}
                                onUpdateReply={onUpdateReply}
                                onDeleteReply={onDeleteReply}
                                onLikeComment={onLikeComment}
                                isReply
                                parentCommentId={comment.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this {isReply ? 'reply' : 'comment'}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};


interface CommentSectionProps {
  comments: Comment[];
  user: Author | null;
  isAdmin: boolean;
  onAddComment: (content: string) => void;
  onAddReply: (parentCommentId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpdateReply: (commentId: string, replyId: string, content: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  onLikeComment: (commentId: string) => void;
}

const CommentSection = (props: CommentSectionProps) => {
    const { comments, user, isAdmin, onAddComment } = props;

    return (
        <section id="comment-section">
            <h2 className="text-2xl font-headline font-bold mb-6">Comments ({comments.length})</h2>
            {user ? (
                <CommentForm
                    user={user}
                    onSubmit={onAddComment}
                    placeholder="Write a comment..."
                />
            ) : (
                <div className="text-center p-4 border rounded-lg mb-8">
                    <p className="text-muted-foreground">
                        <Link href="/api/auth/signin" className="text-primary hover:underline">Sign in</Link> to join the conversation.
                    </p>
                </div>
            )}
            
            <div className="space-y-8">
                {comments.map(comment => 
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        user={user}
                        isAdmin={isAdmin}
                        onAddReply={props.onAddReply}
                        onUpdateComment={props.onUpdateComment}
                        onDeleteComment={props.onDeleteComment}
                        onUpdateReply={props.onUpdateReply}
                        onDeleteReply={props.onDeleteReply}
                        onLikeComment={props.onLikeComment}
                    />
                )}
            </div>
        </section>
    );
}

export default CommentSection;
