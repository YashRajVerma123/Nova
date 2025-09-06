'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addNotification as addNotificationToData, Notification, notifications } from '@/lib/data';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
});

export async function addNotification(values: z.infer<typeof formSchema>): Promise<Notification[]> {
    
    const newNotification: Notification = {
        id: `n${Date.now()}`,
        title: values.title,
        description: values.description,
        createdAt: new Date().toISOString(),
        read: false,
        image: values.image
    };
  
    addNotificationToData(newNotification);
  
    revalidatePath('/');
    revalidatePath('/posts');

    return notifications;
}
