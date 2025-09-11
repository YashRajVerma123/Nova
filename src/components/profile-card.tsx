

'use client';

import { Author, isFollowing } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Users, Star } from "lucide-react";
import { useEffect, useState } from "react";
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

const getRandomHslColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`;

const ProfileCard = ({ user: initialUser }: ProfileCardProps) => {
    const [gradientColors, setGradientColors] = useState({ from: '#E2CBFF', to: '#393BB2' });
    const [isMounted, setIsMounted] = useState(false);
    const { user: loggedInUser } = useAuth();
    const [isFollowingState, setIsFollowingState] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(true);
    const [author, setAuthor] = useState(initialUser);

    useEffect(() => {
        setAuthor(initialUser);
    }, [initialUser]);

    useEffect(() => {
        setIsMounted(true);
        setGradientColors({
            from: getRandomHslColor(),
            to: getRandomHslColor(),
        });
        
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

    const gradientStyle = {
        background: `conic-gradient(from 90deg at 50% 50%, ${gradientColors.from} 0%, ${gradientColors.to} 50%, ${gradientColors.from} 100%)`,
    };

    const isMainAuthor = author.email === 'yashrajverma916@gmail.com';

    const renderCardContent = () => (
        <>
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-headline">{author.name}</h2>
                {isMainAuthor && (
                     <Badge variant="default" className="flex items-center gap-1 border-primary/50 bg-primary/10 text-primary hover:bg-primary/20">
                        <Star className="h-3 w-3" />
                        Author
                    </Badge>
                )}
            </div>

             <div className="flex items-center gap-4 my-2 text-sm text-muted-foreground">
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
            
            {!isLoadingFollow && loggedInUser && loggedInUser.id !== author.id && (
                <div className="mt-6 w-full max-w-[150px]">
                    <FollowButton
                        authorId={author.id}
                        isFollowing={isFollowingState}
                        onToggle={handleFollowToggle}
                    />
                </div>
            )}
        </>
    );

    if (!isMounted) {
        return (
            <div className="relative p-0.5 overflow-hidden rounded-lg">
                <div className="relative flex flex-col items-center p-6 bg-background rounded-lg">
                    {renderCardContent()}
                </div>
            </div>
        );
    }

    return (
        <div className="relative p-0.5 overflow-hidden rounded-lg">
            <div className="absolute inset-[-1000%] animate-[spin_5s_linear_infinite]" style={gradientStyle} />
            <div className="relative flex flex-col items-center p-6 bg-background rounded-lg">
                {renderCardContent()}
            </div>
        </div>
    );
};

export default ProfileCard;
