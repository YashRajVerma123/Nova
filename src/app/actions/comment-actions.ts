
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment } from '@/lib/data';
import { posts } from '@/lib/data-store';

// Helper to find a comment and its parent list within a nested structure
const findCommentAndParentList = (
  comments: Comment[],
  commentId: string
): { comment: Comment; list: Comment[] } | null => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.id === commentId) {
      return { comment, list: comments };
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentAndParentList(comment.replies, commentId);
      if (found) {
        return found;
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
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }

    if (!author) {
        return { error: 'You must be logged in to comment.' };
    }
    
    const newComment: Comment = {
        id: new Date().toISOString() + Math.random(),
        content,
        author,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
        parentId,
    };
    
    if (parentId) {
        const found = findCommentAndParentList(post.comments, parentId);
        if (found) {
            found.comment.replies.unshift(newComment);
        } else {
             return { error: 'Parent comment not found.' };
        }
    } else {
        post.comments.unshift(newComment);
    }

    revalidatePath(`/posts/${postSlug}`);
    return { comment: newComment };
}


export async function toggleCommentLike(postSlug: string, commentId: string, isLiked: boolean) {
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }

    const found = findCommentAndParentList(post.comments, commentId);
    if (!found) {
        return { error: 'Comment not found.' };
    }
    
    const { comment } = found;
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
    if (!post) {
        return { error: 'Post not found.' };
    }
    
    const found = findCommentAndParentList(post.comments, commentId);
     if (!found) {
        return { error: 'Comment not found.' };
    }

    const { comment } = found;
    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to edit this comment.' };
    }

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment };
}

export async function deleteComment(postSlug: string, commentId: string, authorId: string, isAdmin: boolean) {
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }

    const found = findCommentAndParentList(post.comments, commentId);
    if (!found) {
        return { error: 'Comment not found.' };
    }

    const { comment, list } = found;

    if (comment.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to delete this comment.' };
    }

    const commentIndex = list.findIndex(c => c.id === commentId);
    if (commentIndex > -1) {
        list.splice(commentIndex, 1);
    }
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}


export async function toggleCommentHighlight(postSlug: string, commentId: string, isAdmin: boolean) {
    if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }

    const found = findCommentAndParentList(post.comments, commentId);
     if (!found) {
        return { error: 'Comment not found.' };
    }

    const { comment } = found;
    comment.highlighted = !comment.highlighted;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment };
}

export async function toggleCommentPin(postSlug: string, commentId: string, isAdmin: boolean) {
     if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return { error: 'Post not found.' };
    }
    
    const found = findCommentAndParentList(post.comments, commentId);
     if (!found) {
        return { error: 'Comment not found.' };
    }

    const { comment } = found;
    comment.pinned = !comment.pinned;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, updatedComment: comment };
}
