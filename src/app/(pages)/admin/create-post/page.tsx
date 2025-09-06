'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/app/actions/add-post';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
  tags: z.string().min(1, 'Please provide at least one tag.'),
  featured: z.boolean().default(false),
});

const CreatePostPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      coverImage: 'https://picsum.photos/1200/800',
      tags: '',
      featured: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a post.", variant: "destructive" });
        return;
    }
    
    try {
      const newPost = await addPost(values, user.id);
      toast({
        title: 'Post Created!',
        description: 'Your new article has been published.',
      });
      router.push(`/posts/${newPost.slug}`);
    } catch (error) {
       toast({
        title: 'Error Creating Post',
        description: (error as Error).message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Create a New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Title</FormLabel>
                      <FormControl>
                        <Input placeholder="The Future of AI..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief summary of your article..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your full article here. You can use HTML for formatting." {...field} rows={15} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="AI, Technology, Future" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">Enter tags separated by commas.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Feature this post?</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Featured posts appear prominently on the homepage.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Publishing...' : 'Publish Post'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePostPage;
