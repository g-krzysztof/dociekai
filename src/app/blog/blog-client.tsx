'use client';

import { TagCloud } from '@/components/tag-cloud';
import { BlogCard } from '@/components/blog-card';
import { BlogPost } from '@/lib/blog';
import { normalizeArticle } from '@/lib/build-time-data';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { BlogPagination } from '@/components/blog-pagination';

interface BlogPageClientProps {
  mode: 'tagcloud' | 'articles';
}

interface PaginatedArticlesResponse {
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TagWithCount {
  id: number;
  name: string;
  slug: string;
  color: string;
  count: number;
}

interface TagsApiResponse {
  tags: TagWithCount[];
}

const ARTICLES_PER_PAGE = 12;

export function BlogPageClient({ mode }: BlogPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tagsWithCounts, setTagsWithCounts] = useState<TagWithCount[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Pobierz tagi z API
  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const response = await fetch('/api/blog-tags', {
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('Error fetching tags - Status:', response.status);
        setTagsWithCounts([]);
        setTagsLoading(false);
        return;
      }

      const data: TagsApiResponse = await response.json();
      setTagsWithCounts(data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTagsWithCounts([]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  // Pobierz tagi przy montowaniu komponentu
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const tagColors = useMemo(
    () =>
      new Map(
        tagsWithCounts.map((tag) => [
          tag.name,
          tag.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        ])
      ),
    [tagsWithCounts]
  );

  // Pobierz artykuły z API
  const fetchArticles = useCallback(
    async (page: number, tag: string = '') => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(ARTICLES_PER_PAGE));
        if (tag) {
          params.set('tag', tag);
        }

        const response = await fetch(`/api/blog-articles?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          setArticles([]);
          setTotalPages(0);
          setIsLoading(false);
          return;
        }

        const data: PaginatedArticlesResponse = await response.json();
        
        const normalizedArticles = data.data.map((item) =>
          normalizeArticle(item as Record<string, unknown>)
        );

        setArticles(normalizedArticles);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Śledzenie tagu z URL
  const tagFromUrl = useMemo(() => {
    const tagParam = searchParams.get('tag');
    return tagParam ? decodeURIComponent(tagParam) : '';
  }, [searchParams]);

  // Śledzenie page z URL
  const pageFromUrl = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  }, [searchParams]);

  // Obsługuj zmianę tagu - resetuj page do 1 tylko kiedy zmienia się TAG
  useEffect(() => {
    if (tagFromUrl !== selectedTag) {
      setSelectedTag(tagFromUrl);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reaguje tylko na zmianę tagu z URL, nie na selectedTag
  }, [tagFromUrl]);

  // Obsługuj zmianę page z URL - ustaw bez resetowania
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  // Pobierz artykuły gdy zmieni się strona lub tag
  useEffect(() => {
    fetchArticles(currentPage, selectedTag);
  }, [currentPage, selectedTag, fetchArticles]);

  // Obsługuj zmianę tagu
  const handleTagClick = (tagName: string) => {
    const newSelectedTag = tagName === '' ? '' : (selectedTag === tagName ? '' : tagName);

    const params = new URLSearchParams(searchParams.toString());
    if (newSelectedTag) {
      params.set('tag', newSelectedTag);
    } else {
      params.delete('tag');
    }
    params.delete('page'); // Reset strony przy zmianie tagu
    
    router.push(`?${params.toString()}`);
  };

  // Obsługuj zmianę strony
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    
    router.push(`?${params.toString()}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (mode === 'tagcloud') {
    return (
      <div className="w-full max-w-4xl">
        <TagCloud
          onTagClick={handleTagClick}
          selectedTag={selectedTag}
          tags={tagsWithCounts}
          loading={tagsLoading}
        />
      </div>
    );
  }

  return (
    <div>
      {selectedTag && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <Typography variant="p" className="text-blue-800 dark:text-blue-200">
            Pokazuję artykuły z tagiem: <span className="font-semibold">{selectedTag}</span>
            {articles.length === 0 && !isLoading && ' - nie znaleziono artykułów.'}
          </Typography>
        </div>
      )}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  index={index}
                  selectedTag={selectedTag}
                  tagColors={tagColors}
                />
              ))}
            </div>
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <Typography variant="large" className="text-muted-foreground">
              {selectedTag
                ? `Nie znaleziono artykułów z tagiem "${selectedTag}".`
                : 'Nie znaleziono żadnych artykułów.'}
            </Typography>
          </div>
        )}
      </section>
    </div>
  );
}
