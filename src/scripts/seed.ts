
import 'dotenv/config'
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialPostsData, initialNotificationsData, initialBulletinsData } from '../lib/data-store';


const clearCollection = async (collectionPath: string) => {
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
    console.log(`Cleared collection: ${collectionPath}`);
}

const seedDatabase = async () => {
    console.log("Starting database seed...");

    // --- Seeding logic ---
    const postsCollectionRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsCollectionRef);
    if (postsSnapshot.empty) {
        console.log("Seeding posts...");
        const postBatch = writeBatch(db);
        initialPostsData.forEach(postData => {
            const { comments, ...post } = postData;
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
    } else {
        console.log("Posts collection is not empty, skipping seeding.");
    }

    const notificationsCollectionRef = collection(db, 'notifications');
    const notifsSnapshot = await getDocs(notificationsCollectionRef);
    if (notifsSnapshot.empty) {
        console.log("Seeding notifications...");
        const notifBatch = writeBatch(db);
        initialNotificationsData.forEach(notifData => {
            const notifRef = doc(collection(db, 'notifications'));
            notifBatch.set(notifRef, { ...notifData, createdAt: new Date(notifData.createdAt) });
        });
        await notifBatch.commit();
        console.log("Notifications seeded successfully.");
    } else {
        console.log("Notifications collection is not empty, skipping seeding.");
    }

    const bulletinsCollectionRef = collection(db, 'bulletins');
    const bulletinsSnapshot = await getDocs(bulletinsCollectionRef);
    if (bulletinsSnapshot.empty) {
        console.log("Seeding bulletins...");
        const bulletinBatch = writeBatch(db);
        initialBulletinsData.forEach(bulletinData => {
            const bulletinRef = doc(collection(db, 'bulletins'));
            bulletinBatch.set(bulletinRef, { ...bulletinData, publishedAt: new Date(bulletinData.publishedAt) });
        });
        await bulletinBatch.commit();
        console.log("Bulletins seeded successfully.");
    } else {
        console.log("Bulletins collection is not empty, skipping seeding.");
    }

    console.log("Database seeding finished.");
};

seedDatabase().catch(error => {
    console.error("Error seeding database:", error);
    process.exit(1);
});
