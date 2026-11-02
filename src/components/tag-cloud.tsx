'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { useState } from 'react';
import { DecorativeFrame } from './decorative-frame';

interface TagWithCount {
  id: number;
  name: string;
  slug: string;
  color: string;
  count: number;
}

interface TagCloudProps {
  onTagClick?: (tagName: string) => void;
  selectedTag?: string;
  tags?: TagWithCount[];
  loading?: boolean;
}

export function TagCloud({ onTagClick, selectedTag, tags = [], loading = false }: TagCloudProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6">
        <div className="animate-pulse h-6 w-24 bg-muted rounded mb-4" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DecorativeFrame glowingBorder glowColor='#d64c29' glowRadius={150}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-primary to-chart-4 rounded-lg">
          <Tag className="w-4 h-4 text-white" />
        </div>
        <Typography
          variant="h3"
          className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent"
        >
          Kategorie
        </Typography>
      </div>

      <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-4">
        {tags.map((tag, index) => {
          const isSelected = selectedTag === tag.name;
          const isHovered = hoveredTag === tag.name;
          const padding = getPadding(tag.count ?? 0);
          const fontSize = getFontSizePx(tag.count ?? 0);
          return (
            <button
              key={tag.name}
              onClick={() => onTagClick?.(tag.name)}
              onMouseEnter={() => setHoveredTag(tag.name)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`
                group relative inline-flex items-center rounded-2xl
                transition-all duration-300 hover:cursor-pointer
                ${tag.color}
                ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg'
                    : 'hover:scale-105 hover:shadow-md'
                }
                ${isHovered ? 'shadow-lg transform-gpu' : ''}
                backdrop-blur-sm border border-white/20 dark:border-white/10
              `}
              style={{
                paddingTop: padding,
                paddingBottom: padding,
                paddingLeft: padding,
                paddingRight: padding,
                gap: padding,
                animation: isHovered ? `pulse 2s infinite` : undefined,
              }}
            >
              {/* Floating decoration */}
              <div
                className={`
                  absolute -top-1 -right-1 w-2 h-2 rounded-full opacity-60
                  transition-all duration-300 group-hover:scale-150 group-hover:opacity-80
                  ${
                    index % 4 === 0
                      ? 'bg-chart-4'
                      : index % 4 === 1
                        ? 'bg-primary'
                        : index % 4 === 2
                          ? 'bg-purple-400'
                          : 'bg-emerald-400'
                  }
                `}
              />

              <Tag className="ml-1 w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span
                className="font-medium group-hover:font-semibold transition-all"
                style={{ fontSize }}
              >
                {tag.name}
              </span>
              {/* Licznik artykułów */}
              <span
                className="px-2 py-0.5 bg-white/30 dark:bg-black/30 font-bold rounded-full backdrop-blur-sm"
                style={{ fontSize }}
              >
                {tag.count}
              </span>

              {/* Ripple effect on hover */}
              {isHovered && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 dark:bg-white/10 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {selectedTag && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <Typography variant="small" className="text-muted-foreground">
            Filtrowanie według: <span className="font-semibold text-foreground">{selectedTag}</span>
          </Typography>
          <Button
            variant="link"
            size="sm"
            onClick={() => onTagClick?.('')}
            className="mt-2 px-0 h-auto text-xs text-primary hover:text-primary/80"
          >
            Wyczyść filtr
          </Button>
        </div>
      )}
    </DecorativeFrame>
  );
}

// Helper to calculate font size in px for inline style
const getFontSizePx = (count: number) => {
  if (count >= 10) return '16px';
  if (count >= 7) return '14px';
  if (count >= 4) return '12px';
  if (count === 3) return '10px';
  if (count === 2) return '9px';
  if (count === 1) return '8px';
  if (count === 0) return '7px';
  return '6px';
};

// Helper to calculate only py padding based on count (returns px value for inline style)
const getPadding = (count: number) => {
  if (count >= 10) return 8;
  if (count >= 7) return 6;
  if (count >= 4) return 5;
  if (count === 3) return 4;
  if (count === 2) return 4;
  if (count === 1) return 3;
  if (count === 0) return 3;
  return 3;
};
