import schemas from '@/sanity/schemas'
import { visionTool } from '@sanity/vision'
import { documentI18n, pages } from '@tinloof/sanity-studio'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import StudioLogo from './components/StudioLogo'
import config from './config'

export default defineConfig({
  basePath: config.sanity.studioUrl,
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  title: config.siteName,
  icon: StudioLogo,
  schema: {
    types: schemas,
  },
  plugins: [
    pages({
      previewUrl: {
        previewMode: {
          enable: '/api/draft',
        },
      },
      creatablePages: ['page'],
      i18n: config.i18n,
    }),
    documentI18n({ ...config.i18n, schemas }),
    structureTool(),
    visionTool({ defaultApiVersion: config.sanity.apiVersion }),
  ],
})
