
import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy,
    limit,
    writeBatch,
    Timestamp,
    collectionGroup,
    where,
    addDoc,
    deleteDoc,
    updateDoc,
} from 'firebase/firestore';
import { initialPostsData, initialNotificationsData } from '@/lib/data-store';


export type Author = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type Comment = {
  id: string;
  content: string;
  author: Author;
  createdAt: string; // Should be ISO string
  likes: number;
  highlighted?: boolean;
  pinned?: boolean;
  parentId: string | null;
  // replies are now a subcollection, so not stored directly on the comment object
};

export type Post = {
  id: string; // The firestore document ID
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  author: Author;
  publishedAt: string; // Should be ISO string
  tags: string[];
  readTime: number; 
  featured?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  image?: string;
};

// Firestore data converters
const postConverter = {
    fromFirestore: (snapshot: any, options: any): Post => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            slug: data.slug,
            title: data.title,
            description: data.description,
            content: data.content,
            coverImage: data.coverImage,
            author: data.author,
            publishedAt: (data.publishedAt as Timestamp).toDate().toISOString(),
            tags: data.tags,
            readTime: data.readTime,
            featured: data.featured,
        };
    },
    toFirestore: (post: Omit<Post, 'id'>) => {
        return {
            ...post,
            publishedAt: Timestamp.fromDate(new Date(post.publishedAt)),
        };
    }
}

const notificationConverter = {
    fromFirestore: (snapshot: any, options: any): Notification => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            read: false, // read status is managed client-side
            image: data.image,
        };
    },
    toFirestore: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'> & {createdAt: Date}) => {
        return {
            title: notification.title,
            description: notification.description,
            image: notification.image,
            createdAt: notification.createdAt,
        };
    }
};


const commentConverter = {
    fromFirestore: (snapshot: any, options: any): Comment => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            content: data.content,
            author: data.author,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            likes: data.likes,
            highlighted: data.highlighted,
            pinned: data.pinned,
            parentId: data.parentId,
        };
    },
    toFirestore: (comment: Omit<Comment, 'id'>) => {
        return {
            ...comment,
            createdAt: Timestamp.fromDate(new Date(comment.createdAt)),
        };
    }
};

const seedDatabase = async () => {
    const postsCollection = collection(db, 'posts');
    const postsSnapshot = await getDocs(query(postsCollection, limit(1)));
    
    if (postsSnapshot.empty) {
        console.log("No posts found, seeding database...");
        const batch = writeBatch(db);
        initialPostsData.forEach(postData => {
            const { comments, ...post } = postData;
            const postRef = doc(collection(db, 'posts')).withConverter(postConverter);
            batch.set(postRef, post);
            
            if (comments) {
              comments.forEach(commentData => {
                  const commentRef = doc(collection(postRef, 'comments')).withConverter(commentConverter);
                  batch.set(commentRef, commentData);
              });
            }
        });
        await batch.commit();
        console.log("Posts seeded successfully.");
    }

    const notificationsCollection = collection(db, 'notifications');
    const notificationsSnapshot = await getDocs(query(notificationsCollection, limit(1)));
    if(notificationsSnapshot.empty) {
        console.log("No notifications found, seeding database...");
        const batch = writeBatch(db);
        initialNotificationsData.forEach(notifData => {
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, {
              ...notifData,
              createdAt: Timestamp.fromDate(new Date(notifData.createdAt))
            });
        });
        await batch.commit();
        console.log("Notifications seeded successfully.");
    }
}

const sortComments = (comments: Comment[]): Comment[] => {
    return [...comments].sort((a,b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const getPosts = async (): Promise<Post[]> => {
    await seedDatabase();
    const postsCollection = collection(db, 'posts').withConverter(postConverter);
    const q = query(postsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
};

export const getPost = async (slug: string): Promise<Post | undefined> => {
    await seedDatabase(); // Ensure data exists
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('slug', '==', slug), limit(1)).withConverter(postConverter);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return undefined;
    }
    
    const post = snapshot.docs[0].data();
    return post;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    if (!postId) return [];
    
    const commentsCollection = collection(db, 'posts', postId, 'comments').withConverter(commentConverter);
    const q = query(commentsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    let comments = snapshot.docs.map(doc => doc.data());
    
    return sortComments(comments);
};

export const getNotifications = async (): Promise<Notification[]> => {
    await seedDatabase();
    const notificationsCollection = collection(db, 'notifications').withConverter(notificationConverter);
    const q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
};

export async function addNotification(notification: { title: string; description: string, image?: string }) {
  const notificationsCollection = collection(db, 'notifications');
  await addDoc(notificationsCollection, {
    ...notification,
    createdAt: Timestamp.now(),
  });
}

export async function deleteNotification(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notifRef);
}

export async function updateNotification(notificationId: string, updates: { title: string; description: string, image?: string }) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, updates);
}

export const getNotification = async (id: string): Promise<Notification | null> => {
    const notifRef = doc(db, 'notifications', id).withConverter(notificationConverter);
    const snapshot = await getDoc(notifRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
}
