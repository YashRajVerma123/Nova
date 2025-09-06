'use client';
import type { Comment, Author } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Heart, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import Link from 'next/link';

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
};

const CommentItem = ({ comment }: { comment: Comment }) => (
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
                <button className="flex items-center gap-1 hover:text-primary group">
                    <Heart className="h-3 w-3 transition-colors group-hover:fill-red-500 group-hover:text-red-500"/>
                    <span>{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                    <MessageSquare className="h-3 w-3"/>
                    <span>Reply</span>
                </button>
            </div>
            {comment.replies.length > 0 && (
                <div className="mt-4 space-y-4 pl-6 border-l border-border/50">
                    {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} />)}
                </div>
            )}
        </div>
    </div>
);


interface CommentSectionProps {
  comments: Comment[];
  user: Author | null;
  onAddComment: (comment: Comment) => void;
}

const CommentSection = ({ comments, user, onAddComment }: CommentSectionProps) => {
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
                {comments.map(comment => <CommentItem key={comment.id} comment={comment}/>)}
            </div>
        </section>
    );
}

export default CommentSection;
