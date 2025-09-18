
import { notFound } from 'next/navigation';
import { Post, getPost, getPosts, getComments } from '@/lib/data';
import PostClientPage from './post-client-page';
import PostActions from '@/components/post-actions';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug
 
  // fetch data
  const post = await getPost(slug)
 
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The post you are looking for does not exist.',
    }
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
 
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/posts/${post.slug}`,
      siteName: 'Glare',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
        },
        ...previousImages,
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.coverImage],
      creator: `@${post.author.name.replace(' ', '')}`,
    },
     alternates: {
      canonical: `/posts/${post.slug}`,
    },
  }
}

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
