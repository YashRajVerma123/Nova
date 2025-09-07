
'use client';

// In a real app, this would be a call to a database.
// We are using an in-memory store for demonstration purposes.
import { posts as initialPosts } from '@/lib/data-store';

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
  createdAt: string;
  likes: number;
  replies: Comment[];
  highlighted?: boolean;
  pinned?: boolean;
  parentId: string | null;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  author: Author;
  publishedAt: string;
  tags: string[];
  readTime: number; 
  featured?: boolean;
  comments: Comment[];
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  image?: string;
};


const sortComments = (commentList: Comment[]) => {
    // True comes before false. Pinned items will be at the top.
    // For items with the same pinned status, sort by date.
    return [...commentList].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPosts = (): Post[] => {
    // Sort comments within each post before returning
    const posts = initialPosts;
    return posts.map(p => ({
        ...p,
        comments: sortComments(p.comments),
    }));
};

export const getPost = (slug: string): Post | undefined => {
    const post = initialPosts.find(p => p.slug === slug);
    if (!post) return undefined;
    
    // Recursively sort all replies as well
    const sortAllReplies = (comments: Comment[]): Comment[] => {
        return sortComments(comments).map(c => ({
            ...c,
            replies: c.replies ? sortAllReplies(c.replies) : [],
        }));
    }

    return {
        ...post,
        comments: sortAllReplies(post.comments),
    }
}

export let notifications: Notification[] = [
    { id: 'n1', title: 'New Feature: Post Summaries', description: 'We\'ve added AI-powered summaries to our posts!', createdAt: '2024-07-28T12:00:00Z', read: false },
    { id: 'n2', title: 'Welcome to the new Nova!', description: 'Our new website is live. We hope you enjoy the new design and features.', createdAt: '2024-07-27T09:00:00Z', read: true },
];

// In-memory data modification functions.
// In a real app, these would be API calls to a database.
export function addPost(post: Post) {
  initialPosts.unshift(post);
}

export function addNotification(notification: Notification) {
  notifications.unshift(notification);
}
