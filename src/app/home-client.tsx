'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog-card';
import { BlogPost } from '@/lib/blog';
import { normalizeArticle } from '@/lib/build-time-data';
import { useApp } from '@/components/app-context';
import { HeroSection } from '@/components/hero-section';
import Link from 'next/link';
import { useMemo, useCallback } from 'react';
// import { useAuth } from '@/components/auth-context';

export function HomeClient() {
  // const { isAuthenticated } = useAuth();
  const { blogArticles, tags } = useApp();

  const normalize = useCallback((items: unknown[]): BlogPost[] => {
    return items.map((item) => normalizeArticle(item as Record<string, unknown>));
  }, []);

  const allPosts = useMemo(
    () => normalize(blogArticles.articles ?? []),
    [blogArticles.articles, normalize]
  );
  
  const featuredRecentPosts = useMemo(
    () =>
      allPosts
        .slice()
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 4),
    [allPosts]
  );

  const tagColors = useMemo(
    () =>
      new Map(
        tags.tags.map((tag) => [
          tag.name,
          tag.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        ])
      ),
    [tags.tags]
  );

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4">
        <HeroSection />

        {/* Recent Articles Preview */}
        <section className="py-16">
          <div className="text-start mb-12">
            <Typography variant="h2" className="mb-4">
              Najnowsze artykuły
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredRecentPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} tagColors={tagColors} />
            ))}
          </div>

          <div className="text-center lg:text-right pt-6">
            <Link href="/blog">
              <Button variant="default" size="lg">
                Zobacz wszystkie artykuły
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
