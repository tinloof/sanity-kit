import { capitalize } from "lodash";
import { useMemoObservable } from "react-rx";
import { useDocumentStore } from "sanity";

import {
  NormalizedCreatablePage,
  Page,
  PagesNavigatorPluginOptions,
  Tree,
  TreeNode,
} from "../../../types";

export const useSanityFetch = ({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}) => {
  const documentStore = useDocumentStore();
  const subscribe = useMemoObservable(
    () => documentStore.listenQuery(query, variables, {}),
    [documentStore]
  );

  const loading = subscribe === undefined;
  const data = subscribe;

  return [data, loading];
};

export const pathnameToTitle = (pathname: string) => {
  if (pathname === "/") return "Home";
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment[0].toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
};

export function buildTree(list: Page[]): Tree {
  const root: Tree = {};
  for (const item of list) {
    const isDraft = item._id.startsWith("drafts.");
    const segments =
      item.pathname === "/" ? [""] : item.pathname.split("/").filter(Boolean);
    let currentFolder = root;
    let pathSoFar = "";

    segments.forEach((segment, index) => {
      const isFolder = index !== segments.length - 1;
      pathSoFar += `/${segment}`;

      const node: TreeNode = {
        ...item,
        pathname: pathSoFar,
        edited: isDraft,
        _id: isFolder ? pathSoFar + index : item._id,
        _type: isFolder ? ("folder" as const) : item._type,
        title: pathnameToTitle(pathSoFar),
        children: {},
      };

      // If the segment doesn't exist in the current level, add it (works for both folders and pages)
      // e.g. pathname: "lp/about", segment: "about", currentFolder: "lp/"
      if (!currentFolder[segment]) {
        currentFolder[segment] = node;
      }
      // e.g. pathname: "lp", segment: "lp", currentFolder: root = {lp: {type: "folder"}}
      else if (!isFolder && currentFolder[segment]._type === "folder") {
        currentFolder[segment].children[""] = node;
      }
      // e.g. pathname: "lp", segment: "lp", currentFolder: root = {lp: {type: "page"}}
      else if (isFolder && currentFolder[segment]._type !== "folder") {
        currentFolder[segment] = {
          ...node,
          children: { "": currentFolder[segment] },
        };
      }

      currentFolder = currentFolder[segment].children;
    });
  }
  return root;
}

// Find the closest tree containing a folder
export function findTreeByPath(root: Tree, path?: string): Tree {
  if (path === "/" || !path) return root;

  const segments = path.split("/").filter((s) => s !== "");
  let currentTree = root;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (currentTree[segment] && currentTree[segment]._type === "folder") {
      currentTree = currentTree[segment].children;
    }
  }

  return currentTree;
}

export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function doesRouteExist(obj: Tree, targetRoute: string): boolean {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const item = obj[key];
    if (item._type !== "folder" && item.pathname === targetRoute) {
      return true;
    }
    if (item._type === "folder" && doesRouteExist(item.children, targetRoute)) {
      return true;
    }
  }
  return false;
}

export const getTemplateName = (template: string) => {
  return `${template}-with-pathname`;
};

export function createPageTemplates(creatablePages: NormalizedCreatablePage[]) {
  return creatablePages.map(({ type }) => {
    return {
      id: getTemplateName(type),
      title: `${type} with pathname`,
      schemaType: type,
      parameters: [
        { name: "locale", type: "string" },
        { name: "pathname", type: "string" },
      ],
      value: (params: any) => {
        return {
          ...(params.locale && { locale: params.locale }),
          ...(params.pathname
            ? { pathname: { _type: "slug", current: params.pathname } }
            : {}),
        };
      },
    };
  });
}

export function normalizeCreatablePages(
  creatablePageTypes: PagesNavigatorPluginOptions["creatablePages"]
): NormalizedCreatablePage[] {
  return (
    creatablePageTypes?.map((page) => {
      if (typeof page === "string") {
        return {
          title: capitalize(page.replace(/[-.]/g, " ")),
          type: page,
        };
      }

      return page;
    }) || []
  );
}
