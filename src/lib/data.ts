
export type Author = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type Comment = {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  likes: number;
  replies: Comment[];
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  author: Author;
  publishedAt: string;
  tags: string[];
  readTime: number; 
  featured?: boolean;
  comments?: Comment[];
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  image?: string;
};

// We are using an in-memory array to store posts and notifications.
// In a real-world application, you would use a database like Firestore.

const yashRaj: Author = { id: 'yash-raj', name: 'Yash Raj', avatar: 'https://i.pravatar.cc/150?u=yash-raj', email: 'yashrajverma916@gmail.com'};
const janeDoe: Author = { id: 'jane-doe', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe', email: 'jane.doe@example.com'};
const johnSmith: Author = { id: 'john-smith', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith', email: 'john.smith@example.com'};

export let posts: Post[] = [
  {
    slug: 'the-future-of-ai',
    title: 'The Future of Artificial Intelligence: Predictions and Possibilities',
    description: 'A deep dive into the evolving landscape of AI and what we can expect in the coming years.',
    content: `
      <p>Artificial Intelligence is no longer a concept confined to science fiction. It's here, and it's reshaping our world in profound ways. From healthcare to finance, AI is driving innovation and efficiency. This post explores the trajectory of AI, examining its potential to solve some of humanity's greatest challenges.</p>
      <img src="https://picsum.photos/800/400?random=1" data-ai-hint="AI technology" alt="AI" class="rounded-lg my-6" />
      <h3 class="text-2xl font-headline font-bold mt-8 mb-4">The Next Wave of Innovation</h3>
      <p>Generative AI models are becoming increasingly sophisticated, capable of creating text, images, and even code that is indistinguishable from human-created content. This opens up new frontiers for creativity and automation. However, it also raises important ethical questions that society must address.</p>
    `,
    coverImage: 'https://picsum.photos/1200/800?random=1',
    author: janeDoe,
    publishedAt: '2024-07-28T10:00:00Z',
    tags: ['AI', 'Technology', 'Future'],
    readTime: 10,
    featured: true,
    comments: [
      { id: '1', content: 'Great overview of the future of AI!', author: yashRaj, createdAt: '2024-07-28T12:00:00Z', likes: 15, replies: [] },
    ]
  },
  {
    slug: 'sustainable-living-guide',
    title: 'A Practical Guide to Sustainable Living',
    description: 'Small changes can make a big impact. Discover practical tips for a more sustainable lifestyle.',
    content: `
      <p>Sustainability is about meeting our own needs without compromising the ability of future generations to meet theirs. This guide provides actionable steps you can take today to reduce your environmental footprint.</p>
      <h3 class="text-2xl font-headline font-bold mt-8 mb-4">Reduce, Reuse, Recycle</h3>
      <p>The three R's are a cornerstone of sustainable living. We'll explore how to effectively implement these principles in your daily routine, from composting food scraps to choosing reusable products over single-use items.</p>
      <img src="https://picsum.photos/800/400?random=2" data-ai-hint="nature environment" alt="Sustainable Living" class="rounded-lg my-6" />
    `,
    coverImage: 'https://picsum.photos/1200/800?random=2',
    author: johnSmith,
    publishedAt: '2024-07-27T14:30:00Z',
    tags: ['Sustainability', 'Lifestyle', 'Environment'],
    readTime: 8,
    featured: true,
    comments: [],
  },
  {
    slug: 'mastering-remote-work',
    title: 'Mastering Remote Work: Tips for Productivity and Well-being',
    description: 'The shift to remote work is here to stay. Learn how to thrive in a work-from-home environment.',
    content: `
      <p>Working remotely offers flexibility but also presents unique challenges. This article provides evidence-based strategies for staying productive, connected, and mentally healthy while working from home.</p>
      <h3 class="text-2xl font-headline font-bold mt-8 mb-4">Creating Your Ideal Workspace</h3>
      <p>Your environment plays a significant role in your productivity. We discuss how to set up an ergonomic and distraction-free workspace that fosters focus and creativity.</p>
      <img src="https://picsum.photos/800/400?random=3" data-ai-hint="home office" alt="Remote Work" class="rounded-lg my-6" />
    `,
    coverImage: 'https://picsum.photos/1200/800?random=3',
    author: yashRaj,
    publishedAt: '2024-07-26T09:00:00Z',
    tags: ['Remote Work', 'Productivity', 'Wellness'],
    readTime: 5,
    featured: false,
    comments: [],
  },
  {
    slug: 'the-art-of-minimalism',
    title: 'The Art of Minimalism: Less is More',
    description: 'Explore the philosophy of minimalism and how it can lead to a more meaningful life.',
    content: `
      <p>Minimalism isn't just about decluttering your home; it's a mindset. It's about intentionally living with only the things you really need—those items that support your purpose. </p>
       <img src="https://picsum.photos/800/400?random=4" data-ai-hint="minimalist interior" alt="Minimalism" class="rounded-lg my-6" />
      <p>By clearing the clutter from our lives, we can make room for what's most important: happiness, fulfillment, and freedom.</p>
    `,
    coverImage: 'https://picsum.photos/1200/800?random=4',
    author: janeDoe,
    publishedAt: '2024-07-25T18:00:00Z',
    tags: ['Minimalism', 'Lifestyle', 'Philosophy'],
    readTime: 7,
    featured: true,
    comments: [],
  },
  {
    slug: 'exploring-the-deep-sea',
    title: 'Into the Abyss: Exploring the Mysteries of the Deep Sea',
    description: 'The deep sea is the last true frontier on Earth. Discover the strange and wonderful creatures that inhabit it.',
    content: `
      <p>More than 80 percent of our ocean is unmapped, unobserved, and unexplored. The deep sea is a world of crushing pressure, freezing temperatures, and eternal darkness. Yet, life finds a way.</p>
      <img src="https://picsum.photos/800/400?random=5" data-ai-hint="underwater ocean" alt="Deep Sea" class="rounded-lg my-6" />
      <p>From bioluminescent jellyfish to giant squid, we're just beginning to understand the incredible biodiversity of the deep ocean. Join us on a journey to this mysterious realm.</p>
    `,
    coverImage: 'https://picsum.photos/1200/800?random=5',
    author: johnSmith,
    publishedAt: '2024-07-24T12:00:00Z'
    ,
    tags: ['Ocean', 'Science', 'Exploration'],
    readTime: 9,
    featured: false,
    comments: [],
  },
];

export let notifications: Notification[] = [
    { id: 'n1', title: 'New Feature: Post Summaries', description: 'We\'ve added AI-powered summaries to our posts!', createdAt: '2024-07-28T12:00:00Z', read: false },
    { id: 'n2', title: 'Welcome to the new Nova!', description: 'Our new website is live. We hope you enjoy the new design and features.', createdAt: '2024-07-27T09:00:00Z', read: true },
];

// In-memory data modification functions.
// In a real app, these would be API calls to a database.
export function addPost(post: Post) {
  posts.unshift(post);
}

export function addNotification(notification: Notification) {
  notifications.unshift(notification);
}
