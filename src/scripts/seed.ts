
import 'dotenv/config'
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialPostsData, initialNotificationsData, initialBulletinsData } from '../lib/data-store';


const clearCollection = async (collectionPath: string) => {
    console.log(`Clearing collection: ${collectionPath}...`);
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        console.log(`Collection is already empty: ${collectionPath}`);
        return;
    }
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully cleared collection: ${collectionPath}`);
}

const seedDatabase = async () => {
    console.log("Starting database seed...");

    // --- Clearing logic ---
    await clearCollection('posts');
    await clearCollection('notifications');
    await clearCollection('bulletins');

    // --- Seeding logic ---
    console.log("Seeding posts...");
    const postBatch = writeBatch(db);
    for (const postData of initialPostsData) {
        const { comments, ...post } = postData;
        const postRef = doc(db, 'posts', post.slug);
        postBatch.set(postRef, { ...post, publishedAt: new Date(post.publishedAt) });

        if (comments) {
            for (const commentData of comments) {
                const commentRef = doc(collection(postRef, 'comments'));
                postBatch.set(commentRef, { ...commentData, createdAt: new Date(commentData.createdAt) });
            }
        }
    }
    await postBatch.commit();
    console.log("Posts seeded successfully.");

    console.log("Seeding notifications...");
    const notifBatch = writeBatch(db);
    initialNotificationsData.forEach(notifData => {
        const notifRef = doc(collection(db, 'notifications'));
        notifBatch.set(notifRef, { ...notifData, createdAt: new Date(notifData.createdAt) });
    });
    await notifBatch.commit();
    console.log("Notifications seeded successfully.");

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
    process.exit(1);
});
