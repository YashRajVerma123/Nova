
'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { File, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Post, getPosts } from '@/lib/data';
import Link from 'next/link';

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Post[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }
    const posts = getPosts();
    const filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setResults(filteredPosts.slice(0, 5));
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFocused(false);
    if (query.trim()) {
      router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/posts');
    }
  };

  const handleResultClick = () => {
    setIsFocused(false);
    setQuery('');
  };


  return (
    <div className="relative w-full max-w-xs md:max-w-sm" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search articles..."
            className="pr-10 h-10 w-full bg-secondary text-base md:text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </form>

      {isFocused && query && (
        <div className="absolute top-full mt-2 w-full glass-card rounded-md shadow-lg z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
                  >
                    <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
           <div className="p-2 border-t border-border/10">
                <button
                    onClick={() => {
                        setIsFocused(false);
                        router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="w-full text-center text-sm py-2 text-primary hover:underline"
                >
                    View all results
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
