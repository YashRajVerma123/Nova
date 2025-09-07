
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment, posts } from '@/lib/data';

// Helper function to find a comment/reply in the nested structure
const findComment = (comments: Comment[], commentId: string): { comment: Comment | null, parent: Comment[] | null, index: number } => {
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === commentId) {
            return { comment, parent: comments, index: i };
        }
        if (comment.replies && comment.replies.length > 0) {
            const foundInReply = findComment(comment.replies, commentId);
            if (foundInReply.comment) {
                return foundInReply;
            }
        }
    }
    return { comment: null, parent: null, index: -1 };
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
        id: new Date().toISOString() + Math.random(),
        content,
        author,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
    };
    
    if (parentId) {
        // This is a reply
        const { comment: parentComment } = findComment(post.comments || [], parentId);
        if (parentComment) {
            if (!parentComment.replies) parentComment.replies = [];
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


export async function toggleCommentLike(postSlug: string, commentId: string, isLiked: boolean) {
    const post = posts.find(p => p.slug === postSlug);
    if (!post || !post.comments) {
        return { error: 'Post not found.' };
    }

    const { comment } = findComment(post.comments, commentId);

    if (!comment) {
        return { error: 'Comment not found.' };
    }
    
    // If the client says it was liked, we unlike, and vice-versa.
    if (isLiked) {
        comment.likes = (comment.likes || 1) - 1;
    } else {
        comment.likes = (comment.likes || 0) + 1;
    }

    revalidatePath(`/posts/${postSlug}`);
    
    return { success: true, newLikes: comment.likes };
}

export async function updateComment(postSlug: string, commentId: string, newContent: string, authorId: string, isAdmin: boolean) {
     const post = posts.find(p => p.slug === postSlug);
    if (!post || !post.comments) {
        return { error: 'Post not found.' };
    }

    const { comment } = findComment(post.comments, commentId);
    
    if (!comment) {
        return { error: 'Comment not found.' };
    }

    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to edit this comment.' };
    }

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment };
}

export async function deleteComment(postSlug: string, commentId: string, authorId: string, isAdmin: boolean) {
    const post = posts.find(p => p.slug === postSlug);
    if (!post || !post.comments) {
        return { error: 'Post not found.' };
    }
    
    const { comment, parent, index } = findComment(post.comments, commentId);
    
    if (!comment || !parent || index === -1) {
        return { error: 'Comment not found.' };
    }

    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to delete this comment.' };
    }

    parent.splice(index, 1);
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}
