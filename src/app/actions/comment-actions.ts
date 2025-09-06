
'use server';

import { revalidatePath } from 'next/cache';
import { posts, Comment, Author } from '@/lib/data';
import { getAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
try {
  getAdminApp();
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  // Throwing an error here to prevent the actions from being used with a faulty config.
  // We'll add a more specific error message in each function.
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
}

const createAuthError = () => new Error('The server is experiencing authentication issues. Please try again later.');

const verifyToken = async (token: string): Promise<Author> => {
    if (!token) {
        throw new Error('Authentication token not provided.');
    }
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const user = await getAuth().getUser(decodedToken.uid);
        return {
            id: user.uid,
            name: user.displayName || 'Anonymous User',
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            email: user.email || 'no-email@example.com',
        };
    } catch (error) {
        console.error("Error verifying token:", error);
        // This is where the private key error would surface if initialization fails.
        if (getErrorMessage(error).includes('private key')) {
          throw createAuthError();
        }
        throw new Error('Invalid or expired authentication token.');
    }
};

// Helper to find a comment/reply in the nested structure
const findComment = (comments: Comment[], commentId: string): { parent: Comment[] | null, comment: Comment | null, index: number } => {
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === commentId) {
            return { parent: comments, comment, index: i };
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies, commentId);
            if (found.comment) {
                return found;
            }
        }
    }
    return { parent: null, comment: null, index: -1 };
};

export async function addComment(postSlug: string, content: string, parentId: string | null, token: string) {
    let author: Author;
    try {
      author = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) {
        throw new Error('Post not found');
    }

    const newComment: Comment = {
        id: uuidv4(),
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: [],
    };

    if (parentId) {
        const { comment: parentComment } = findComment(post.comments, parentId);
        if (parentComment) {
            parentComment.replies.unshift(newComment);
        } else {
             throw new Error('Parent comment not found');
        }
    } else {
        post.comments.unshift(newComment);
    }
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}


export async function deleteComment(postSlug: string, commentId: string, token: string) {
    let user: Author;
    try {
      user = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) throw new Error('Post not found');
    
    const isAdmin = user.email === 'yashrajverma916@gmail.com';

    // This needs to search top-level and nested replies
    const findAndRemove = (comments: Comment[], id: string): boolean => {
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            if (comment.id === id) {
                 if (isAdmin || comment.author.id === user.id) {
                    comments.splice(i, 1);
                    return true;
                } else {
                    throw new Error('You are not authorized to delete this comment.');
                }
            }
            if (comment.replies && findAndRemove(comment.replies, id)) {
                return true;
            }
        }
        return false;
    };
    
    findAndRemove(post.comments, commentId);

    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}

export async function editComment(postSlug: string, commentId: string, newContent: string, token: string) {
    let user: Author;
    try {
      user = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) throw new Error('Post not found');

    const { comment } = findComment(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    const isAdmin = user.email === 'yashrajverma916@gmail.com';

    if (comment.author.id !== user.id && !isAdmin) {
        throw new Error('You are not authorized to edit this comment.');
    }

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}

export async function toggleLike(postSlug: string, commentId: string, token: string) {
    let user: Author;
    try {
      user = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) throw new Error('Post not found');

    const { comment } = findComment(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');
    
    const likeIndex = comment.likes.indexOf(user.id);
    if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
    } else {
        comment.likes.push(user.id);
    }
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true, likes: comment.likes };
}

export async function togglePin(postSlug: string, commentId: string, token: string) {
    let user: Author;
    try {
      user = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) throw new Error('Post not found');
    
    const isAdmin = user.email === 'yashrajverma916@gmail.com';
    if (!isAdmin) {
        throw new Error('You are not authorized to pin comments.');
    }

    // Unpin any currently pinned comment
    post.comments.forEach(c => {
      if (c.id !== commentId && c.isPinned) c.isPinned = false;
    });

    const { comment } = findComment(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.isPinned = !comment.isPinned;
    
    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}

export async function toggleHeart(postSlug: string, commentId: string, token: string) {
    let user: Author;
    try {
      user = await verifyToken(token);
    } catch (error) {
      throw createAuthError();
    }
    const post = posts.find((p) => p.slug === postSlug);
    if (!post) throw new Error('Post not found');
    
    const isAdmin = user.email === 'yashrajverma916@gmail.com';
    const isPostAuthor = user.id === post.author.id;

    if (!isAdmin && !isPostAuthor) {
        throw new Error('You are not authorized to heart comments.');
    }
    
    const { comment } = findComment(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.isHearted = !comment.isHearted;

    revalidatePath(`/posts/${postSlug}`);
    return { success: true };
}
