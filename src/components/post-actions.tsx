
'use client'

import { Post } from "@/lib/data";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Heart, Share2, Copy, Bookmark, Newspaper, Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { summarizeBlogPost } from "@/ai/flows/summarize-blog-posts";
import { Separator } from "./ui/separator";

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
  const [isSummaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

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


  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);

    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '{}');
    if (newLikedState) {
      likedPosts[post.slug] = true;
    } else {
      delete likedPosts[post.slug];
    }
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(likedPosts));

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
  
  const handleSummarize = async () => {
    setSummaryDialogOpen(true);
    setIsSummarizing(true);
    try {
        const result = await summarizeBlogPost({ blogPostContent: post.content });
        setSummary(result.summary);
    } catch(e) {
        setSummary("Sorry, I couldn't generate a summary for this article at the moment.");
        console.error(e);
    } finally {
        setIsSummarizing(false);
    }
  }

  const handleScrollToComments = () => {
    const commentSection = document.querySelector('#comments');
    if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="glass-card flex items-center justify-center p-2 gap-2">
              <Button variant="ghost" size="sm" onClick={handleLike}>
                <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {likeCount}
              </Button>
               <Separator orientation="vertical" className="h-6 bg-border/50" />
               <Button variant="ghost" size="icon" onClick={handleSummarize}>
                <Newspaper className="h-4 w-4" />
                 <span className="sr-only">Summarize</span>
              </Button>
              <Separator orientation="vertical" className="h-6 bg-border/50" />
              <Button variant="ghost" size="icon" onClick={toggleBookmark}>
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")} />
                <span className="sr-only">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </Button>
              <Separator orientation="vertical" className="h-6 bg-border/50" />
              <Button variant="ghost" size="icon" onClick={handleScrollToComments}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">Comments</span>
              </Button>
               <Separator orientation="vertical" className="h-6 bg-border/50" />
              <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
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
      </div>

      <AlertDialog open={isSummaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Summary</AlertDialogTitle>
            <AlertDialogDescription>
              Here's a quick summary of the article, generated by AI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isSummarizing ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
             <div className="text-sm text-muted-foreground max-h-60 overflow-y-auto">
                <p>{summary}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
