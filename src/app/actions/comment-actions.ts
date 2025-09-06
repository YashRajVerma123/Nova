
'use server';

import { revalidatePath } from 'next/cache';
import { posts, authors, Comment } from '@/lib/data';

// In a real app, you'd have proper auth checks here.
// For now, we trust the userId passed from the client.

// Helper to find a comment/reply in the nested structure
const findComment = (comments: Comment[], id: string): {comment: Comment | null, parent: Comment[] | null, parentReplies: Comment[] | null } => {
    for (const comment of comments) {
        if (comment.id === id) {
            return { comment, parent: comments, parentReplies: null };
        }
        if (comment.replies && comment.replies.length > 0) {
            const foundInReplies = findComment(comment.replies, id);
            if (foundInReplies.comment) {
                // if found in replies, the "parent" is actually the replies array of the container comment
                return { comment: foundInReplies.comment, parent: comments, parentReplies: comment.replies };
            }
        }
    }
    return { comment: null, parent: null, parentReplies: null };
};

const findParentComment = (comments: Comment[], id: string): Comment | null => {
    for (const comment of comments) {
        if (comment.id === id) {
            return comment;
        }
        if (comment.replies) {
            const found = findParentComment(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
}

const findPostAndRevalidate = (slug: string) => {
    const post = posts.find(p => p.slug === slug);
    if (!post) {
        throw new Error('Post not found');
    }
    revalidatePath(`/posts/${slug}`);
    return post;
}

export async function addComment(postSlug: string, content: string, authorId: string) {
    const post = findPostAndRevalidate(postSlug);
    const author = Object.values(authors).find(a => a.id === authorId);

    if (!author) {
        throw new Error("Invalid author ID");
    }

    const newComment: Comment = {
        id: `c${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
    };
    
    post.comments.unshift(newComment);
    return post.comments;
}

export async function addReply(postSlug: string, parentCommentId: string, content: string, authorId: string) {
    const post = findPostAndRevalidate(postSlug);
    const author = Object.values(authors).find(a => a.id === authorId);

    if (!author) {
        throw new Error("Invalid author ID");
    }

    const parentComment = findParentComment(post.comments, parentCommentId);
    
    if (!parentComment) {
        throw new Error('Parent comment not found');
    }

    const newReply: Comment = {
        id: `r${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [], // Not supporting nested replies for now
    };

    if (!parentComment.replies) {
        parentComment.replies = [];
    }
    parentComment.replies.unshift(newReply);
    
    return post.comments;
}


export async function updateComment(postSlug: string, commentId: string, newContent: string) {
    const post = findPostAndRevalidate(postSlug);
    const { comment } = findComment(post.comments, commentId);

    if (!comment) {
        throw new Error('Comment not found');
    }

    comment.content = newContent;
    return post.comments;
}


export async function deleteComment(postSlug: string, commentId: string) {
    const post = findPostAndRevalidate(postSlug);
    
    const index = post.comments.findIndex(c => c.id === commentId);
    if (index > -1) {
        post.comments.splice(index, 1);
    } else {
        // This should not happen if called from UI correctly, but as a safeguard.
        throw new Error('Comment not found in root level');
    }
    
    return post.comments;
}

export async function updateReply(postSlug: string, commentId: string, replyId: string, newContent: string) {
    const post = findPostAndRevalidate(postSlug);
    const parentComment = findParentComment(post.comments, commentId);

    if (!parentComment || !parentComment.replies) {
        throw new Error('Parent comment not found');
    }

    const reply = parentComment.replies.find(r => r.id === replyId);
    if (!reply) {
        throw new Error('Reply not found');
    }

    reply.content = newContent;
    return post.comments;
}

export async function deleteReply(postSlug: string, commentId: string, replyId: string) {
    const post = findPostAndRevalidate(postSlug);
    const parentComment = findParentComment(post.comments, commentId);

    if (!parentComment || !parentComment.replies) {
        throw new Error('Parent comment not found');
    }

    const index = parentComment.replies.findIndex(r => r.id === replyId);
    if (index > -1) {
        parentComment.replies.splice(index, 1);
    } else {
        throw new Error('Reply not found');
    }

    return post.comments;
}
