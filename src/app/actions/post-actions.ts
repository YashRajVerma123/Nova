
'use server';

import { revalidatePath } from 'next/cache';
import { Post, Author } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { z } from 'zod';


const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
  tags: z.string().min(1, 'Please enter at least one tag.'),
  featured: z.boolean().default(false),
});

// A mock function to get author details. In a real app this might involve a database lookup.
const getAuthorDetails = (authorId: string): Author | null => {
    // This is a simplified lookup. In a real app, you might query a database.
    const authors: Author[] = [
        { id: 'yash-raj', name: 'Yash Raj', avatar: 'https://i.pravatar.cc/150?u=yash-raj', email: 'yashrajverma916@gmail.com'},
        { id: 'jane-doe', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe', email: 'jane.doe@example.com'},
        { id: 'john-smith', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith', email: 'john.smith@example.com'},
    ];
    // In a real app, you'd have a users collection.
    // For this demo, let's assume if the ID is a firebase UID, we create a user object
    const found = authors.find(a => a.id === authorId);
    if(found) return found;

    return {
        id: authorId,
        name: 'New User', // You might want a better default
        avatar: `https://i.pravatar.cc/150?u=${authorId}`,
        email: 'no-email@example.com'
    };
}


export async function addPost(values: z.infer<typeof formSchema>, authorId: string): Promise<string> {
    if (!authorId) {
        throw new Error('You must be logged in to create a post.');
    }

    const author = getAuthorDetails(authorId);
    if (!author) {
         throw new Error('Author details could not be found.');
    }

    const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const readTime = Math.ceil(values.content.split(/\s+/).length / 200);

    const newPost: Omit<Post, 'id' | 'comments'> = {
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
    
    const postsCollection = collection(db, 'posts');
    const docRef = await addDoc(postsCollection, {
        ...newPost,
        publishedAt: new Date(newPost.publishedAt),
    });

    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return slug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const postRef = doc(db, 'posts', postId);

  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  const readTime = Math.ceil(values.content.split(/\s+/).length / 200);

  const updatedData = {
    slug: newSlug,
    title: values.title,
    description: values.description,
    content: values.content,
    coverImage: values.coverImage,
    tags: tagsArray,
    featured: values.featured,
    readTime,
  };

  await updateDoc(postRef, updatedData);
  
  const oldSlug = (await getDoc(postRef)).data()?.slug;

  revalidatePath('/');
  revalidatePath('/posts');
  if (oldSlug) revalidatePath(`/posts/${oldSlug}`);
  revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

  return newSlug;
}


export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
  
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  
  return { success: true };
}
