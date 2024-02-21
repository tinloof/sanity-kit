import config from '@/config'
import { definePathname } from '@tinloof/sanity-studio'
import { defineType } from 'sanity'

export default defineType({
  type: 'document',
  name: 'page',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    definePathname({
      defaultLocaleId: config.i18n.defaultLocaleId,
    }),
    {
      type: 'string',
      name: 'locale',
      hidden: true,
    },
  ],
})
