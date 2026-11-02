import { BlogPageClient } from './blog-client';
import { getBuildTimeBlogArticles } from '@/lib/build-time-data';
import { StaticDataProvider } from '@/components/static-data-provider';
import { Suspense } from 'react';
import { HeroTitle } from '@/components/hero-title';
import { Typography } from '@/components/ui/typography';

import { Metadata } from 'next';
import { getBuildTimeTags } from '@/lib/build-time-data';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string }>;
}): Promise<Metadata> {
  const tags = await getBuildTimeTags();
  let tagParam = undefined;
  if (searchParams) {
    const params = await searchParams;
    tagParam = params?.tag;
  }
  let selectedTag = '';
  if (tagParam) {
    const decodedTag = decodeURIComponent(tagParam);
    const tagBySlug = tags.find((t) => t.slug === decodedTag);
    if (tagBySlug) {
      selectedTag = tagBySlug.name;
    } else {
      const tagByName = tags.find((t) => t.name === decodedTag);
      if (tagByName) {
        selectedTag = tagByName.name;
      } else {
        selectedTag = decodedTag;
      }
    }
  }
  if (selectedTag) {
    return {
      title: `Blog: ${selectedTag} | Dociekai`,
      description: `Najnowsze artykuły o tematyce "${selectedTag}" – kompetencje przyszłości, uczenie się i rozwój dzieci oraz nastolatków.`,
    };
  }
  return {
    title: 'Blog | Dociekai',
    description:
      'Najnowsze artykuły o kompetencjach przyszłości, uczeniu się i rozwoju dzieci oraz nastolatków.',
  };
}

export const dynamic = 'force-static';

function TagCloudSkeleton() {
  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse"
            style={{ width: `${60 + Math.random() * 80}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function BlogCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export default async function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8 mb-16">
          <div className="flex flex-col justify-center">
            <HeroTitle className="mb-4">Blog Dociekai</HeroTitle>
            <Typography variant="lead" className="max-w-xl">
              Najnowsze artykuły o kompetencjach przyszłości, uczeniu się i rozwoju dzieci oraz
              nastolatków.
            </Typography>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <Suspense fallback={<TagCloudSkeleton />}>
              <BlogTagCloudLoader />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<BlogCardsSkeleton />}>
          <BlogDataLoader />
        </Suspense>
      </main>
    </div>
  );
}

async function BlogTagCloudLoader() {
  const [tags, blogArticles] = await Promise.all([getBuildTimeTags(), getBuildTimeBlogArticles()]);

  return (
    <StaticDataProvider tags={tags} blogArticles={blogArticles}>
      <BlogPageClient mode="tagcloud" />
    </StaticDataProvider>
  );
}

async function BlogDataLoader() {
  const [tags, blogArticles] = await Promise.all([getBuildTimeTags(), getBuildTimeBlogArticles()]);

  return (
    <StaticDataProvider tags={tags} blogArticles={blogArticles}>
      <BlogPageClient mode="articles" />
    </StaticDataProvider>
  );
}
