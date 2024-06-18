import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {pages, copySectionsToClipboard} from '@tinloof/sanity-studio'

export default defineConfig({
  name: 'default',
  title: 'Vite studio',
  projectId: 'ptjmyfc9',
  dataset: 'production',
  plugins: [
    structureTool(),
    pages({
      previewUrl: {
        draftMode: {
          enable: 'http://localhost:9999/api/draft',
        },
      },
      creatablePages: ['page', 'post', 'author'],
    }),
    visionTool(),
    copySectionsToClipboard(),
  ],
  schema: {
    types: schemaTypes,
  },
})
