

'use client';

import { Author, isFollowing } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Users, BadgeCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import FollowButton from "./follow-button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";


interface ProfileCardProps {
    user: Author;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const gradientClasses = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-green-500",
    "from-red-500 to-yellow-500",
    "from-indigo-500 to-cyan-500",
    "from-fuchsia-500 to-rose-500",
];

const ProfileCard = ({ user: initialUser }: ProfileCardProps) => {
    const { user: loggedInUser } = useAuth();
    const [isFollowingState, setIsFollowingState] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(true);
    const [author, setAuthor] = useState(initialUser);

    const randomGradient = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * gradientClasses.length);
        return gradientClasses[randomIndex];
    }, [author.id]);


    useEffect(() => {
        setAuthor(initialUser);
    }, [initialUser]);

    useEffect(() => {
        const checkFollowing = async () => {
            if (loggedInUser && loggedInUser.id !== author.id) {
                setIsLoadingFollow(true);
                const following = await isFollowing(loggedInUser.id, author.id);
                setIsFollowingState(following);
                setIsLoadingFollow(false);
            } else {
                setIsLoadingFollow(false);
            }
        };
        checkFollowing();
    }, [loggedInUser, author.id]);

    const handleFollowToggle = (newFollowState: boolean) => {
        setIsFollowingState(newFollowState);
        setAuthor(prev => ({
            ...prev,
            followers: (prev.followers || 0) + (newFollowState ? 1 : -1)
        }));
    };

    const isMainAuthor = author.email === 'yashrajverma916@gmail.com';
    const signature = author?.signature || "V.Yash.Raj";
    
    const cardContent = (
         <div className="relative flex flex-col items-center p-6 bg-background rounded-lg w-full">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center text-center gap-2">
                <h2 className="text-2xl font-bold font-headline">{author.name}</h2>
                {isMainAuthor && (
                     <Badge variant="default" className={cn("flex items-center gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", "badge-shine")}>
                        <BadgeCheck className="h-4 w-4" />
                        Verified Author
                    </Badge>
                )}
            </div>

            <div className="flex flex-col items-center gap-1 my-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{author.followers || 0} Followers</span>
                </div>
                {author.showEmail && author.email && (
                    <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{author.email}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 text-center text-muted-foreground px-4">
                 <p className="text-sm italic">
                    {author.bio || "This user hasn't written a bio yet."}
                 </p>
            </div>

            {isMainAuthor && (
                <p className="font-signature text-3xl mt-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">~{signature}</p>
            )}
            
            {!isLoadingFollow && loggedInUser && loggedInUser.id !== author.id && (
                <div className="mt-6 w-full max-w-[150px]">
                    <FollowButton
                        authorId={author.id}
                        isFollowing={isFollowingState}
                        onToggle={handleFollowToggle}
                    />
                </div>
            )}
        </div>
    );
    
    if (isMainAuthor) {
        return (
            <div className="relative p-0.5 overflow-hidden rounded-lg">
                <div className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#000_0,#000_50%,#a0aec0_75%,#fff_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#000_0,#000_50%,#a0aec0_75%,#fff_100%)]" />
                {cardContent}
            </div>
        );
    }
    
    return (
        <div className={cn("relative p-0.5 overflow-hidden rounded-lg bg-gradient-to-r", randomGradient)}>
            {cardContent}
        </div>
    );
};

export default ProfileCard;

