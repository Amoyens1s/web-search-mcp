#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchWebContent, searchWebContentSchema } from "./tools.js";
import { SearchWebContentParams } from "./types.js";

// 创建MCP服务器
const server = new McpServer({
  name: "web-search-extract-mcp",
  version: "1.0.0",
});

// 注册search_web_content工具
server.registerTool(
  "search_web_content",
  {
    description: "执行网络搜索并提取内容",
    inputSchema: searchWebContentSchema.shape,
  },
  async (params: SearchWebContentParams) => {
    try {
      const result = await searchWebContent(params);
      return {
        content: result.content,
        sources: result.sources,
      };
    } catch (error) {
      console.error("Tool execution error:", error);
      throw error;
    }
  }
);

// 启动服务器
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Web Search MCP Server started");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// 启动服务器
main();