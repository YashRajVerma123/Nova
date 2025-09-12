
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface RecentPostCardProps {
  post: Post;
}

const RecentPostCard = ({ post }: RecentPostCardProps) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <div className="glass-card h-full flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            data-ai-hint="blog cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow md:w-2/3">
          <h3 className="font-headline text-xl lg:text-2xl font-bold leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-2">{post.description}</p>
          
          <div className="text-xs text-muted-foreground flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min read</span>
              </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.author.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentPostCard;
