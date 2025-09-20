
'use client'
import { useSearchParams } from 'next/navigation';
import { Post } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';
import { useEffect, useState } from 'react';

interface PostsClientProps {
  initialPosts: Post[];
}

const PostsClient = ({ initialPosts }: PostsClientProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    let sortedPosts = [...initialPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    if (!searchQuery) {
      setFilteredPosts(sortedPosts);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const isTagSearch = initialPosts.some(post => post.tags.some(tag => tag.toLowerCase() === lowercasedQuery));

      setFilteredPosts(sortedPosts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(lowercasedQuery);
        const descriptionMatch = post.description.toLowerCase().includes(lowercasedQuery);
        const tagMatch = post.tags.some(tag => tag.toLowerCase() === lowercasedQuery);

        if (isTagSearch) {
            return tagMatch;
        }
        
        return titleMatch || descriptionMatch || tagMatch;
      }));
    }
  }, [searchQuery, initialPosts]);
  
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : "All Articles"}<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {searchQuery ? `${filteredPosts.length} articles found.` : 'Explore our collection of stories, analyses, and insights from the team at Glare.'}
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

export default PostsClient;
