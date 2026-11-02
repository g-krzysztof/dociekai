'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { BlogPost } from '@/lib/blog';
import { Calendar, Clock, User, ArrowRight, Tag as TagIcon } from 'lucide-react';
import { memo } from 'react';

interface BlogCardProps {
  post: BlogPost;
  index: number;
  selectedTag?: string;
  tagColors?: Map<string, string>; // Przekaż kolory z góry
}

export const BlogCard = memo(function BlogCard({
  post,
  index,
  selectedTag,
  tagColors,
}: BlogCardProps) {
  const tagColor = (name: string) => {
    return tagColors?.get(name) || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };
  return (
    <article
      key={post.id}
      className="group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
    >
      {/* Small decorative element */}
      <div
        className={`absolute top-0 right-0 w-16 h-16 opacity-8 ${
          index % 4 === 0
            ? 'bg-cyan-500'
            : index % 4 === 1
              ? 'bg-blue-500'
              : index % 4 === 2
                ? 'bg-purple-500'
                : 'bg-emerald-500'
        } rounded-bl-2xl z-0`}
      ></div>

      {post.image && (
        <Link href={`/blog/${post.slug}`}>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-xl flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              quality={60}
            />
          </div>
        </Link>
      )}

      <div className="relative p-5 z-10 flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-1 ${tagColor(
                  tag
                )} text-[10px] font-medium rounded-full ${
                  tag === selectedTag ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
              >
                <TagIcon className="w-3 h-3 opacity-70" />
                {tag}
              </span>
            ))}
          </div>
          <Typography
            variant="h4"
            className="mb-2 hover:text-primary transition-colors line-clamp-2 leading-tight"
          >
            <Link href={`/blog/${post.slug}`} className="hover:cursor-pointer">
              {post.title}
            </Link>
          </Typography>
          <Typography
            variant="small"
            className="text-muted-foreground mb-4 leading-relaxed line-clamp-3"
          >
            {post.excerpt}
          </Typography>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`}>
            <Button
              variant="outline"
              size="sm"
              className={`w-full group hover:cursor-pointer ${
                index % 4 === 0
                  ? 'hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20'
                  : index % 4 === 1
                    ? 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    : index % 4 === 2
                      ? 'hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                      : 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
              } rounded-xl transition-all duration-300`}
            >
              Czytaj więcej
              <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
});
