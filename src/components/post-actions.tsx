
'use client'

import { Post } from "@/lib/data";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Heart, Share2, Copy, Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LIKED_POSTS_KEY = 'likedPosts';
const POST_LIKE_COUNTS_KEY = 'postLikeCounts';
const BOOKMARKED_POSTS_KEY = 'bookmarked_posts';
const READING_PROGRESS_KEY = 'reading_progress';


export default function PostActions({ post }: { post: Post }) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);

      // Liked status
      const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '{}');
      if (likedPosts[post.slug]) {
        setLiked(true);
      }

      // Like count
      const likeCounts = JSON.parse(localStorage.getItem(POST_LIKE_COUNTS_KEY) || '{}');
      if (likeCounts[post.slug]) {
        setLikeCount(likeCounts[post.slug]);
      } else {
        // If no like count is stored, initialize it with a random number and store it.
        const initialLikes = Math.floor(Math.random() * 25) + 5;
        setLikeCount(initialLikes);
        likeCounts[post.slug] = initialLikes;
        localStorage.setItem(POST_LIKE_COUNTS_KEY, JSON.stringify(likeCounts));
      }

      // Bookmark status
      const bookmarkedPosts = JSON.parse(localStorage.getItem(BOOKMARKED_POSTS_KEY) || '{}');
      if (bookmarkedPosts[post.slug]) {
        setIsBookmarked(true);
      }
    }
  }, [post.slug]);

  if (!isMounted) {
    // Render a placeholder or nothing on the server
    return <div className="flex items-center justify-between h-10"></div>;
  }

  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);

    // Update liked status in localStorage
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '{}');
    if (newLikedState) {
      likedPosts[post.slug] = true;
    } else {
      delete likedPosts[post.slug];
    }
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(likedPosts));

    // Update like count in localStorage
    const likeCounts = JSON.parse(localStorage.getItem(POST_LIKE_COUNTS_KEY) || '{}');
    likeCounts[post.slug] = newLikeCount;
    localStorage.setItem(POST_LIKE_COUNTS_KEY, JSON.stringify(likeCounts));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: 'Link copied to clipboard!' });
  };

  const toggleBookmark = () => {
    const bookmarkedPosts = JSON.parse(localStorage.getItem(BOOKMARKED_POSTS_KEY) || '{}');
    const readingProgress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || '{}');
    const newIsBookmarked = !isBookmarked;

    if (newIsBookmarked) {
        bookmarkedPosts[post.slug] = {
            slug: post.slug,
            title: post.title,
            description: post.description,
            coverImage: post.coverImage,
            bookmarkedAt: new Date().toISOString()
        };
        toast({ title: 'Article Bookmarked!', description: 'You can find it in your bookmarks.' });
    } else {
        delete bookmarkedPosts[post.slug];
        delete readingProgress[post.slug]; // Also remove reading progress
        localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(readingProgress));
        toast({ title: 'Bookmark Removed', variant: 'destructive' });
    }

    localStorage.setItem(BOOKMARKED_POSTS_KEY, JSON.stringify(bookmarkedPosts));
    setIsBookmarked(newIsBookmarked);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleLike}>
          <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          {likeCount}
        </Button>
      </div>

      <div className="flex justify-center">
         <Button variant="outline" size="sm" onClick={toggleBookmark}>
            <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-primary text-primary")} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
            <DialogDescription>
              Anyone with this link will be able to view this post.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="link"
                defaultValue={currentUrl}
                readOnly
              />
            </div>
            <Button type="button" size="icon" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
