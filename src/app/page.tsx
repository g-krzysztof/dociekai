import { HomeClient } from './home-client';
import { getBuildTimeTags, getBuildTimeBlogArticles } from '@/lib/build-time-data';
import { StaticDataProvider } from '@/components/static-data-provider';

// Static generation - dane pobierane podczas build time
export const dynamic = 'force-static';

export default async function Home() {
  // Pobierz dane podczas build time
  const [tags, blogArticles] = await Promise.all([getBuildTimeTags(), getBuildTimeBlogArticles()]);

  return (
    <>
      <StaticDataProvider tags={tags} blogArticles={blogArticles}>
        <HomeClient />
      </StaticDataProvider>
    </>
  );
}
