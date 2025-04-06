'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ForumPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('forum')
        .insert([
          {
            user_id: user.id,
            content: newPost.trim()
          }
        ]);

      if (error) throw error;
      
      setNewPost('');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 to-transparent opacity-20" />
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl relative h-screen flex flex-col">
        {/* Back button */}
        <Link href="/protected" className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </Button>
        </Link>

        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-3 sm:mb-4">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Community Forum
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your healthy recipes, fitness tips, and diet experiences with our community. 
            All posts are anonymous to encourage open discussion.
          </p>
        </div>

        {/* Posts container with scroll */}
        <div className="flex-1 overflow-y-auto mb-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <span className="text-sm sm:text-base text-primary font-semibold">A</span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-medium text-foreground">Anonymous</span>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                      {new Date(post.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-foreground/90 whitespace-pre-wrap pl-10 sm:pl-14">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed input form at bottom */}
        <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts with the community..."
              className="flex-1 text-sm sm:text-lg py-4 sm:py-6 bg-background/50 border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-4 sm:py-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Posting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Post</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 