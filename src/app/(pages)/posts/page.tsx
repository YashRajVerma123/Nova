
'use client'
import { useSearchParams } from 'next/navigation';
import { getPosts } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';
import { useMemo } from 'react';

const PostsPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  const filteredPosts = useMemo(() => {
    let allPosts = getPosts();
    let sortedPosts = [...allPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    if (!searchQuery) {
      return sortedPosts;
    }
    return sortedPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : "All Articles"}<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {searchQuery ? `${filteredPosts.length} articles found.` : 'Explore our collection of stories, analyses, and insights from the team at Nova.'}
        </p>
      </section>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <BlogPostCard key={post.slug} post={post} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="text-center">
            <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
