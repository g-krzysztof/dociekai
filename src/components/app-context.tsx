'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Tag as RemoteTag } from '@/types/tag';
import type { BlogArticle as BlogArticleType } from '@/lib/build-time-data';

// Generic async slice helper for future app-wide states
export type AsyncSlice<T> = {
  data: T;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

type TagLike = RemoteTag & { color?: string };

export type TagsState = {
  tags: TagLike[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

type BlogArticle = BlogArticleType;

export type BlogArticlesState = {
  articles: BlogArticle[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

export type SidebarHeightState = {
  expandedSetsHeight: number;
  setExpandedSetsHeight: (height: number) => void;
};

export type AppState = {
  // Tags slice (existing functionality)
  tags: TagsState;
  // Future slices can be added here (auth, user prefs, etc.)
  blogArticles: BlogArticlesState;
  // Sidebar height state
  sidebarHeight: SidebarHeightState;
};

const AppContext = createContext<AppState | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
  initialTags?: TagLike[];
  initialBlogArticles?: BlogArticle[];
}

export function AppProvider({ children, initialTags, initialBlogArticles }: AppProviderProps) {
  // --- Tags slice ---
  const [tags, setTags] = useState<TagLike[]>(initialTags || []);
  const [tagsLoading, setTagsLoading] = useState(!initialTags);
  const [tagsError, setTagsError] = useState<string | undefined>();

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      setTagsError(undefined);
      const res = await fetch('/api/tags', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TagLike[] = await res.json();
      setTags(data);
    } catch (e: unknown) {
      setTagsError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    // Tylko fetchuj jeśli nie mamy initial data
    if (!initialTags) {
      fetchTags();
    }
  }, [initialTags]);

  // --- Blog Articles slice ---
  const [articles, setArticles] = useState<BlogArticle[]>(initialBlogArticles || []);
  const [articlesLoading, setArticlesLoading] = useState(!initialBlogArticles);
  const [articlesError, setArticlesError] = useState<string | undefined>();

  const fetchBlogArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(undefined);
      // Fetch ALL articles (large limit to get everything for homepage/build-time context)
      const res = await fetch('/api/blog-articles?limit=1000', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Handle both paginated format { data: [...], pagination: {...} } and array format
      const articles = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setArticles(articles);
    } catch (e: unknown) {
      setArticlesError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setArticlesLoading(false);
    }
  };

  useEffect(() => {
      fetchBlogArticles();
  }, []);

  // --- Sidebar Height slice ---
  const [expandedSetsHeight, setExpandedSetsHeight] = useState<number>(0);

  const appValue = useMemo<AppState>(
    () => ({
      tags: {
        tags,
        loading: tagsLoading,
        error: tagsError,
        refresh: fetchTags,
      },
      blogArticles: {
        articles,
        loading: articlesLoading,
        error: articlesError,
        refresh: fetchBlogArticles,
      },
      sidebarHeight: {
        expandedSetsHeight,
        setExpandedSetsHeight,
      },
    }),
    [tags, tagsLoading, tagsError, articles, articlesLoading, articlesError, expandedSetsHeight]
  );

  return <AppContext.Provider value={appValue}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
