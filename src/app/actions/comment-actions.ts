
'use server';

import { revalidatePath } from 'next/cache';
import { Author, Comment } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, runTransaction, Timestamp, getDoc } from 'firebase/firestore';

export async function addComment(
    postId: string, 
    content: string, 
    author: Author,
    parentId: string | null = null
) {
    if (!postId) {
        return { error: 'Post not found.' };
    }
    if (!author) {
        return { error: 'You must be logged in to comment.' };
    }
    
    const newCommentData = {
        content,
        author,
        createdAt: Timestamp.now(),
        likes: 0,
        highlighted: false,
        pinned: false,
        parentId,
    };
    
    const postRef = doc(db, 'posts', postId);
    const commentsCollection = collection(postRef, 'comments');
    const newCommentRef = await addDoc(commentsCollection, newCommentData);
    
    const newComment = {
        id: newCommentRef.id,
        ...newCommentData,
        createdAt: newCommentData.createdAt.toDate().toISOString(),
    }

    revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
    return { comment: newComment };
}


export async function toggleCommentLike(postId: string, commentId: string, isLiked: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    try {
        const newLikes = await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) {
                throw "Comment does not exist!";
            }
            const currentLikes = commentDoc.data().likes || 0;
            const newLikeCount = isLiked ? currentLikes - 1 : currentLikes + 1;
            transaction.update(commentRef, { likes: newLikeCount });
            return newLikeCount;
        });
        revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
        return { success: true, newLikes };

    } catch (error) {
        console.error("Like transaction failed: ", error);
        return { error: 'Failed to update like count.' };
    }
}

export async function updateComment(postId: string, commentId: string, newContent: string, authorId: string, isAdmin: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }

    const commentData = commentDoc.data();
    if (commentData.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to edit this comment.' };
    }

    await updateDoc(commentRef, { content: newContent });
    
    const updatedComment = { ...commentData, id: commentId, content: newContent, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;

    revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
    return { success: true, updatedComment };
}

export async function deleteComment(postId: string, commentId: string, authorId: string, isAdmin: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);
    
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    if (commentData.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to delete this comment.' };
    }

    await deleteDoc(commentRef);
    
    revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
    return { success: true };
}


export async function toggleCommentHighlight(postId: string, commentId: string, isAdmin: boolean) {
    if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    const newHighlightedState = !commentData.highlighted;
    await updateDoc(commentRef, { highlighted: newHighlightedState });
    
    const updatedComment = { ...commentData, id: commentId, highlighted: newHighlightedState, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;

    revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
    return { success: true, updatedComment };
}

export async function toggleCommentPin(postId: string, commentId: string, isAdmin: boolean) {
     if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    const newPinnedState = !commentData.pinned;
    await updateDoc(commentRef, { pinned: newPinnedState });

    const updatedComment = { ...commentData, id: commentId, pinned: newPinnedState, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;
    
    revalidatePath(`/posts/${(await getDoc(postRef)).data()?.slug}`);
    return { success: true, updatedComment };
}
