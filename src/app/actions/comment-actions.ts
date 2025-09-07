
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment } from '@/lib/data';
import { comments } from '@/lib/data-store';

export async function addComment(
    postSlug: string, 
    content: string, 
    author: Author,
    parentId: string | null = null
) {
    if (!author) {
        return { error: 'You must be logged in to comment.' };
    }
    
    const newComment = {
        id: new Date().toISOString() + Math.random(),
        content,
        author,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
        postSlug,
        parentId,
    };
    
    comments.push(newComment);
    revalidatePath(`/posts/${postSlug}`);
    return { comment: newComment as Comment };
}


export async function toggleCommentLike(postSlug: string, commentId: string, isLiked: boolean) {
    const comment = comments.find(c => c.id === commentId);

    if (!comment) {
        return { error: 'Comment not found.' };
    }
    
    if (isLiked) {
        comment.likes = (comment.likes || 1) - 1;
    } else {
        comment.likes = (comment.likes || 0) + 1;
    }

    revalidatePath(`/posts/${postSlug}`);
    
    return { success: true, newLikes: comment.likes };
}

export async function updateComment(postSlug: string, commentId: string, newContent: string, authorId: string, isAdmin: boolean) {
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
        return { error: 'Comment not found.' };
    }

    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to edit this comment.' };
    }

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment as Comment };
}

export async function deleteComment(postSlug: string, commentId: string, authorId: string, isAdmin: boolean) {
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
        return { error: 'Comment not found.' };
    }

    const comment = comments[commentIndex];
    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to delete this comment.' };
    }

    // Also delete all replies
    const repliesToDelete = comments.filter(c => c.parentId === commentId);
    const idsToDelete = [commentId, ...repliesToDelete.map(r => r.id)];

    for (let i = comments.length - 1; i >= 0; i--) {
        if (idsToDelete.includes(comments[i].id)) {
            comments.splice(i, 1);
        }
    }
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}


export async function toggleCommentHighlight(postSlug: string, commentId: string, isAdmin: boolean) {
    if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const comment = comments.find(c => c.id === commentId);
    if (!comment) {
        return { error: 'Comment not found.' };
    }

    comment.highlighted = !comment.highlighted;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment as Comment };
}

export async function toggleCommentPin(postSlug: string, commentId: string, isAdmin: boolean) {
     if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const comment = comments.find(c => c.id === commentId);
    if (!comment) {
        return { error: 'Comment not found.' };
    }
    
    comment.pinned = !comment.pinned;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment as Comment };
}
