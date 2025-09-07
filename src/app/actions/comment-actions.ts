
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment, posts } from '@/lib/data';

// Helper function to find a comment/reply in the nested structure
const findComment = (comments: Comment[], commentId: string): Comment | null => {
    for (const comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const foundInReply = findComment(comment.replies, commentId);
            if (foundInReply) {
                return foundInReply;
            }
        }
    }
    return null;
};

export async function addComment(
    postSlug: string, 
    content: string, 
    author: Author,
    parentId: string | null = null
) {
    if (!author) {
        return { error: 'You must be logged in to comment.' };
    }
    
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }

    const newComment: Comment = {
        id: new Date().toISOString(),
        content,
        author,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
    };
    
    if (parentId) {
        // This is a reply
        const parentComment = findComment(post.comments || [], parentId);
        if (parentComment) {
            parentComment.replies.unshift(newComment);
        } else {
            return { error: 'Parent comment not found.' };
        }
    } else {
        // This is a top-level comment
        if (!post.comments) {
            post.comments = [];
        }
        post.comments.unshift(newComment);
    }


    revalidatePath(`/posts/${postSlug}`);

    return { comment: newComment };
}


export async function toggleCommentLike(postSlug: string, commentId: string) {
    const post = posts.find(p => p.slug === postSlug);
    if (!post || !post.comments) {
        return { error: 'Post not found.' };
    }

    const comment = findComment(post.comments, commentId);

    if (!comment) {
        return { error: 'Comment not found.' };
    }

    // This is a simplified implementation. In a real app, you'd check if the user has already liked it.
    // Here we just increment/decrement. For the client-side, we'll store the liked state in localStorage.
    // For this simulation, we'll just increment the likes. A real implementation would be more complex.
    comment.likes = (comment.likes || 0) + 1;

    revalidatePath(`/posts/${postSlug}`);
    
    return { success: true, newLikes: comment.likes };
}
