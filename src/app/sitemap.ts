
import { getPosts } from '@/lib/data';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://theglare.netlify.app'; // Replace with your actual domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all posts to generate dynamic routes
  const posts = await getPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, publishedAt }) => ({
    url: `${BASE_URL}/posts/${slug}`,
    lastModified: new Date(publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
     {
      url: `${BASE_URL}/bulletin`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
     {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...postEntries];
}
