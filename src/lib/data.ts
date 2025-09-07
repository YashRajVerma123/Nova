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
    where
} from 'firebase/firestore';
import { initialPostsData } from '@/lib/data-store';


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
    const snapshot = await getDocs(query(postsCollection, limit(1)));
    
    if (snapshot.empty) {
        console.log("No posts found, seeding database...");
        const batch = writeBatch(db);
        initialPostsData.forEach(postData => {
            const { comments, ...post } = postData;
            const postRef = doc(collection(db, 'posts')).withConverter(postConverter);
            batch.set(postRef, post);
            
            comments?.forEach(commentData => {
                const commentRef = doc(collection(postRef, 'comments')).withConverter(commentConverter);
                batch.set(commentRef, commentData);
            });
        });
        await batch.commit();
        console.log("Database seeded successfully.");
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
    const q = query(commentsCollection, orderBy('pinned', 'desc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    let comments = snapshot.docs.map(doc => doc.data());

    // In Firestore, you can't have nested subcollections on a document,
    // so we model replies with a parentId and fetch them separately.
    // For simplicity here, we'll fetch only top-level comments.
    // A more complex app would fetch replies recursively.
    
    return sortComments(comments.filter(c => c.parentId === null));
};


export let notifications: Notification[] = [
    { id: 'n1', title: 'New Feature: Post Summaries', description: 'We\'ve added AI-powered summaries to our posts!', createdAt: '2024-07-28T12:00:00Z', read: false },
    { id: 'n2', title: 'Welcome to the new Nova!', description: 'Our new website is live. We hope you enjoy the new design and features.', createdAt: '2024-07-27T09:00:00Z', read: true },
];

export function addNotification(notification: Notification) {
  notifications.unshift(notification);
}
