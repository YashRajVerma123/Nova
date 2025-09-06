
'use server';

import { revalidatePath } from 'next/cache';
import { posts, Comment, Post, Author } from '@/lib/data';
import { getAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
getAdminApp();

// Helper function to find a post by its slug. Throws an error if not found.
const findPost = (slug: string): Post => {
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
}

// Helper function to verify the user's token and get their profile
const getAuthorFromToken = async (idToken: string): Promise<Author> => {
    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const userRecord = await getAuth().getUser(decodedToken.uid);
        
        return {
            id: userRecord.uid,
            name: userRecord.displayName || 'Anonymous',
            avatar: userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
            email: userRecord.email || 'no-email@example.com',
        };
    } catch (error) {
        console.error("Error verifying token or fetching user:", error);
        throw new Error('Invalid authentication token.');
    }
}


// Helper function to recursively find a comment (or reply) by its ID within a tree of comments.
const findCommentRecursive = (comments: Comment[], commentId: string): { comment: Comment | null, parentReplies: Comment[] | null } => {
    for (const comment of comments) {
        if (comment.id === commentId) {
            // Found the comment at the top level of the current array
            return { comment, parentReplies: comments };
        }
        // If the comment has replies, search within them
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentRecursive(comment.replies, commentId);
            if (found.comment) return found; // Return if found in a nested level
        }
    }
    return { comment: null, parentReplies: null }; // Not found in this branch
};

// Server Action to add a top-level comment to a post
export async function addComment(postSlug: string, content: string, idToken: string): Promise<Post> {
    const post = findPost(postSlug);
    const author = await getAuthorFromToken(idToken);

    const newComment: Comment = {
        id: `c${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
    };
    
    post.comments.unshift(newComment); // Add to the beginning of the array
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

// Server Action to add a reply to an existing comment
export async function addReply(postSlug: string, parentCommentId: string, content: string, idToken: string): Promise<Post> {
    const post = findPost(postSlug);
    const author = await getAuthorFromToken(idToken);

    const { comment: parentComment } = findCommentRecursive(post.comments, parentCommentId);
    if (!parentComment) throw new Error('Parent comment not found');

    const newReply: Comment = {
        id: `r${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [], 
    };

    parentComment.replies.unshift(newReply); // Add reply to the beginning
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

// Server Action to update the content of an existing comment
export async function updateComment(postSlug: string, commentId: string, newContent: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment } = findCommentRecursive(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

// Server Action to delete a top-level comment
export async function deleteComment(postSlug: string, commentId: string): Promise<Post> {
    const post = findPost(postSlug);
    const index = post.comments.findIndex(c => c.id === commentId);
    if (index === -1) throw new Error('Comment not found');
    
    post.comments.splice(index, 1); // Remove the comment from the array
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

// Server Action to update the content of a reply
export async function updateReply(postSlug: string, commentId: string, replyId: string, newContent: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment: parentComment } = findCommentRecursive(post.comments, commentId);
    if (!parentComment || !parentComment.replies) throw new Error('Parent comment not found');
    
    const reply = parentComment.replies.find(r => r.id === replyId);
    if (!reply) throw new Error('Reply not found');

    reply.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

// Server Action to delete a reply
export async function deleteReply(postSlug: string, commentId: string, replyId: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment: parentComment } = findCommentRecursive(post.comments, commentId);
    if (!parentComment || !parentComment.replies) throw new Error('Parent comment not found');

    const index = parentComment.replies.findIndex(r => r.id === replyId);
    if (index === -1) throw new Error('Reply not found');

    parentComment.replies.splice(index, 1); // Remove the reply
    revalidatePath(`/posts/${postSlug}`);
    return post;
}
