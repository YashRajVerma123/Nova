import { posts } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';

const PostsPage = () => {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          All Articles<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our collection of stories, analyses, and insights from the team at Nova.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPosts.map((post, index) => (
          <BlogPostCard key={post.slug} post={post} priority={index < 3} />
        ))}
      </div>
    </div>
  );
};

export default PostsPage;
