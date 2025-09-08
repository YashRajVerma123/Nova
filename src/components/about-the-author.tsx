

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from 'next/link';
import { Instagram } from "lucide-react";
import { getAuthorByEmail } from "@/lib/data";

const AboutTheAuthor = async () => {
  const author = await getAuthorByEmail("yashrajverma916@gmail.com");
  
  const authorAvatar = author?.avatar || "https://i.pravatar.cc/150?u=yash-raj";
  const authorName = author?.name || "Yash Raj Verma";
  
  return (
    <section>
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">About the Author</h2>
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/10 rounded-full blur-xl"></div>
             <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/10 rounded-full blur-xl"></div>
            <Avatar className="h-32 w-32 border-4 border-primary/20 shrink-0">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>YV</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-headline font-bold">{authorName}</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Hi, I'm Yash Raj Verma. Welcome to Nova, my personal blog where I explore the rapidly evolving worlds of technology, AI, space, and breaking news. I break down complex topics into clear, engaging insights. Thanks for reading.
                </p>
                 <Link href="https://instagram.com/v.yash.raj" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <Instagram className="h-4 w-4" />
                    Follow on Instagram
                 </Link>
            </div>
             <div className="self-end">
                <p className="font-signature text-4xl text-primary/80">V.Yash.Raj</p>
             </div>
        </div>
    </section>
  );
};

export default AboutTheAuthor;
