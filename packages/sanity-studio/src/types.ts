import { Language as Locale } from "@sanity/document-internationalization";
import {
  NavigatorOptions as PresentationNavigatorOptions,
  PresentationPluginOptions,
} from "@sanity/presentation";
import {
  ObjectDefinition,
  ObjectOptions,
  ObjectSchemaType,
  SanityDocument,
  SlugDefinition,
  SlugOptions,
} from "sanity";

export type NormalizedCreatablePage = {
  title: string;
  type: string;
};

export type PagesNavigatorOptions = {
  i18n?: {
    locales: Locale[];
    defaultLocaleId?: string;
  };
  creatablePages?: Array<NormalizedCreatablePage>;
};

export type PagesNavigatorPluginOptions = PresentationPluginOptions & {
  i18n?: {
    locales: Locale[];
    defaultLocaleId?: string;
  };
  navigator?: Pick<PresentationNavigatorOptions, "maxWidth" | "minWidth">;
  creatablePages?: Array<NormalizedCreatablePage | string>;
  title?: string;
};

export type Page = {
  _rev: string;
  _id: string;
  _originalId: string;
  _type: Exclude<"string", "folder">;
  _updatedAt: string;
  _createdAt: string;
  pathname: string | null;
  locale?: string;
  children: {};
};

export type PageTreeNode = Page & {
  title: string;
  edited?: boolean;
};

export type FolderTreeNode = Omit<Page, "_type"> & {
  _type: "folder";
  title: string;
  children: Tree;
};

export type Tree = Record<string, TreeNode>;

export type TreeNode = PageTreeNode | FolderTreeNode;

export type NavigatorContextType = {
  rootTree: Tree;
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  searchTerm: string;
  handleSearch: (value: string) => void;
  locale?: string;
  defaultLocaleId?: string;
  setLocale?: (value: string) => void;
  items: TreeNode[];
};

export type HeaderProps = {
  children?: React.ReactNode;
  locales?: string[];
  domRef?: React.RefObject<HTMLDivElement>;
  pages?: NormalizedCreatablePage[];
};

export type ListItemProps = {
  item: TreeNode;
  active?: string;
  setActive?: (value: string) => void;
  idx?: number;
  virtualChild?: Record<string, any>;
};

export type SkeletonListItemsProps = {
  items: number;
};

export type LocaleProps = {
  locales: Locale[];
  domRef?: React.RefObject<HTMLDivElement>;
};

export type ReducerAction = {
  type: string;
  payload?: any;
};

export interface DocumentWithLocale extends SanityDocument {
  locale: Locale["id"];
}

export interface SectionOptions extends ObjectOptions {
  variants?: SectionVariant[];
}

/**
 * Pass any of the properties of Sanity object types described here: https://www.sanity.io/docs/object-type
 *
 * The `custom` property is strictly typed to include what the toolkit needs for scaffolding the website & studio.
 */
export interface SectionSchema extends Omit<ObjectDefinition, "options"> {
  options: SectionOptions;
}

export interface SectionVariant {
  /**
   * URl to an image, video or GIF that shows what this block variant looks like.
   */
  assetUrl: string;
  /**
   * What shows in the block selector in the editor.
   */
  title?: string;
  /**
   * What initial value to use for this variant when creating the block.
   *
   * @example
   * {
   *  title: "Title Centered, dark background",
   *  initialValue: { centeredTitle: true, bg: "dark" }
   * }
   */
  initialValue?: {};
}

export type SectionType = ObjectSchemaType & {
  options: SectionOptions;
};

export type SectionVariantType = {
  sectionName: string;
  title: string;
  assetUrl?: string;
  initialValue?: any;
};

export type SectionAddHandler = (params: {
  sectionName: string;
  initialValue?: any;
}) => void;

export type PathnameOptions = SlugOptions & {
  prefix?: string;
  folder?: {
    canUnlock?: boolean;
  };
  i18n?: {
    enabled?: boolean;
    defaultLocaleId?: string;
  };
};

export type PathnameParams = Omit<
  SlugDefinition,
  "type" | "options" | "name"
> & {
  name?: string;
  options?: PathnameOptions;
};
