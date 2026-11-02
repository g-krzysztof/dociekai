import { AppProvider } from '@/components/app-context';
import type { StrapiTag } from '@/types/tag';
import type { BlogArticle } from '@/lib/build-time-data';

interface AppProviderWrapperProps {
  children: React.ReactNode;
  tags?: StrapiTag[];
  blogArticles?: BlogArticle[];
}

export function AppProviderWrapper({ children, tags, blogArticles }: AppProviderWrapperProps) {
  // Jeśli mamy dane z props (static generation), używamy ich
  // W przeciwnym razie fallback do oryginalnego AppProvider który fetchuje dane
  if (tags && blogArticles) {
    // Przekazuj dane przez context value bez fetchowania
    return (
      <AppProvider initialTags={tags} initialBlogArticles={blogArticles}>
        {children}
      </AppProvider>
    );
  }

  return <AppProvider>{children}</AppProvider>;
}
