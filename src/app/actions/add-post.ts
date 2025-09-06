'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addPost, authors, Post } from '@/lib/data';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  tags: z.string(),
  readTime: z.coerce.number(),
  authorId: z.string(),
});

function createSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
      .trim()
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens
}

export async function addPostAction(values: z.infer<typeof formSchema>) {
    const author = Object.values(authors).find(a => a.id === values.authorId);

    if (!author) {
        throw new Error("Invalid author ID");
    }

    const newPost: Post = {
        slug: createSlug(values.title),
        title: values.title,
        description: values.description,
        content: values.content,
        coverImage: `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 1000)}`,
        author: author,
        publishedAt: new Date().toISOString(),
        tags: values.tags.split(',').map(tag => tag.trim()),
        readTime: values.readTime,
        featured: false,
        comments: [],
    };
  
    // In a real application, you would save this to a database.
    // For this demo, we'll add it to our in-memory data store.
    addPost(newPost);
  
    // Revalidate paths to show the new post immediately
    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath(`/posts/${newPost.slug}`);

    return { success: true, post: newPost };
}
