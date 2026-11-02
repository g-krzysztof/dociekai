export type StrapiTag = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  color?: string; // nieużywane
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  attributes?: {
    articleCount?: number;
    [key: string]: unknown;
  };
};

export type StrapiTagsResponse = {
  data: StrapiTag[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

// Uproszczenie migracji: Tag == StrapiTag (zachowuje kompatybilność istniejących importów)
export type Tag = StrapiTag;
