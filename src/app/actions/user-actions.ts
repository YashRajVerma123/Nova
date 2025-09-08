
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().min(20, 'Bio must be at least 20 characters.'),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.'),
  signature: z.string().min(2, 'Signature must be at least 2 characters.'),
});

export async function updateAuthorProfile(authorId: string, values: z.infer<typeof profileSchema>): Promise<{ success: boolean }> {
  if (!authorId) {
    throw new Error('Author ID is required.');
  }

  const authorRef = doc(db, 'users', authorId);
  
  await updateDoc(authorRef, {
    name: values.name,
    bio: values.bio,
    instagramUrl: values.instagramUrl,
    signature: values.signature,
  });

  // Revalidate paths where author info is shown
  revalidatePath('/admin');
  revalidatePath('/posts/.*', 'page'); // Revalidate all post pages
  
  return { success: true };
}
