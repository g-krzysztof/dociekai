'use client';

import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/app-context';

export function PostTags({ tags }: { tags: string[] }) {
  const { tags: slice } = useApp();
  const colorFor = (name: string) =>
    slice.tags.find((t) => t.name === name)?.color ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className={colorFor(tag)}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export default PostTags;
