
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/lib/data';
import { Eye, Users, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useMemo } from 'react';
import { subDays, format } from 'date-fns';

interface AnalyticsDashboardProps {
  posts: Post[];
}

const generateMockData = (days: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      name: format(date, 'MMM d'),
      views: Math.floor(Math.random() * 2000) + 500,
    });
  }
  return data;
};

const mockPostAnalytics = (posts: Post[]) => {
  return posts.map(post => ({
    ...post,
    views: Math.floor(Math.random() * 10000) + 1000,
    impressions: Math.floor(Math.random() * 50000) + 10000,
  })).sort((a,b) => b.views - a.views);
}

const AnalyticsDashboard = ({ posts }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('7');
  
  const chartData = useMemo(() => generateMockData(Number(timeRange)), [timeRange]);
  const postAnalytics = useMemo(() => mockPostAnalytics(posts), [posts]);
  
  const totalViews = postAnalytics.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = postAnalytics.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalImpressions = postAnalytics.reduce((sum, post) => sum + post.impressions, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (mock data)</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month (mock data)</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalLikes / totalViews) * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Based on likes vs views (mock data)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Audience Overview</CardTitle>
                <CardDescription>A summary of your website's traffic.</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)"/>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background) / 0.8)",
                        borderColor: "hsl(var(--border))",
                        backdropFilter: 'blur(4px)',
                    }}
                 />
                <Legend iconType="circle"/>
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your most viewed articles.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Engagement</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {postAnalytics.slice(0, 5).map(post => (
                       <TableRow key={post.id}>
                           <TableCell>
                               <Link href={`/posts/${post.slug}`} className="font-medium hover:underline" target="_blank">
                                {post.title}
                               </Link>
                           </TableCell>
                           <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
                           <TableCell className="text-right">{post.impressions.toLocaleString()}</TableCell>
                           <TableCell className="text-right text-primary font-semibold">{(((post.likes || 0) / post.views) * 100).toFixed(2)}%</TableCell>
                       </TableRow>
                   ))}
                </TableBody>
             </Table>
          </CardContent>
      </Card>

    </div>
  );
};

export default AnalyticsDashboard;
