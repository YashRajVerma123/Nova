
'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users } from "lucide-react";
import { posts } from "@/lib/data";

const AdminPage = () => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
        setTotalPosts(posts.length);
    }, [user, isAdmin, loading, router]);
    
    if (loading || !isAdmin) {
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
                    Admin Dashboard<span className="text-primary">.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Welcome, {user?.name}. Here are the current stats for your application.
                </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPosts}</div>
                        <p className="text-xs text-muted-foreground">Manage all posts</p>
                    </CardContent>
                </Card>
                 <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Currently logged in</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminPage;
