
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { posts, Post, addPost as addNewPostToMemory, Author } from '@/lib/data';
import { getAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
getAdminApp();

// Define the input type using Zod for validation
import { z } from 'zod';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  coverImage: z.string().url(),
  tags: z.string(),
  featured: z.boolean(),
});

// Server Action to add a new blog post
export async function addPost(values: z.infer<typeof formSchema>, authorId: string): Promise<string> {
    if (!authorId) {
        throw new Error('You must be logged in to create a post.');
    }

    let author: Author;
    try {
        // Fetch the user record from Firebase Auth to ensure the user is valid
        const userRecord = await getAuth().getUser(authorId);
        if (!userRecord) throw new Error(); // Will be caught below

        // Create the author object from the Firebase user record
        author = {
            id: userRecord.uid,
            name: userRecord.displayName || 'Anonymous',
            avatar: userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
            email: userRecord.email || 'no-email@example.com',
        };
    } catch (error) {
        // This will catch if the user doesn't exist in Firebase Auth
        console.error("Error fetching author:", error);
        throw new Error('Author not found. You must be logged in to create a post.');
    }

    // Sanitize and format the input data
    const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const readTime = Math.ceil(values.content.split(/\s+/).length / 200);

    const newPost: Post = {
        slug,
        title: values.title,
        description: values.description,
        content: values.content,
        coverImage: values.coverImage,
        tags: tagsArray,
        featured: values.featured,
        author,
        publishedAt: new Date().toISOString(),
        readTime,
        comments: [],
    };
    
    // Add the new post to our in-memory data store
    addNewPostToMemory(newPost);

    // Revalidate paths to reflect the new post immediately
    revalidatePath('/');
    revalidatePath('/posts');
    
    // Return the new slug so we can redirect
    return newPost.slug;
}
