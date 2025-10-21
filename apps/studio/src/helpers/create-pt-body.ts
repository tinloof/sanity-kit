import {defineArrayMember, defineField} from "sanity";
import {hrefPt} from "../schemas/objects/href";

const AVAILABLE_STYLES = {
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
};

const AVAILABLE_BLOCKS = {
  image: defineField({
    type: "image",
    name: "imagePtBlock",
    title: "Image",
    options: {hotspot: true},
    fields: [
      defineField({
        name: "caption",
        type: "string",
      }),
    ],
  }),
  video: defineField({
    type: "object",
    name: "videoPtBlock",
    title: "Video",
    validation: (Rule) => Rule.required(),
    fields: [
      defineField({
        name: "video",
        type: "vimeo.video",
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: "caption",
        type: "string",
      }),
    ],
  }),
  blockquote: defineField({
    type: "blockquote",
    name: "blockquotePtBlock",
    title: "Blockquote",
  }),
  code: defineField({
    type: "codePtBlock",
    name: "codePtBlock",
    title: "Code",
    validation: (Rule) => Rule.required(),
  }),
  tweet: defineField({
    type: "object",
    name: "tweetPtBlock",
    title: "Tweet",
    validation: (Rule) => Rule.required(),
    fields: [
      defineField({
        name: "tweetId",
        type: "string",
        title: "Tweet ID",
        description:
          "The ID of the tweet (the numbers at the end of the tweet URL)",
        validation: (Rule) => Rule.required(),
      }),
    ],
  }),
  youtube: defineField({
    type: "object",
    name: "youtubePtBlock",
    title: "YouTube",
    validation: (Rule) => Rule.required(),
    fields: [
      defineField({
        name: "url",
        type: "string",
        title: "YouTube URL",
        description: "The URL of the YouTube video",
        validation: (Rule) => Rule.required(),
      }),
    ],
  }),
  table: defineField({
    type: "table",
    name: "tablePtBlock",
    title: "Table",
    validation: (Rule) => Rule.required(),
  }),
} as const;

const AVAILABLE_INNER_BLOCKS = {} as const;

const AVAILABLE_LISTS = {
  bullet: {title: "Bullet list", value: "bullet"},
  number: {title: "Numbered list", value: "number"},
} as const;

const AVAILABLE_DECORATORS = {
  strong: {title: "Strong", value: "strong"},
  em: {title: "Emphasis", value: "em"},
  underline: {title: "Underline", value: "underline"},
  strikeThrough: {title: "Strike through", value: "strike-through"},
} as const;

const AVAILABLE_ANNOTATIONS = {
  href: {...hrefPt},
  inlineCode: {
    name: "inlineCode",
    type: "object",
    title: "Inline Code",
    fields: [
      {
        name: "isInlineCode",
        type: "boolean",
        title: "Format as Inline Code",
        description: "Toggle to format this text as inline code",
        initialValue: true,
        hidden: true,
      },
    ],
    blockEditor: {},
  },
} as const;

type PtBodyProps = {
  annotations?: (keyof typeof AVAILABLE_ANNOTATIONS)[];
  blocks?: (keyof typeof AVAILABLE_BLOCKS)[];
  decorators?: (keyof typeof AVAILABLE_DECORATORS)[];
  innerBlocks?: (keyof typeof AVAILABLE_INNER_BLOCKS)[];
  lists?: (keyof typeof AVAILABLE_LISTS)[];
  styles?: (keyof typeof AVAILABLE_STYLES)[];
};

// Create a ptBody field with the given options
export default ({
  styles = [],
  blocks = [],
  innerBlocks = [],
  lists = [],
  decorators = [],
  annotations = [],
}: PtBodyProps) => {
  return defineField({
    name: "ptBody",
    title: "Rich text",
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        lists: lists.map((list) => AVAILABLE_LISTS[list]),
        marks: {
          annotations: annotations.map(
            (annotation) => AVAILABLE_ANNOTATIONS[annotation],
          ),
          decorators: decorators.map(
            (decorator) => AVAILABLE_DECORATORS[decorator],
          ),
        },
        styles: [
          {title: "Paragraph", value: "normal"},
          ...styles.map((style) => ({
            title:
              AVAILABLE_STYLES[style as keyof typeof AVAILABLE_STYLES] || style,
            value: style,
          })),
        ],
        of: [
          // Uncomment this when we have inner blocks
          // ...innerBlocks.map((block) =>
          //   defineArrayMember({...AVAILABLE_INNER_BLOCKS[block]}),
          // ),
        ],
      }),
      ...blocks.map((block) => defineArrayMember({...AVAILABLE_BLOCKS[block]})),
    ],
  });
};
