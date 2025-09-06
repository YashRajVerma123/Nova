
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addNotification as addNotificationToData, Notification, notifications } from '@/lib/data';

// Define the schema for the notification form data
const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  image: z.string().url().optional(), // Image is an optional URL
});

export async function addNotification(values: z.infer<typeof formSchema>): Promise<Notification[]> {
    
    // Create a new notification object with a unique ID and current timestamp
    const newNotification: Notification = {
        id: `n${Date.now()}`,
        title: values.title,
        description: values.description,
        createdAt: new Date().toISOString(),
        read: false, // New notifications are always unread
        image: values.image
    };
  
    // Add the new notification to our in-memory data store
    addNotificationToData(newNotification);
  
    // Revalidate paths to ensure the UI updates across the app
    // This tells Next.js to re-render these pages with the new data
    revalidatePath('/');
    revalidatePath('/posts');

    // Return the updated list of all notifications
    return notifications;
}
