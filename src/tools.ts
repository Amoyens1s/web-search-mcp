import { z } from 'zod';
import { performWebSearch } from './search.js';
import { SearchWebContentParams } from './types.js';

// 定义search_web_content工具的参数模式
export const searchWebContentSchema = z.object({
  query: z.string().min(1, "查询词不能为空"),
  maxResults: z.number().min(1).max(50).optional().default(10),
  includeContent: z.boolean().optional().default(true),
});

// search_web_content工具的实现
export async function searchWebContent(params: SearchWebContentParams) {
  try {
    // 验证参数
    const validatedParams = searchWebContentSchema.parse(params);
    
    // 执行搜索
    const result = await performWebSearch(validatedParams.query, {
      maxResults: validatedParams.maxResults,
      includeContent: validatedParams.includeContent,
    });
    
    // 返回结果
    return {
      content: [
        {
          type: "text" as const,
          text: result.formattedText,
        },
      ],
      sources: result.sources,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`参数验证失败: ${error.errors.map((e: z.ZodIssue) => e.message).join(', ')}`);
    }
    
    throw new Error(`搜索过程中出现错误: ${error instanceof Error ? error.message : String(error)}`);
  }
}