export type PagePayload = {
  _id: string;
  _type: string;
  pathname: string;
  title?: string;
  image?: any;
};

export interface PageProps<
  TParams extends string = never,
  TSearchParams extends string = never,
> {
  params: Promise<
    UnionToIntersection<
      {
        [K in TParams]: {
          [F in K extends `...${infer U}` ? U : K]: K extends `...${string}`
            ? string[]
            : string;
        };
      }[TParams]
    >
  >;
  searchParams: Promise<{[K in TSearchParams]?: string | string[]}>;
}

export type Prettify<T> = object & {
  [K in keyof T]: T[K];
};

export type UnionToIntersection<T> = Prettify<
  (T extends any ? (x: T) => any : never) extends (x: infer R) => any
    ? R
    : never
>;
