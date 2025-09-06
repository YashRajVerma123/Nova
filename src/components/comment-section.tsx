'use client';
import type { Comment, Author } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Heart, MessageSquare, Send } from "lucide-react";
import { useState, useEffect } from "react";
import Link from 'next/link';

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
};


interface ReplyFormProps {
    user: Author;
    onAddReply: (reply: Comment) => void;
    onCancel: () => void;
}

const ReplyForm = ({ user, onAddReply, onCancel }: ReplyFormProps) => {
    const [replyContent, setReplyContent] = useState('');

    const handlePostReply = () => {
        if (replyContent.trim() && user) {
            const reply: Comment = {
                id: `c${Date.now()}`,
                author: user,
                content: replyContent.trim(),
                createdAt: new Date().toISOString(),
                likes: 0,
                replies: [],
            };
            onAddReply(reply);
            setReplyContent('');
            onCancel();
        }
    };

    return (
        <div className="flex items-start gap-2 mt-4 ml-8">
             <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
                <Textarea 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="pr-10"
                    rows={2}
                />
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handlePostReply} disabled={!replyContent.trim()}>
                        <Send className="h-4 w-4"/>
                    </Button>
                     <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" onClick={onCancel}>X</Button>
                </div>
            </div>
        </div>
    );
};

const CommentItem = ({ comment, user, onAddReply, onLikeComment }: { comment: Comment; user: Author | null; onAddReply: (reply: Comment) => void; onLikeComment: (commentId: string, isLiked: boolean) => void; }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

    useEffect(() => {
        // Check local storage for like status
        const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
        if (likedComments[comment.id]) {
            setLiked(true);
        }
    }, [comment.id]);
    
    const handleLikeClick = () => {
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        onLikeComment(comment.id, newLikedState);

        // Update local storage
        const likedComments = JSON.parse(localStorage.getItem('likedComments') || '{}');
        if (newLikedState) {
            likedComments[comment.id] = true;
        } else {
            delete likedComments[comment.id];
        }
        localStorage.setItem('likedComments', JSON.stringify(likedComments));
    };
    
    return (
        <div>
            <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary group" onClick={handleLikeClick}>
                            <Heart className={`h-3 w-3 transition-colors group-hover:fill-red-500 group-hover:text-red-500 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{likeCount}</span>
                        </button>
                        {user && (
                        <button className="flex items-center gap-1 hover:text-primary" onClick={() => setIsReplying(!isReplying)}>
                            <MessageSquare className="h-3 w-3"/>
                            <span>Reply</span>
                        </button>
                        )}
                    </div>
                </div>
            </div>
            {isReplying && user && (
                 <ReplyForm 
                    user={user} 
                    onAddReply={onAddReply}
                    onCancel={() => setIsReplying(false)}
                 />
            )}
            {comment.replies.length > 0 && (
                <div className="mt-4 space-y-4 pl-6 border-l border-border/50">
                    {comment.replies.map(reply => (
                        // Note: Nested replies don't have reply functionality in this simplified version
                         <div key={reply.id} className="flex items-start gap-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                <AvatarFallback>{getInitials(reply.author.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-xs">{reply.author.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <p className="text-sm text-foreground/90">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


interface CommentSectionProps {
  comments: Comment[];
  user: Author | null;
  onAddComment: (comment: Comment) => void;
  onAddReply: (parentCommentId: string, reply: Comment) => void;
  onLikeComment: (commentId: string, isLiked: boolean) => void;
}

const CommentSection = ({ comments, user, onAddComment, onAddReply, onLikeComment }: CommentSectionProps) => {
    const [newComment, setNewComment] = useState("");

    const handlePostComment = () => {
        if (newComment.trim() && user) {
            const comment: Comment = {
                id: `c${Date.now()}`,
                author: user,
                content: newComment.trim(),
                createdAt: new Date().toISOString(),
                likes: 0,
                replies: [],
            };
            onAddComment(comment);
            setNewComment("");
        }
    };

    return (
        <section id="comment-section">
            <h2 className="text-2xl font-headline font-bold mb-6">Comments ({comments.length})</h2>
            {user ? (
                <div className="flex items-start gap-4 mb-8">
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="pr-12"
                            rows={3}
                        />
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={handlePostComment}
                            disabled={!newComment.trim()}
                        >
                            <Send className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
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
                        onAddReply={(reply) => onAddReply(comment.id, reply)}
                        onLikeComment={onLikeComment}
                    />
                )}
            </div>
        </section>
    );
}

export default CommentSection;
