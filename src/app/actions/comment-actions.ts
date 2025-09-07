
'use server';

import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import { getAdminApp } from '@/lib/firebase-admin';
import { Author, Comment, posts } from '@/lib/data';

// Initialize Firebase Admin SDK
getAdminApp();

const createAuthError = () => new Error('The server is experiencing authentication issues. Please try again later.');

const verifyToken = async (token: string): Promise<Author> => {
    if (!token) {
        throw createAuthError();
    }
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const user = await getAuth().getUser(decodedToken.uid);
        return {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email || 'no-email@example.com',
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        };
    } catch (error) {
        console.error('Error verifying token:', error);
        throw createAuthError();
    }
};

export async function addComment(postSlug: string, content: string, idToken: string) {
    let author: Author;
    try {
        author = await verifyToken(idToken);
    } catch (error) {
        return { error: (error as Error).message };
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
    };

    if (!post.comments) {
        post.comments = [];
    }
    post.comments.unshift(newComment);

    revalidatePath(`/posts/${postSlug}`);

    return { comment: newComment };
}
