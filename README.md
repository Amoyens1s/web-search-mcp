# Web Search MCP

A Model Context Protocol (MCP) server for web search with content extraction, using the [web-content-extract](https://www.npmjs.com/package/web-content-extract) library.

## Features

- 🔍 Web search using Bing search engine
- 📄 Content extraction using Mozilla Readability
- 🏷️ SEO metadata extraction
- 🧠 Integration with AI assistants through the Model Context Protocol
- 🛠️ MCP tool for searching and extracting web content

## Installation

### As an MCP Server

To use this as an MCP server, configure it in your MCP settings:

```json
{
  "mcpServers": {
    "web-search": {
      "command": "npx",
      "args": ["web-search-extract-mcp"],
      "disabled": false
    }
  }
}
```

### Direct Installation

```bash
npm install web-search-extract-mcp
```

## Usage

Once configured as an MCP server, you can use the `search_web_content` tool:

```json
{
  "query": "latest AI developments",
  "maxResults": 5,
  "includeContent": true
}
```

### Tool Parameters

- `query` (string, required): The search query
- `maxResults` (number, optional): Maximum number of results to return (default: 10)
- `includeContent` (boolean, optional): Whether to include extracted content (default: true)

### Tool Response

The tool returns extracted content from web pages along with metadata:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Extracted content from web pages..."
    }
  ],
  "sources": [
    {
      "title": "Page Title",
      "url": "https://example.com",
      "snippet": "Page snippet"
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/your-username/web-search-extract-mcp.git
cd web-search-extract-mcp
npm install
```

### Building

```bash
npm run build
```

### Running Locally

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## API

### `search_web_content`

Performs a web search and extracts content from the results.

**Parameters:**

- `query`: Search query string
- `maxResults`: Maximum number of results to return
- `includeContent`: Whether to extract content from pages

**Returns:**

- `content`: Extracted content in Markdown format
- `sources`: List of sources with titles, URLs, and snippets

## How It Works

1. **Search**: Uses Bing to search for the query
2. **Extract**: Uses `web-content-extract` to extract main content from search results
3. **Format**: Formats the content for AI consumption
4. **Return**: Returns structured data with sources

## License

MIT
