// 搜索结果接口
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

// performWebSearch 的返回类型
export interface WebSearchResult {
  formattedText: string;
  sources: SearchResult[];
}

// 搜索选项接口
export interface SearchOptions {
  maxResults?: number;
  includeContent?: boolean;
  contentLengthLimit?: number;
  totalContentLengthLimit?: number;
  searchEngine?: 'bing' | 'google';
}

// MCP工具参数类型
export interface SearchWebContentParams {
  query: string;
  maxResults?: number;
  includeContent?: boolean;
}