

'use server';

import { db } from '@/lib/firebase-server'; // Use server db
import { doc, runTransaction, increment, collection, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { Author } from '@/lib/data';

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
    const followerDocRef = doc(authorRef, 'followers', followerId);


    try {
        await runTransaction(db, async (transaction) => {
            if (isCurrentlyFollowing) {
                // Unfollow logic
                transaction.delete(followDocRef);
                transaction.delete(followerDocRef);
                transaction.update(authorRef, { followers: increment(-1) });
                transaction.update(followerRef, { following: increment(-1) });
            } else {
                // Follow logic
                const followData = { followedAt: new Date(), id: authorId };
                const followerData = { followedAt: new Date(), id: followerId };
                transaction.set(followDocRef, followData);
                transaction.set(followerDocRef, followerData);
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

export async function removeFollower(userId: string, followerId: string): Promise<{ success: boolean, error?: string }> {
    if (!userId || !followerId) {
        return { success: false, error: 'Invalid user or follower ID.' };
    }

    const userRef = doc(db, 'users', userId);
    const followerRef = doc(db, 'users', followerId);
    const followerDocRef = doc(userRef, 'followers', followerId);
    const followingDocRef = doc(followerRef, 'following', userId);

    try {
         await runTransaction(db, async (transaction) => {
            transaction.delete(followerDocRef);
            transaction.delete(followingDocRef);
            transaction.update(userRef, { followers: increment(-1) });
            transaction.update(followerRef, { following: increment(-1) });
        });
        return { success: true };
    } catch (error) {
        console.error("Remove follower transaction failed:", error);
        return { success: false, error: 'Failed to remove follower.' };
    }
}


const authorConverter = {
    fromFirestore: (snapshot: any, options: any): Author => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            name: data.name,
            avatar: data.avatar,
            email: data.email,
            bio: data.bio,
            instagramUrl: data.instagramUrl,
            signature: data.signature,
            showEmail: data.showEmail || false,
            followers: data.followers || 0,
            following: data.following || 0,
        };
    },
    toFirestore: (author: Omit<Author, 'id'>) => {
        return author;
    }
};

export async function getFollowList(userId: string, type: 'followers' | 'following'): Promise<Author[]> {
    if (!userId) return [];
    
    const listCollection = collection(db, 'users', userId, type);
    const listSnapshot = await getDocs(listCollection);
    const userIds = listSnapshot.docs.map(d => d.id);
    
    if (userIds.length === 0) return [];
    
    const userPromises = userIds.map(id => getDoc(doc(db, 'users', id).withConverter(authorConverter)));
    const userDocs = await Promise.all(userPromises);
    
    return userDocs.filter(d => d.exists()).map(d => d.data() as Author);
}
