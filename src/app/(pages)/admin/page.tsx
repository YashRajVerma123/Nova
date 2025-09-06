'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, PlusCircle, BellPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addNotification } from "@/app/actions/add-notification";
import { posts } from "@/lib/data";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const AdminPage = () => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [isNotifyDialogOpen, setNotifyDialogOpen] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationDesc, setNotificationDesc] = useState("");
    const [notificationImage, setNotificationImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { toast } = useToast();
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
        setTotalPosts(posts.length);
    }, [user, isAdmin, loading, router]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({ title: "Image too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
                return;
            }
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                toast({ title: "Invalid image type", description: "Please select a JPG, JPEG, PNG, or WEBP file.", variant: "destructive" });
                return;
            }
            setNotificationImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setNotificationImage(null);
            setImagePreview(null);
        }
    };

    const resetNotificationForm = () => {
        setNotificationTitle("");
        setNotificationDesc("");
        setNotificationImage(null);
        setImagePreview(null);
        setNotifyDialogOpen(false);
    };

    const handleSendNotification = async () => {
        if (!notificationTitle || !notificationDesc) {
            toast({
                title: "Incomplete Form",
                description: "Please fill out both title and description.",
                variant: "destructive",
            });
            return;
        }

        let imageDataUri: string | undefined = undefined;
        if (notificationImage) {
            const reader = new FileReader();
            reader.readAsDataURL(notificationImage);
            reader.onloadend = async () => {
                imageDataUri = reader.result as string;
                await sendNotification(imageDataUri);
            };
        } else {
            await sendNotification();
        }
    };

    const sendNotification = async (image?: string) => {
        try {
            await addNotification({ title: notificationTitle, description: notificationDesc, image });
            toast({
                title: "Notification Sent!",
                description: "Your notification has been added.",
            });
            resetNotificationForm();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send notification.",
                variant: "destructive",
            });
        }
    };


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
                    Welcome, {user?.name}. Manage your application from here.
                </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <Link href="/admin/create-post">
                     <Card className="glass-card h-full transition-all hover:border-primary/50 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Create Post</CardTitle>
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">New</div>
                            <p className="text-xs text-muted-foreground">Add a new blog post</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="glass-card h-full transition-all hover:border-primary/50 hover:-translate-y-1 cursor-pointer" onClick={() => setNotifyDialogOpen(true)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Send Notification</CardTitle>
                        <BellPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Notify</div>
                        <p className="text-xs text-muted-foreground">Broadcast to all users</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isNotifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send a New Notification</DialogTitle>
                        <DialogDescription>
                            This will be sent to all users and appear in their notification panel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} placeholder="e.g. New Feature!" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={notificationDesc} onChange={(e) => setNotificationDesc(e.target.value)} placeholder="Describe the notification..."/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="image">Image (Optional)</Label>
                            <Input id="image" type="file" onChange={handleImageChange} accept="image/*"/>
                        </div>
                        {imagePreview && (
                            <div className="mt-2">
                                <img src={imagePreview} alt="Notification preview" className="rounded-md max-h-40 w-auto" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSendNotification}>Send Notification</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPage;
