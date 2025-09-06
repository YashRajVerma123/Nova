'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addPostAction } from '@/app/actions/add-post';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  tags: z.string().min(2, 'Please provide at least one tag.'),
  readTime: z.coerce.number().min(1, 'Read time must be at least 1 minute.'),
  coverImage: z
    .any()
    .refine((files) => files?.length == 1, "Cover image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export default function CreatePostPage() {
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      tags: '',
      readTime: 5,
      coverImage: undefined,
    },
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin');
    }
  }, [loading, isAdmin, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  const fileRef = form.register("coverImage");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a post.", variant: 'destructive'});
        return;
    }
    
    const imageFile = values.coverImage[0];
    const reader = new FileReader();
    
    reader.onloadend = async () => {
        const imageDataUri = reader.result as string;
        try {
          await addPostAction({ ...values, authorId: user.id, coverImage: imageDataUri });
          toast({
            title: 'Post Created!',
            description: 'Your new blog post has been published.',
          });
          router.push('/posts');
        } catch (error) {
           toast({
            title: 'Error Creating Post',
            description: 'Something went wrong. Please try again later.',
            variant: 'destructive',
          });
        }
    };
    
    reader.readAsDataURL(imageFile);
  }
  
  if (loading || !isAdmin) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Dashboard
            </Link>
        </div>
        <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-4">
            Create a New Post<span className="text-primary">.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
                Share your thoughts and stories with the world.
            </p>
        </section>

        <div className="glass-card p-8">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                        <Input placeholder="The Future of AI" {...field} />
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
                        <Textarea placeholder="A brief summary of your post..." {...field} rows={2} />
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
                    <FormLabel>Full Content (HTML supported)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="<p>Start writing your masterpiece...</p>" {...field} rows={10} />
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
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., AI, Technology, Future" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="readTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Read Time (minutes)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="5" {...field} />
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
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <Input 
                            type="file" 
                            accept="image/*" 
                            {...fileRef}
                            onChange={(e) => {
                                field.onChange(e.target.files);
                                handleImageChange(e);
                            }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {imagePreview && (
                    <div className="mt-4">
                        <img src={imagePreview} alt="Cover preview" className="rounded-md max-h-48 w-auto" />
                    </div>
                 )}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                    </>
                ) : (
                    <>Publish Post <Send className="ml-2 h-4 w-4" /></>
                )}
                </Button>
            </form>
            </Form>
        </div>
    </div>
  );
}
