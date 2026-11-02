import fs from 'fs';
import path from 'path';

export interface TableColumn {
  key: string;
  header: string;
  className?: string;
  type?: 'text' | 'list';
}

export interface TableData {
  [key: string]: string | string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  date?: string; // backward compatibility
  featured: boolean;
  image: string;
  imageAlt: string;
  tags: string[];
  category: string;
  // Pola SEO ze Strapi; puste, gdy redakcja ich nie wypełniła.
  metaTitle?: string;
  metaDescription?: string;
  tables?: {
    [key: string]: {
      columns: TableColumn[];
      data: TableData[];
    };
  };
}
const blogDirectory = path.join(process.cwd(), 'src/data/blog');

export function getAllBlogPosts(): BlogPost[] {
  try {
    const fileNames = fs.readdirSync(blogDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => {
        const fullPath = path.join(blogDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const postData: BlogPost = JSON.parse(fileContents);
        return postData;
      })
      .sort((a, b) => {
        if (a.publishedAt < b.publishedAt) {
          return 1;
        } else {
          return -1;
        }
      });

    return allPostsData;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const allPosts = getAllBlogPosts();
    return allPosts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.error('Error getting blog post:', error);
    return null;
  }
}

export function getAllBlogSlugs(): string[] {
  try {
    const allPosts = getAllBlogPosts();
    return allPosts.map((post) => post.slug);
  } catch (error) {
    console.error('Error getting blog slugs:', error);
    return [];
  }
}
