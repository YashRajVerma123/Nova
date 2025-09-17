
import { notFound } from 'next/navigation';
import { Post, getPost, getPosts, getComments } from '@/lib/data';
import PostClientPage from './post-client-page';
import PostActions from '@/components/post-actions';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch data in parallel for better performance
  const [post, allPosts, initialComments] = await Promise.all([
    getPost(slug),
    getPosts(),
    getPost(slug).then(p => p ? getComments(p.id) : [])
  ]);
  
  if (!post) {
      return notFound();
  }

  // Filter related posts after fetching
  const relatedPosts = allPosts.filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag))).slice(0, 3);
  
  return (
    <>
      <PostClientPage post={post} relatedPosts={relatedPosts} initialComments={initialComments} />
      <PostActions post={post} />
    </>
  );
};
