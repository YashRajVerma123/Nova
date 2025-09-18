
'use client'

import { Post } from "@/lib/data";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


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
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setPortalContainer(document.getElementById('post-actions-container'));

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
        // Use a more stable random seed based on slug
        const seed = post.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const initialLikes = (seed % 20) + 5;
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

  if (!isMounted || !portalContainer) {
    return null;
  }
  
  const actions = [
    {
      label: "Like",
      icon: <Heart className={cn("h-5 w-5 transition-all duration-300", liked ? 'fill-red-500 text-red-500' : '')} />,
      onClick: handleLike,
      content: likeCount,
    },
    {
      label: "Summarize",
      icon: <Newspaper className="h-5 w-5" />,
      onClick: handleSummarize,
    },
    {
      label: isBookmarked ? "Bookmarked" : "Bookmark",
      icon: <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-primary text-primary")} />,
      onClick: toggleBookmark,
    },
    {
      label: "Comments",
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: handleScrollToComments,
    },
    {
      label: "Share",
      icon: <Share2 className="h-5 w-5" />,
      onClick: () => {}, // Click handled by DialogTrigger
      isShare: true,
    }
  ];
  
  const actionBar = (
     <>
      {/* Mobile Bar */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center justify-center p-1.5 gap-1 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl">
              {actions.map((action, index) => (
                 action.isShare ? (
                    <Dialog key={action.label}>
                      <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10">
                            {action.icon}
                            <span className="sr-only">{action.label}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share this post</DialogTitle>
                          <DialogDescription>Anyone with this link will be able to view this post.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <Input defaultValue={currentUrl} readOnly />
                          <Button type="button" size="icon" onClick={handleCopyToClipboard}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button key={action.label} variant="ghost" size={action.content !== undefined ? 'sm' : 'icon'} onClick={action.onClick} className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10">
                      {action.icon}
                      {action.content !== undefined && <span className="ml-1.5 text-xs">{action.content}</span>}
                    </Button>
                  )
              ))}
          </div>
      </div>
      
      {/* Desktop Vertical Bar */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-50">
         <div className="p-2 glass-card flex flex-col gap-2 rounded-full">
            <TooltipProvider>
              {actions.map((action) => (
                <Tooltip key={action.label} delayDuration={100}>
                  <TooltipTrigger asChild>
                    {action.isShare ? (
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                              {action.icon}
                              <span className="sr-only">{action.label}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Share this post</DialogTitle>
                            <DialogDescription>Anyone with this link will be able to view this post.</DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center space-x-2">
                            <Input defaultValue={currentUrl} readOnly />
                            <Button type="button" size="icon" onClick={handleCopyToClipboard}><Copy className="h-4 w-4" /></Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={action.onClick} className="rounded-full h-11 w-11 relative">
                        {action.icon}
                        {action.content !== undefined && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {action.content}
                          </span>
                        )}
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
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
  );

  return ReactDOM.createPortal(actionBar, portalContainer);
}

    