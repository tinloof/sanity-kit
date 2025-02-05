import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {pages} from '@tinloof/sanity-studio'

export default defineConfig({
  name: 'default',
  title: 'Vite studio',
  projectId: 'qfrmq8mg',
  dataset: 'production',
  plugins: [
    structureTool(),
    pages({
      previewUrl: {
        previewMode: {
          enable: 'http://localhost:9999/api/draft',
        },
      },
      creatablePages: ['page', 'post', 'author'],
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
