# @tinloof/sanity-document-options

## Installation

```sh
npm install @tinloof/sanity-document-options
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from "sanity";
import {myPlugin} from "sanity-plugin-sanity-document-options";

export default defineConfig({
  //...
  plugins: [myPlugin({})],
});
```

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
