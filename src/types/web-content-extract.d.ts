declare module 'web-content-extract' {
  interface ExtractedContent {
    content: string;
    title?: string;
    seo?: SeoMetadata;
  }

  interface SeoMetadata {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    publishedTime?: string;
    siteName?: string;
    language?: string;
    openGraph?: {
      title?: string;
      type?: string;
      image?: string;
      url?: string;
      description?: string;
      siteName?: string;
      locale?: string;
    };
  }

  export function extractContent(url: string, includeSeo?: boolean): Promise<ExtractedContent>;
}