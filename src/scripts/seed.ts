
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc, query, limit, deleteDoc } from 'firebase/firestore';
import { initialPostsData, initialNotificationsData, initialBulletinsData } from '../lib/data-store';
import 'dotenv/config'

const clearCollection = async (collectionPath: string) => {
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared collection: ${collectionPath}`);
}


const seedDatabase = async () => {
    console.log("Starting database seed...");

    // Clear existing data to prevent duplicates
    await clearCollection('posts');
    await clearCollection('notifications');
    await clearCollection('bulletins');
    
    // Note: This doesn't clear subcollections like comments, but for this app's seeding it's okay.
    // A more robust solution would recursively delete subcollections.

    // Seed Posts
    console.log("Seeding posts...");
    const postBatch = writeBatch(db);
    initialPostsData.forEach(postData => {
        const { comments, ...post } = postData;
        // Use slug as document ID to prevent duplicates
        const postRef = doc(db, 'posts', post.slug);
        postBatch.set(postRef, { ...post, publishedAt: new Date(post.publishedAt) });

        if (comments) {
            comments.forEach(commentData => {
                const commentRef = doc(collection(postRef, 'comments'));
                postBatch.set(commentRef, { ...commentData, createdAt: new Date(commentData.createdAt) });
            });
        }
    });
    await postBatch.commit();
    console.log("Posts seeded successfully.");

    // Seed Notifications
    console.log("Seeding notifications...");
    const notifBatch = writeBatch(db);
    initialNotificationsData.forEach(notifData => {
        const notifRef = doc(collection(db, 'notifications'));
        notifBatch.set(notifRef, { ...notifData, createdAt: new Date(notifData.createdAt) });
    });
    await notifBatch.commit();
    console.log("Notifications seeded successfully.");

    // Seed Bulletins
    console.log("Seeding bulletins...");
    const bulletinBatch = writeBatch(db);
    initialBulletinsData.forEach(bulletinData => {
        const bulletinRef = doc(collection(db, 'bulletins'));
        bulletinBatch.set(bulletinRef, { ...bulletinData, publishedAt: new Date(bulletinData.publishedAt) });
    });
    await bulletinBatch.commit();
    console.log("Bulletins seeded successfully.");


    console.log("Database seeding finished.");
};

seedDatabase().catch(error => {
    console.error("Error seeding database:", error);
});
