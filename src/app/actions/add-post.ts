
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { posts, Post, Author } from '@/lib/data';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  coverImage: z.string().url(),
  tags: z.string(),
  featured: z.boolean(),
});

// Helper to create a URL-friendly slug
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export async function addPost(values: z.infer<typeof formSchema>, authorId: string): Promise<Post> {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
        throw new Error('Invalid data provided.');
    }

    let author: Author;
    try {
      // Initialize the Firebase Admin SDK
      const app = getAdminApp();
      const auth = getAuth(app);
      const userRecord = await auth.getUser(authorId);
      
      if (!userRecord) {
        throw new Error("Author not found. You must be logged in.");
      }

      author = {
        id: userRecord.uid,
        name: userRecord.displayName || 'Anonymous User',
        email: userRecord.email || '',
        avatar: userRecord.photoURL || `https://i.pravatar.cc/150?u=${userRecord.uid}`,
      };

    } catch (error) {
       console.error("Firebase Admin SDK error:", error);
       throw new Error("Author not found. You must be logged in.");
    }


    const { title, description, content, coverImage, tags, featured } = validatedFields.data;

    // Basic slug generation
    const slug = createSlug(title);
    
    // Check if slug already exists
    if (posts.some(p => p.slug === slug)) {
        throw new Error('A post with this title already exists, please choose a different title.');
    }

    // Estimate read time (words per minute)
    const words = content.split(' ').length;
    const readTime = Math.ceil(words / 200);

    const newPost: Post = {
        slug,
        title,
        description,
        content,
        coverImage,
        author,
        publishedAt: new Date().toISOString(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        readTime,
        featured,
        comments: [],
    };
    
    // Add to the beginning of our in-memory array
    posts.unshift(newPost);
    
    // Revalidate paths to show the new post immediately
    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath(`/posts/${slug}`);
    
    return newPost;
}
