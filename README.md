# VSCode Notion

View Notion documents directly in Visual Studio Code.

> Disclaimer: This is an unofficial extension made using an unofficial renderer with the data from unofficial API.

## Features

Here is the checklist for features I'm planning to add to the extension.

- [x] View notion pages
- [ ] Support embeddings for certain trusted sources
- [ ] Syntax highlight for code snippets
- [ ] Sidebar for opened pages
- [ ] Authentication for viewing private pages
- [ ] Sidebar for all of user's pages

_Authentication is not currently available since the unofficial API doesn't support much._ But I'm planning to add it as soon as I get access to the official notion API that is coming very soon.

## Configuration

Here are the available settings with default values.

```json
{
  "vscode_notion.api": "https://notion-api.frenco.dev",
  "vscode_notion.fontFamily": "'Helvetica Neue', sans-serif",
  "vscode_notion.fontSize": 14
}
```

_You can choose to host your own API server with [notion-api-worker](https://github.com/splitbee/notion-api-worker)._

## License

MIT © Frenco Jobs
