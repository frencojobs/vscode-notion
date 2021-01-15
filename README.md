# VSCode Notion

Browse Notion pages directly in Visual Studio Code.

> Disclaimer: This is an unofficial extension made using an unofficial renderer with the data from an unofficial API.

<img align="center" src="https://raw.githubusercontent.com/frencojobs/vscode-notion/main/.github/demo.gif" />

## Features

Here is a list of features that the extension currently supports.

- 📄 View Notion pages while you're coding
- 🔓 Supports both private + public pages
- 🗓️ Browse recently opened pages
- 📌 Bookmark important ones for next times

Here is the checklist for features I'm planning to add to the extension.

- [x] View notion pages
- [x] Support embeddings for certain trusted sources
- [ ] Native syntax highlight for code snippets
- [ ] Authentication for viewing private pages
- [ ] Sidebar for all of user's pages

_Authentication is not currently available since the unofficial API doesn't support much._ But I'm planning to add it as soon as I get access to the official notion API that is coming very soon.

## Configuration

### API

A URL to get the data for Notion pages. By default, it is a hosted version of [Notion Api Worker](https://github.com/splitbee/notion-api-worker) and feel free to host your own and use.

### Access Token

The `Authorization` header to be used when getting the data from the API. Will be empty by default and replace it with your own to view private pages of yours. As of now, you can get the token from `token_v2` of Notion website's cookies in your web browser.

### Allow Embeds

A boolean value to determine whether to allow iframe embeddings when viewing pages. It will be `false` by default.

### Font Family

A comma separated string of font families to use in the pages. Will be `'Helvetica Neue', sans-serif` by default.

### Font Size

The font size in pixels to use in the pages. It will be `14` by default.

### Line Height

The unitless line height value to use in the pages. By default, `1.5` will be used.

---

Here are the available settings with default values.

```json
{
  "VSCodeNotion.api": "https://notion-api.frenco.dev",
  "VSCodeNotion.accessToken": "",
  "VSCodeNotion.allowEmbeds": false,
  "VSCodeNotion.fontFamily": "'Helvetica Neue', sans-serif",
  "VSCodeNotion.fontSize": 14,
  "VSCodeNotion.lineHeight": 1.5
}
```

## Acknowledgement

This project won't be possible without [React Notion](https://github.com/splitbee/react-notion) and [Notion API Worker](https://github.com/splitbee/notion-api-worker) libraries by Splitbee.

## License

MIT © Frenco Jobs
