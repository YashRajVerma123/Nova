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


export const getPosts = (): Post[] => {
    return posts.map(post => ({
        ...post,
        comments: comments.filter(c => c.postSlug === post.slug && !c.parentId).sort((a,b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }));
};

export const getPost = (slug: string): Post | undefined => {
    const post = posts.find(p => p.slug === slug);
    if (!post) return undefined;
    
    const buildCommentTree = (commentList: (Comment & { postSlug: string, parentId: string | null})[]): Comment[] => {
        const commentMap = new Map(commentList.map(c => [c.id, {...c, replies: []}]));
        const rootComments: Comment[] = [];

        commentList.forEach(comment => {
            if (comment.parentId && commentMap.has(comment.parentId)) {
                const parent = commentMap.get(comment.parentId)!;
                parent.replies.push(commentMap.get(comment.id)!);
            } else {
                rootComments.push(commentMap.get(comment.id)!);
            }
        });
        return rootComments.sort((a,b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const postComments = comments.filter(c => c.postSlug === slug);

    return {
        ...post,
        comments: buildCommentTree(postComments),
    }
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
