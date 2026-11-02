import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ContentTable } from '@/components/content-table';
import type { TableColumn, TableData as TableRowData } from '@/components/content-table';
import PostTags from '@/components/post-tags';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar } from 'lucide-react';
import {
  getBuildTimeBlogArticles,
  getBuildTimeTags,
  normalizeArticle as normalizeArticleFromLib,
} from '@/lib/build-time-data';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';
import { BlogPostWrapper } from '@/components/blog-post-wrapper';
import { FloatingCta } from '@/components/floating-cta';
import { FacebookFollowBox } from '@/components/social/facebook-follow';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Static generation
export const dynamic = 'force-static';

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const articles = await getBuildTimeBlogArticles();
    return articles.map((article) => {
      const normalized = normalizeArticleFromLib(article);
      return {
        slug: normalized.slug,
      };
    });
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Ten segment jest renderowany dynamicznie na podstawie danych z API

// Generowanie metadanych
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchArticleBySlug(slug);
  if (!post) {
    return {
      title: `Artykuł nie znaleziony: ${slug} | Dociekai Blog`,
      description: `Artykuł o adresie "${slug}" nie istnieje. Sprawdź inne artykuły na blogu Dociekai poświęconym kompetencjom przyszłości.`,
    };
  }
  // metaTitle ze Strapi jest gotowym, dopracowanym tytułem — bez doklejania sufiksu.
  const title = post.metaTitle ?? `${post.title} | Dociekai Blog`;
  const description = post.metaDescription ?? post.excerpt;
  const url = `https://dociekai.pl/blog/${post.slug}`;
  // Root layout nie ma metadataBase, więc og:image podajemy tylko jako adres bezwzględny.
  const ogImage = /^https?:\/\//.test(post.image) ? post.image : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Dociekai.pl',
      locale: 'pl_PL',
      type: 'article',
      publishedTime: post.publishedAt,
      ...(ogImage && { images: [{ url: ogImage, alt: post.imageAlt || post.title }] }),
    },
  };
}

async function fetchArticleBySlug(slug: string) {
  try {
    const articles = await getBuildTimeBlogArticles();
    const found = articles.find((article) => {
      const normalized = normalizeArticleFromLib(article);
      return normalized.slug === slug;
    });
    return found ? normalizeArticleFromLib(found) : null;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Pobierz dane statyczne
  const [tags, blogArticles, post] = await Promise.all([
    getBuildTimeTags(),
    getBuildTimeBlogArticles(),
    fetchArticleBySlug(slug),
  ]);

  if (!post) {
    notFound();
  }

  // Funkcja do renderowania markdown jako HTML z obsługą komponentów React
  const renderMarkdown = (content: string) => {
    // 1) Unescape literal \n i normalizacja końców linii
    let processedContent = content.replace(/\\n/g, '\n').replace(/\r\n?|\r/g, '\n');

    // 2) Komponenty React (tabele) na markery
    processedContent = processedContent.replace(/<Table(\d+) \/>/g, '<!-- TABLE$1 -->');

  // 2a) Markdown images ![alt](url) na marker
  processedContent = processedContent.replace(/!\[(.*?)\]\((.*?)\)/g, '<!--IMAGE|$1|$2-->');

  // 2b) Markdown horizontal rule --- na <hr />
  processedContent = processedContent.replace(/^---$/gm, '<hr class="my-8 border-border" />');

  // 2c) Markdown links [text](url) na <a> z SEO
  processedContent = processedContent.replace(/\[(.*?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');

    // 3) Markdown: nagłówki, inline, code blocks
    processedContent = processedContent
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-foreground">$1</h1>')
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-semibold mb-4 mt-8 text-foreground">$1</h2>'
      )
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-semibold mb-3 mt-6 text-foreground">$1</h3>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
      )
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>'
      )
      // 3a) Blockquote markdown '>'
      .replace(
        /^>\s?(.*)$/gim,
        '<blockquote class="border-l-4 border-border pl-4 italic text-muted-foreground my-6">$1</blockquote>'
      )
      // 3b) Lines fully wrapped in quotes => treat as quote (supports straight and Polish/curly quotes)
      // .replace(
      //   /^["“„]([\s\S]*?)["””]$/gm,
      //   '<blockquote class="border-l-4 border-border pl-4 italic text-muted-foreground my-6">$1</blockquote>'
      // )
      // 4) Wypunktowania: linie zaczynające się od '-' lub '•'
      .replace(/^(?:-|\u2022)\s+(.*)$/gim, '<li class="mb-2 text-muted-foreground">$1</li>')
      // 5) Zgrupuj kolejne <li> w pojedyncze listy
      // m.trimEnd() usuwa \n\n które \s* skonsumował za ostatnim </li>,
      // dzięki czemu </ul>\n ląduje na własnej linii przed tekstem który po nim nastąpi
      .replace(
        /(?:^(?:<li[\s\S]*?<\/li>)\s*)+/gm,
        (m) => `<ul class="list-disc list-inside mb-4 space-y-2">${m.trimEnd()}\n</ul>\n`
      )
      // 5.5) Pusta linia po bloku zamkniętym tagiem (</ul>, </h1>, </h2> itp.)
      // nie powinna tworzyć </p><p>, bo nie ma otwartego <p> do zamknięcia.
      // Redukujemy >\n\n do >\n — tekst po bloku trafi na własną linię.
      .replace(/>\n\n/g, '>\n')
      // 6) Paragrafy na końcu, by nie psuć wstawionych tagów
      .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
      .replace(/^(?!<)(.+)$/gm, '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>');

    return processedContent;
  };

  // Funkcja do dzielenia treści na części z komponentami React
  const renderContentWithComponents = (content: string) => {
    const processedContent = renderMarkdown(content);
    // Split z zachowaniem markerów (TABLE, IMAGE)
    const regex = /(<!-- TABLE\d+ -->|<!--IMAGE\|.*?\|.*?-->)/g;
    const parts = processedContent.split(regex).filter((p) => p !== '');
    type TableBlock = { columns: TableColumn[]; data: TableRowData[] };
    const isTableBlock = (v: unknown): v is TableBlock => {
      if (!v || typeof v !== 'object') return false;
      const o = v as Record<string, unknown>;
      return Array.isArray(o.columns) && Array.isArray(o.data);
    };

    return (
      <>
        {parts.map((part, index) => {
          // TABLE marker
          const tableMatch = part.match(/^<!-- TABLE(\d+) -->$/);
          if (tableMatch) {
            const tableNumber = parseInt(tableMatch[1]);
            const tableKey = `table${tableNumber}`;
            const tableData = post.tables?.[tableKey] as unknown;
            if (isTableBlock(tableData)) {
              return <ContentTable key={index} columns={tableData.columns} data={tableData.data} />;
            }
            return null;
          }
          // IMAGE marker
          const imageMatch = part.match(/^<!--IMAGE\|(.*?)\|(.*?)-->$/);
          if (imageMatch) {
            const alt = imageMatch[1];
            const src = imageMatch[2];
            return (
              <div key={index} className="my-6 flex justify-center">
                <Image
                  src={src}
                  alt={alt}
                  width={800}
                  height={500}
                  className="rounded-lg object-contain max-h-[500px]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
              </div>
            );
          }
          // Normalny HTML
          if (part.trim() !== '') {
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{
                  __html: sanitizeBlogHtml(part),
                }}
              />
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <BlogPostWrapper tags={tags} blogArticles={blogArticles}>
      <div className="min-h-screen bg-background">
        <FloatingCta
          title="Darmowy Kurs Kodowania dla dzieci!"
          // description="Podobał Ci się artykuł? Naucz się programowania od podstaw!"
          image="/images/hero/coding-hero-background-with-dots.webp"
          imageAlt="Dociekai.pl logo"
          badgeText="Bez logowania"
          delay={3000}
          storageKey="blogPostCtaDismissed"
          icon="/images/icons/robot.jpg"
        />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Przycisk powrotu */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót do bloga
              </Button>
            </Link>
          </div>

          {/* Header artykułu */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl leading-[52px] font-bold mb-4 bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>

            {/* Główne zdjęcie artykułu */}
            {post.image && (
              <div className="relative w-full aspect-[3/2] mb-6 rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            {/* Metadane artykułu */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>

            {/* Tagi */}
            <PostTags tags={post.tags} />
          </header>

          {/* Treść artykułu */}
          <article className="prose prose-lg max-w-none">
            {renderContentWithComponents(post.content)}
          </article>
          <FacebookFollowBox
            placement="blog"
            title="Podobał się artykuł? Obserwuj nas na Facebooku"
            text="Co tydzień nowe artykuły, lekcje i krótkie zagadki do zrobienia razem z dzieckiem."
            className="mt-10"
          />

          {/* Stopka artykułu */}
          <footer className="mt-12 pt-8 border-t">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Podobał Ci się ten artykuł? Sprawdź więcej na naszym blogu!
              </p>
              <Link href="/blog">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Zobacz więcej artykułów
                </Button>
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </BlogPostWrapper>
  );
}
