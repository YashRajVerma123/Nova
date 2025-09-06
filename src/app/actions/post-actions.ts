'use server';

import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';
import { Post, addPost as addNewPostToMemory, Author, posts } from '@/lib/data';
import { getAdminApp } from '@/lib/firebase-admin';
import { z } from 'zod';

// Initialize Firebase Admin SDK
getAdminApp();

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
  tags: z.string().min(1, 'Please enter at least one tag.'),
  featured: z.boolean().default(false),
});

export async function addPost(values: z.infer<typeof formSchema>, authorId: string): Promise<string> {
    if (!authorId) {
        throw new Error('You must be logged in to create a post.');
    }

    let author: Author;
    try {
        const userRecord = await getAuth().getUser(authorId);
        author = {
            id: userRecord.uid,
            name: userRecord.displayName || 'Anonymous',
            avatar: userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
            email: userRecord.email || 'no-email@example.com',
        };
    } catch (error) {
        console.error("Error fetching author:", error);
        throw new Error('Author not found. You must be logged in to create a post.');
    }

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
    };
    
    addNewPostToMemory(newPost);

    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return newPost.slug;
}

export async function updatePost(slug: string, values: z.infer<typeof formSchema>): Promise<string> {
  const postIndex = posts.findIndex(p => p.slug === slug);
  if (postIndex === -1) {
    throw new Error('Post not found.');
  }

  const post = posts[postIndex];

  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  const readTime = Math.ceil(values.content.split(/\s+/).length / 200);

  const updatedPost: Post = {
    ...post,
    slug: newSlug,
    title: values.title,
    description: values.description,
    content: values.content,
    coverImage: values.coverImage,
    tags: tagsArray,
    featured: values.featured,
    readTime,
  };

  posts[postIndex] = updatedPost;
  
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath(`/posts/${slug}`);
  revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

  return newPost.slug;
}


export async function deletePost(slug: string): Promise<{ success: boolean }> {
  const postIndex = posts.findIndex(p => p.slug === slug);
  if (postIndex === -1) {
    throw new Error('Post not found.');
  }

  posts.splice(postIndex, 1);
  
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  
  return { success: true };
}
