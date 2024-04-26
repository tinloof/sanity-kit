import {definePathname} from '@tinloof/sanity-studio'
import {defineType} from 'sanity'

export default defineType({
  type: 'document',
  name: 'post',
  fields: [
    {
      type: 'string',
      name: 'title',
    },
    definePathname({
      name: 'pathname',
      initialValue: {
        current: '/blog/',
      },
      options: {folder: {canUnlock: false}},
    }),
  ],
})
