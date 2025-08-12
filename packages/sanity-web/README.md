# @tinloof/sanity-web

A collection of Sanity-related utilities for web development.

## Table of Contents

- [Installation](#installation)
- [Components](#components)
  - [ExitPreview](#exitpreview)
    - [Usage](#usage)
    - [Props](#props)
    - [Features](#features)
    - [Styling](#styling)
    - [Dependencies](#dependencies)
- [License](#license)
- [Develop & test](#develop--test)

## Installation

```sh
npm install @tinloof/sanity-web
```

## Components

### ExitPreview

A React component that provides a UI for exiting Sanity's draft mode/preview mode. The component renders a fixed-position button that allows users to disable draft mode and refresh the page.

#### Usage

```tsx
import {ExitPreview} from "@tinloof/sanity-web";
import {disableDraftMode} from "./actions";

// In your app/layout.tsx or similar
export default function RootLayout({children}) {
  return (
    <html>
      <body>
        {children}
        <ExitPreview disableDraftMode={disableDraftMode} />
      </body>
    </html>
  );
}
```

Create the server action in `app/actions.ts`:

```tsx
"use server";

import {draftMode} from "next/headers";

export async function disableDraftMode() {
  "use server";
  await Promise.allSettled([
    (await draftMode()).disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}
```

#### Props

| Prop               | Type                             | Description                                                                                              |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `disableDraftMode` | `() => Promise<void>`            | A function that disables draft mode. This should handle clearing preview cookies and revalidating paths. |
| `className`        | `string` (optional)              | CSS class name to apply to the button. When provided, default styles are not applied.                    |
| `styles`           | `React.CSSProperties` (optional) | Additional inline styles to merge with default styles. Only applied when `className` is not provided.    |

#### Features

- **Conditional rendering**: Only shows when not in Sanity's Presentation Tool
- **Loading state**: Shows "Disabling..." text while the draft mode is being disabled
- **Auto-refresh**: Automatically refreshes the page after disabling draft mode
- **Fixed positioning**: Positioned at the bottom center of the screen with high z-index
- **Accessible**: Properly disabled during loading state

#### Styling

The component provides flexible styling options:

**Default styling**: When no `className` is provided, the component uses inline styles for a black button with white text, positioned fixed at the bottom center of the screen.

**Custom styles with `styles` prop**: You can merge additional styles with the defaults:

```tsx
<ExitPreview
  disableDraftMode={disableDraftMode}
  styles={{backgroundColor: "blue", borderRadius: "8px"}}
/>
```

**Custom styling with `className` prop**: For complete control, provide a `className`. This disables all default styles:

```tsx
<ExitPreview
  disableDraftMode={disableDraftMode}
  className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-md py-2 px-4"
/>
```

#### Dependencies

- Requires `next-sanity/hooks` for `useIsPresentationTool`
- Requires `next/navigation` for `useRouter`
- Built for Next.js App Router with React 18+ (uses `useTransition`)

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
