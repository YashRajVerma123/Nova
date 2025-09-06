'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { posts, authors, Post } from '@/lib/data';

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
    
    const author = Object.values(authors).find(a => a.id === authorId);
    if (!author) {
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
