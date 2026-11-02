'use client';

import React from 'react';
import { AppProvider } from '@/components/app-context';
import type { StrapiTag } from '@/types/tag';
import type { BlogArticle } from '@/lib/build-time-data';

interface StaticDataProviderProps {
  children: React.ReactNode;
  tags: StrapiTag[];
  blogArticles: BlogArticle[];
}

export function StaticDataProvider({ children, tags, blogArticles }: StaticDataProviderProps) {
  return (
    <AppProvider initialTags={tags} initialBlogArticles={blogArticles}>
      {children}
    </AppProvider>
  );
}
