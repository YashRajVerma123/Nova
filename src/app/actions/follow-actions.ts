
'use server';

import { db } from '@/lib/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(followerId: string, authorId: string, isCurrentlyFollowing: boolean): Promise<{ success: boolean, error?: string }> {
    if (!followerId) {
        return { success: false, error: 'You must be logged in to follow authors.' };
    }
    if (followerId === authorId) {
        return { success: false, error: "You cannot follow yourself." };
    }

    const followerRef = doc(db, 'users', followerId);
    const authorRef = doc(db, 'users', authorId);
    const followDocRef = doc(followerRef, 'following', authorId);

    try {
        await runTransaction(db, async (transaction) => {
            if (isCurrentlyFollowing) {
                // Unfollow logic
                transaction.delete(followDocRef);
                transaction.update(authorRef, { followers: increment(-1) });
                transaction.update(followerRef, { following: increment(-1) });
            } else {
                // Follow logic
                transaction.set(followDocRef, { followedAt: new Date() });
                transaction.update(authorRef, { followers: increment(1) });
                transaction.update(followerRef, { following: increment(1) });
            }
        });

        // Revalidate relevant paths
        revalidatePath('/posts/.*', 'page');
        revalidatePath('/about');
        
        return { success: true };
    } catch (error) {
        console.error("Follow/unfollow transaction failed: ", error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}
