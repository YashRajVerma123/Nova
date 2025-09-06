
'use server';

import { revalidatePath } from 'next/cache';
import { posts, authors, Comment, Post } from '@/lib/data';

const findPost = (slug: string): Post => {
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
}

const findCommentRecursive = (comments: Comment[], commentId: string): { comment: Comment | null, parentReplies: Comment[] | null } => {
    for (const comment of comments) {
        if (comment.id === commentId) {
            return { comment, parentReplies: comments };
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentRecursive(comment.replies, commentId);
            if (found.comment) return found;
        }
    }
    return { comment: null, parentReplies: null };
};

export async function addComment(postSlug: string, content: string, authorId: string): Promise<Post> {
    const post = findPost(postSlug);
    const author = Object.values(authors).find(a => a.id === authorId);
    if (!author) throw new Error("Invalid author ID");

    const newComment: Comment = {
        id: `c${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
    };
    
    post.comments.unshift(newComment);
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

export async function addReply(postSlug: string, parentCommentId: string, content: string, authorId: string): Promise<Post> {
    const post = findPost(postSlug);
    const author = Object.values(authors).find(a => a.id === authorId);
    if (!author) throw new Error("Invalid author ID");

    const { comment: parentComment } = findCommentRecursive(post.comments, parentCommentId);
    if (!parentComment) throw new Error('Parent comment not found');

    const newReply: Comment = {
        id: `r${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [], 
    };

    parentComment.replies.unshift(newReply);
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

export async function updateComment(postSlug: string, commentId: string, newContent: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment } = findCommentRecursive(post.comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

export async function deleteComment(postSlug: string, commentId: string): Promise<Post> {
    const post = findPost(postSlug);
    const index = post.comments.findIndex(c => c.id === commentId);
    if (index === -1) throw new Error('Comment not found');
    
    post.comments.splice(index, 1);
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

export async function updateReply(postSlug: string, commentId: string, replyId: string, newContent: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment: parentComment } = findCommentRecursive(post.comments, commentId);
    if (!parentComment || !parentComment.replies) throw new Error('Parent comment not found');
    
    const reply = parentComment.replies.find(r => r.id === replyId);
    if (!reply) throw new Error('Reply not found');

    reply.content = newContent;
    revalidatePath(`/posts/${postSlug}`);
    return post;
}

export async function deleteReply(postSlug: string, commentId: string, replyId: string): Promise<Post> {
    const post = findPost(postSlug);
    const { comment: parentComment } = findCommentRecursive(post.comments, commentId);
    if (!parentComment || !parentComment.replies) throw new Error('Parent comment not found');

    const index = parentComment.replies.findIndex(r => r.id === replyId);
    if (index === -1) throw new Error('Reply not found');

    parentComment.replies.splice(index, 1);
    revalidatePath(`/posts/${postSlug}`);
    return post;
}
