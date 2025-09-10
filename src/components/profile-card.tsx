
'use client';

import { Author } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, User } from "lucide-react";

interface ProfileCardProps {
    user: Author;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const ProfileCard = ({ user }: ProfileCardProps) => {
    return (
        <div className="flex flex-col items-center p-6 bg-card">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
            
            {user.showEmail && user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                </div>
            )}

            <div className="mt-4 text-center text-muted-foreground px-4">
                 <p className="text-sm italic">
                    {user.bio || "This user hasn't written a bio yet."}
                 </p>
            </div>
        </div>
    );
};

export default ProfileCard;
