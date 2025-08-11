import { extractContent } from 'web-content-extract';
import { SearchResult, SearchOptions, WebSearchResult } from './types.js';
import { ofetch } from 'ofetch';

// 从必应搜索页面提取搜索结果
async function searchBingWeb(query: string, maxResults: number = 10): Promise<SearchResult[]> {
  try {
    const response = await ofetch('https://www.bing.com/search', {
      query: { q: query },
      timeout: 5000,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    // 使用正则表达式提取搜索结果
    const results: SearchResult[] = [];
    const itemRegex = /<li class="b_algo"[^>]*>[\s\S]*?<\/li>/gi;
    const items = response.match(itemRegex) || [];

    for (const item of items) {
      // 提取标题和URL
      const titleMatch = item.match(/<h2[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>.*?<\/h2>/i);
      if (!titleMatch) continue;

      const url = titleMatch[1];
      const title = titleMatch[2].replace(/<.*?>/g, '').trim();

      // 提取摘要
      const snippetMatch = item.match(/<p[^>]*>(.*?)<\/p>/i);
      const snippet = snippetMatch ? snippetMatch[1].replace(/<.*?>/g, '').trim() : '';

      if (title && url && snippet && url.startsWith('http')) {
        results.push({ title, url, snippet });
        
        // 如果达到了最大结果数，就停止
        if (results.length >= maxResults) {
          break;
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

// 执行网络搜索并提取内容
export async function performWebSearch(
  query: string, 
  options: SearchOptions = {}
): Promise<WebSearchResult> {
  try {
    const {
      maxResults = 10,
      includeContent = true,
      contentLengthLimit = 800,
      totalContentLengthLimit = 9500,
      searchEngine = 'bing'
    } = options;

    // 执行搜索
    let searchResults: SearchResult[] = [];
    
    if (searchEngine === 'bing') {
      searchResults = await searchBingWeb(query, maxResults);
    } else {
      // 默认使用必应搜索
      searchResults = await searchBingWeb(query, maxResults);
    }

    if (searchResults.length === 0) {
      return { formattedText: '未找到相关搜索结果。', sources: [] };
    }

    // 如果不需要提取内容，直接返回搜索结果
    if (!includeContent) {
      return { 
        formattedText: '搜索完成，但未提取内容。', 
        sources: searchResults 
      };
    }

    // 并行提取所有链接的内容
    const contentPromises = searchResults.map(async (result) => {
      try {
        const extracted = await extractContent(result.url, true);
        let content = extracted.content || '';
        
        // 限制单个页面内容长度
        if (content.length > contentLengthLimit) {
          content = `${content.substring(0, contentLengthLimit)}...`;
        }
        
        return {
          ...result,
          content,
        };
      } catch (error) {
        console.error(`Error extracting content from ${result.url}:`, error);
        return {
          ...result,
          content: '',
        };
      }
    });

    const resultsWithContent = await Promise.all(contentPromises);

    // 格式化搜索结果
    let formattedText = '';
    const sourcesForReturn: SearchResult[] = [];
    let totalLength = 0;

    for (const result of resultsWithContent) {
      if (result.content && result.content.length > 0) {
        const resultText = `URL: ${result.url}\n内容: ${result.content}\n\n---\n\n`;

        if (totalLength + resultText.length > totalContentLengthLimit) break;

        formattedText += resultText;
        totalLength += resultText.length;
        sourcesForReturn.push({ 
          title: result.title, 
          url: result.url, 
          snippet: result.snippet 
        });
      }
    }

    if (!formattedText) {
      return { 
        formattedText: '搜索到了结果，但无法提取有效内容。', 
        sources: searchResults 
      };
    }

    return { formattedText, sources: sourcesForReturn };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { formattedText: `搜索过程中出现错误: ${errorMessage}`, sources: [] };
  }
}