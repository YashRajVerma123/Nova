
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookmarkX, Calendar } from 'lucide-react';
import { Post } from '@/lib/data';

type BookmarkedPost = Pick<Post, 'slug' | 'title' | 'description' | 'coverImage'> & {
    bookmarkedAt: string;
};

const BOOKMARKED_POSTS_KEY = 'bookmarked_posts';
const READING_PROGRESS_KEY = 'reading_progress';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [readingProgress, setReadingProgress] = useState<{ [slug: string]: number }>({});
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const storedBookmarks = JSON.parse(localStorage.getItem(BOOKMARKED_POSTS_KEY) || '{}');
    const storedProgress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
    
    const bookmarksArray: BookmarkedPost[] = Object.values(storedBookmarks);
    bookmarksArray.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());
    
    setBookmarks(bookmarksArray);
    setReadingProgress(storedProgress);
  }, []);

  const removeBookmark = (slug: string) => {
    // Update state first for immediate UI feedback
    setBookmarks(bookmarks.filter(b => b.slug !== slug));
    
    // Then update localStorage
    const storedBookmarks = JSON.parse(localStorage.getItem(BOOKMARKED_POSTS_KEY) || '{}');
    delete storedBookmarks[slug];
    localStorage.setItem(BOOKMARKED_POSTS_KEY, JSON.stringify(storedBookmarks));

    const storedProgress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
    delete storedProgress[slug];
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(storedProgress));
  };

  if (!isClient) {
     return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          My Bookmarks<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Articles you've saved for later. Pick up right where you left off.
        </p>
      </section>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarks.map((bookmark) => (
             <div key={bookmark.slug} className="glass-card group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                 <Link href={`/posts/${bookmark.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={bookmark.coverImage}
                        alt={bookmark.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                     <Link href={`/posts/${bookmark.slug}`} className="block">
                        <h3 className="font-headline text-xl font-bold leading-snug mb-2 group-hover:text-primary transition-colors">
                            {bookmark.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-grow">{bookmark.description}</p>
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-4 mb-4 mt-auto">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Bookmarked: {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeBookmark(bookmark.slug)}>
                        <BookmarkX className="mr-2 h-4 w-4" />
                        Remove Bookmark
                    </Button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card">
            <h2 className="text-2xl font-headline font-bold mb-4">No Bookmarks Yet</h2>
            <p className="text-muted-foreground mb-6">
                Click the bookmark icon on any article to save it for later.
            </p>
            <Button asChild>
                <Link href="/posts">Explore Articles</Link>
            </Button>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
