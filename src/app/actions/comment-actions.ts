
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment, posts } from '@/lib/data';

export async function addComment(postSlug: string, content: string, author: Author | null) {
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
    };

    if (!post.comments) {
        post.comments = [];
    }
    post.comments.unshift(newComment);

    revalidatePath(`/posts/${postSlug}`);

    return { comment: newComment };
}
