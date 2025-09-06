'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addNotification as addNotificationToData, Notification } from '@/lib/data';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
});

export async function addNotification(values: z.infer<typeof formSchema>) {
    
    const newNotification: Notification = {
        id: `n${Date.now()}`,
        title: values.title,
        description: values.description,
        createdAt: new Date().toISOString(),
        read: false,
        image: values.image
    };
  
    // In a real application, you would save this to a database.
    // For this demo, we'll add it to our in-memory data store.
    addNotificationToData(newNotification);
  
    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/posts');

    return { success: true };
}
