import schemas from '@/sanity/schemas'
import { visionTool } from '@sanity/vision'
import { pages } from '@tinloof/sanity-studio'
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
        draftMode: {
          enable: '/api/draft',
        },
      },
      creatablePages: ['page'],
      // previewFragment: `
      //   "image": image.asset->url,
      // `,
    }),
    structureTool(),
    visionTool({ defaultApiVersion: config.sanity.apiVersion }),
  ],
})
