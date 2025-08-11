import http from '../http';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

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

/**
 * 使用 Mozilla Readability 提取页面主要内容
 */
async function extractContent(url: string): Promise<string> {
  try {
    const response = await http.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        // 注意: Referer等headers在浏览器环境中是unsafe的，不能手动设置
      },
    });

    const { document } = parseHTML(response.data);
    const reader = new Readability(document, {});
    const result = reader.parse();

    if (result?.textContent) {
      const content = result.textContent.trim();
      // 限制单个页面内容长度为800字符
      return content.length > 800 ? `${content.substring(0, 800)}...` : content;
    }

    return '';
  } catch {
    // 静默失败
    return '';
  }
}

/**
 * 从必应搜索页面提取搜索结果
 */
async function searchBingWeb(query: string): Promise<SearchResult[]> {
  try {
    const response = await http.get('https://www.bing.com/search', {
      params: { q: query },
      timeout: 5000,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        // 注意: Referer等headers在浏览器环境中是unsafe的，不能手动设置
      },
    });

    const { document } = parseHTML(response.data);

    const results: SearchResult[] = [];
    const items = document.querySelectorAll('li.b_algo');

    items.forEach((item) => {
      const titleEl = item.querySelector('h2 a');
      const url = titleEl?.getAttribute('href');
      const title = titleEl?.textContent?.trim();

      const snippetEl = item.querySelector('.b_caption p');
      const snippet = snippetEl?.textContent?.trim();

      if (title && url && snippet && url.startsWith('http')) {
        results.push({ title, url, snippet });
      }
    });

    // 返回所有找到的结果，不限制数量
    return results;
  } catch {
    return [];
  }
}

/**
 * 执行网络搜索并提取内容
 */
export async function performWebSearch(query: string): Promise<WebSearchResult> {
  try {
    const searchResults = await searchBingWeb(query);

    if (searchResults.length === 0) return { formattedText: '未找到相关搜索结果。', sources: [] };

    // 并行提取所有链接的内容
    const contentPromises = searchResults.map(async (result) => {
      const content = await extractContent(result.url);
      return {
        ...result,
        content,
      };
    });

    const resultsWithContent = await Promise.all(contentPromises);

    // 格式化搜索结果
    let formattedText = '';
    const sourcesForReturn: SearchResult[] = [];
    let totalLength = 0;
    const maxTotalLength = 9500; // 为请求留出500字符的缓冲

    for (const result of resultsWithContent) {
      if (result.content && result.content.length > 0) {
        const resultText = `URL: ${result.url}\n内容: ${result.content}\n\n---\n\n`;

        if (totalLength + resultText.length > maxTotalLength) break;

        formattedText += resultText;
        totalLength += resultText.length;
        sourcesForReturn.push({ title: result.title, url: result.url, snippet: result.snippet });
      }
    }

    if (!formattedText) return { formattedText: '搜索到了结果，但无法提取有效内容。', sources: [] };

    return { formattedText, sources: sourcesForReturn };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { formattedText: `搜索过程中出现错误: ${errorMessage}`, sources: [] };
  }
}
