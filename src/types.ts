export interface SiteContent {
  id: string;
  value: string;
  type: 'text' | 'html' | 'image' | 'video' | 'link';
  section: string;
}

export interface Article {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author: string;
}

export interface GalleryImage {
  id?: string;
  url: string;
  caption: string;
  category: string;
}
