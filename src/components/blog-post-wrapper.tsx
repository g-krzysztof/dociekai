'use client';

import { StaticDataProvider } from '@/components/static-data-provider';
import type { StrapiTag } from '@/types/tag';
import type { BlogArticle } from '@/lib/build-time-data';

interface BlogPostWrapperProps {
  children: React.ReactNode;
  tags: StrapiTag[];
  blogArticles: BlogArticle[];
}

export function BlogPostWrapper({ children, tags, blogArticles }: BlogPostWrapperProps) {
  return (
    <StaticDataProvider tags={tags} blogArticles={blogArticles}>
      {children}
    </StaticDataProvider>
  );
}
