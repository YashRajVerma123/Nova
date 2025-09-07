
'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Edit, PlusCircle, Trash, Users, BellRing, Image as ImageIcon } from "lucide-react";
import { Post, getPosts, Notification, getNotifications } from "@/lib/data";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/app/actions/post-actions";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addNotificationAction, deleteNotificationAction } from "@/app/actions/notification-actions";
import { Separator } from "@/components/ui/separator";


const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().url().optional().or(z.literal('')),
});


const AdminPage = () => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [isPostDeleteDialogOpen, setPostDeleteDialogOpen] = useState(false);
    const [isNotifDeleteDialogOpen, setNotifDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

    const notificationForm = useForm<z.infer<typeof notificationSchema>>({
      resolver: zodResolver(notificationSchema),
      defaultValues: {
        title: '',
        description: '',
        image: '',
      },
    });

    const fetchAllData = async () => {
        const posts = await getPosts();
        setAllPosts(posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        const notifications = await getNotifications();
        setAllNotifications(notifications);
    }

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
        fetchAllData();
    }, [user, isAdmin, loading, router]);
    
    if (loading || !isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleDeletePostClick = (post: Post) => {
        setPostToDelete(post);
        setPostDeleteDialogOpen(true);
    };
    
    const handleDeleteNotifClick = (notification: Notification) => {
        setNotificationToDelete(notification);
        setNotifDeleteDialogOpen(true);
    };

    const handleDeletePostConfirm = async () => {
        if (!postToDelete) return;
        try {
            await deletePost(postToDelete.id);
            setAllPosts(allPosts.filter(p => p.id !== postToDelete!.id));
            toast({ title: "Post Deleted", description: `"${postToDelete.title}" has been deleted.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        }
        setPostDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    const handleDeleteNotifConfirm = async () => {
        if (!notificationToDelete) return;
        try {
            await deleteNotificationAction(notificationToDelete.id);
            setAllNotifications(allNotifications.filter(n => n.id !== notificationToDelete!.id));
            toast({ title: "Notification Deleted", description: `"${notificationToDelete.title}" has been deleted.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete notification.", variant: "destructive" });
        }
        setNotifDeleteDialogOpen(false);
        setNotificationToDelete(null);
    };

    const onNotificationSubmit = async (values: z.infer<typeof notificationSchema>) => {
      try {
        await addNotificationAction(values);
        toast({ title: "Notification Sent!", description: "Your notification has been published to all users." });
        notificationForm.reset();
        await fetchAllData(); // Refresh the list
      } catch (error) {
        toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
      }
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allPosts.length}</div>
                        <p className="text-xs text-muted-foreground">Manage all posts below</p>
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
                 <Link href="/admin/create-post" className="group">
                    <Card className="glass-card h-full flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors duration-300">
                        <CardHeader>
                            <PlusCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-lg">Create New Post</CardTitle>
                             <CardDescription className="text-xs">Write and publish a new article.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <div className="xl:col-span-2">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Manage Posts</CardTitle>
                            <CardDescription>Here you can edit or delete existing posts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPosts.map(post => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={post.featured ? "default" : "secondary"}>
                                                    {post.featured ? "Featured" : "Standard"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(post.publishedAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={`/admin/edit-post/${post.slug}`}><Edit className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeletePostClick(post)}>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="glass-card">
                        <CardHeader>
                           <div className="flex items-center gap-2">
                            <BellRing className="h-5 w-5 text-primary" />
                            <CardTitle>Send Notification</CardTitle>
                           </div>
                            <CardDescription>Publish a new announcement to all users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Form {...notificationForm}>
                            <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                              <FormField
                                control={notificationForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="New Feature Alert!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={notificationForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Check out our new comment system!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={notificationForm.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Image URL (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://example.com/image.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" className="w-full" disabled={notificationForm.formState.isSubmitting}>
                                {notificationForm.formState.isSubmitting ? 'Sending...' : 'Send Notification'}
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Manage Notifications</CardTitle>
                            <CardDescription>Edit or delete sent notifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {allNotifications.length > 0 ? allNotifications.map((notif, index) => (
                                    <div key={notif.id}>
                                      <div className="flex justify-between items-start gap-4">
                                          <div className="space-y-1 flex-1">
                                              <p className="font-medium text-sm">{notif.title}</p>
                                              <p className="text-xs text-muted-foreground">{notif.description}</p>
                                               {notif.image && <ImageIcon className="h-4 w-4 inline-block text-muted-foreground" />}
                                          </div>
                                          <div className="flex items-center">
                                              <Button asChild variant="ghost" size="icon">
                                                  <Link href={`/admin/edit-notification/${notif.id}`}><Edit className="h-4 w-4" /></Link>
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => handleDeleteNotifClick(notif)}>
                                                  <Trash className="h-4 w-4 text-red-500" />
                                              </Button>
                                          </div>
                                      </div>
                                      {index < allNotifications.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                )) : (
                                  <p className="text-sm text-muted-foreground text-center">No notifications sent yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>


            <AlertDialog open={isPostDeleteDialogOpen} onOpenChange={setPostDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post
                            <span className="font-bold"> &quot;{postToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePostConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isNotifDeleteDialogOpen} onOpenChange={setNotifDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the notification
                            <span className="font-bold"> &quot;{notificationToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteNotifConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminPage;
