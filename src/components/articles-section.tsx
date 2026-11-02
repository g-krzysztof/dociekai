'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog-card';
import { BlogPost } from '@/lib/blog';
import Link from 'next/link';

interface ArticlesSectionProps {
  recentPosts: BlogPost[];
}

export default function ArticlesSection({ recentPosts }: ArticlesSectionProps) {
  return (
    <section className="py-16">
      <div className="text-start mb-12">
        <Typography variant="h2" className="mb-4">
          Najnowsze artykuły
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {recentPosts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>

      <div className="text-center pt-6">
        <Link href="/blog">
          <Button variant="default" size="lg">
            Zobacz wszystkie artykuły
          </Button>
        </Link>
      </div>
    </section>
  );
}
