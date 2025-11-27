import {defineConfig, isDev} from 'sanity'
import {visionTool} from '@sanity/vision'
import {types} from './schema'

import {withExtends} from '@tinloof/sanity-extends'
import {documentOptions} from '@tinloof/sanity-document-options'
import {pages} from '@tinloof/sanity-studio'

export default defineConfig({
  name: 'default',
  title: 'Newsletter',
  projectId: 'k5h7yrvm',
  dataset: 'production',
  plugins: [
    // @ts-ignore
    pages({
      allowOrigins: isDev ? ['http://localhost:3000'] : undefined,
      previewUrl: {
        origin: isDev ? 'http://localhost:3000' : undefined,
        previewMode: {
          enable: '/api/draft',
        },
      },
      creatablePages: ['modularPage'],
    }),
    // @ts-ignore
    visionTool(),
    // @ts-ignore
    documentOptions(),
  ],
  schema: {
    types: withExtends(types),
  },
})
