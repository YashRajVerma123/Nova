
import { posts, comments } from './data-store';
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
  postSlug: string;
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
    return commentList.sort((a,b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPosts = (): Post[] => {
    const allPosts = [...posts];
    const allComments = [...comments];
    return allPosts.map(post => {
        const postComments = allComments.filter(c => c.postSlug === post.slug);
        return {
            ...post,
            comments: buildCommentTree(postComments),
        }
    });
};

export const getPost = (slug: string): Post | undefined => {
    const allPosts = [...posts];
    const allComments = [...comments];

    const post = allPosts.find(p => p.slug === slug);
    if (!post) return undefined;
    
    const postComments = allComments.filter(c => c.postSlug === slug);

    return {
        ...post,
        comments: buildCommentTree(postComments),
    }
}

const buildCommentTree = (commentList: Comment[]): Comment[] => {
    const commentMap = new Map(commentList.map(c => [c.id, {...c, replies: []}]));
    const rootComments: Comment[] = [];

    commentList.forEach(comment => {
        const currentComment = commentMap.get(comment.id)!;
        if (comment.parentId && commentMap.has(comment.parentId)) {
            const parent = commentMap.get(comment.parentId)!;
            // Ensure replies array exists
            if (!parent.replies) {
                parent.replies = [];
            }
            parent.replies.push(currentComment);
        } else {
            rootComments.push(currentComment);
        }
    });

    // Sort replies within each comment as well
    commentMap.forEach(comment => {
        if(comment.replies && comment.replies.length > 0) {
            comment.replies = sortComments(comment.replies);
        }
    });

    return sortComments(rootComments);
}


export let notifications: Notification[] = [
    { id: 'n1', title: 'New Feature: Post Summaries', description: 'We\'ve added AI-powered summaries to our posts!', createdAt: '2024-07-28T12:00:00Z', read: false },
    { id: 'n2', title: 'Welcome to the new Nova!', description: 'Our new website is live. We hope you enjoy the new design and features.', createdAt: '2024-07-27T09:00:00Z', read: true },
];

// In-memory data modification functions.
// In a real app, these would be API calls to a database.
export function addPost(post: Post) {
  posts.unshift(post);
}

export function addNotification(notification: Notification) {
  notifications.unshift(notification);
}
