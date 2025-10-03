import {TextInput} from "@sanity/ui";
import React from "react";
import {ArrayOfObjectsInputProps, defineArrayMember, defineField} from "sanity";

// Constants
const REDIRECT_CODES = {
  PERMANENT: "308",
  TEMPORARY: "307",
} as const;

const REDIRECT_STATUS = {
  PERMANENT: "permanent",
  TEMPORARY: "temporary",
} as const;

const BOOLEAN_VALUES = {
  TRUE: "true",
  FALSE: "false",
} as const;

const SEARCH_PLACEHOLDER =
  "Search redirects by source, destination, or status...";
const FONT_SIZE = 12;

// Helper functions
function getRedirectCode(permanent: boolean): string {
  return permanent ? REDIRECT_CODES.PERMANENT : REDIRECT_CODES.TEMPORARY;
}

function getRedirectStatus(permanent: boolean): string {
  return permanent ? REDIRECT_STATUS.PERMANENT : REDIRECT_STATUS.TEMPORARY;
}

function getBooleanString(permanent: boolean): string {
  return permanent ? BOOLEAN_VALUES.TRUE : BOOLEAN_VALUES.FALSE;
}

function matchesSearch(
  item: {source: string; destination: string; permanent: boolean},
  search: string,
): boolean {
  if (!item?.source || !item?.destination) return false;

  const searchLower = search.toLowerCase();
  return (
    item.source.toLowerCase().includes(searchLower) ||
    item.destination.toLowerCase().includes(searchLower) ||
    getRedirectStatus(item.permanent).includes(searchLower) ||
    getRedirectCode(item.permanent).includes(searchLower) ||
    getBooleanString(item.permanent).includes(searchLower)
  );
}

export default defineField({
  name: "redirects",
  title: "Redirects",
  description:
    "Configure URL redirects to automatically send visitors from old URLs to new ones. For handling moved pages, changed URLs, or temporary redirects.",
  type: "array",
  options: {
    layout: "list",
  },
  components: {
    input: ArrayInput,
  },
  of: [
    defineArrayMember({
      name: "redirect",
      title: "Redirect",
      type: "object",
      fields: [
        defineField({
          name: "source",
          title: "Source path",
          description:
            "The original URL path that visitors are trying to access on this site (must start with /)",
          type: "string",
          placeholder: "/old-page",
          validation: (Rule) =>
            Rule.required()
              .min(2)
              .custom((value) => {
                if (!value) return "Source path is required";
                if (!value.startsWith("/")) {
                  return "Source path must start with a forward slash (/)";
                }
                if (value === "/") {
                  return "Source path cannot be just a forward slash";
                }
                return true;
              }),
        }),
        defineField({
          name: "destination",
          title: "Destination URL",
          description:
            "Where visitors should be redirected to (can be a path like /new-page or a full URL like https://example.com)",
          type: "string",
          placeholder: "/new-page or https://example.com/new-page",
          validation: (Rule) =>
            Rule.required()
              .min(1)
              .custom((value) => {
                if (!value) return "Destination URL is required";
                if (value.startsWith("/")) return true;

                try {
                  const url = new URL(value);
                  if (!url.hostname || url.hostname.length === 0) {
                    return "Please enter a valid URL with a hostname (e.g., https://example.com) or a path starting with /";
                  }
                  // Check for valid hostname pattern (at least one dot or localhost)
                  if (
                    !url.hostname.includes(".") &&
                    url.hostname !== "localhost"
                  ) {
                    return "Please enter a valid URL with a proper hostname (e.g., https://example.com) or a path starting with /";
                  }
                  return true;
                } catch {
                  return "Please enter a valid URL (e.g., https://example.com) or a path starting with /";
                }
              }),
        }),
        defineField({
          name: "permanent",
          title: "Permanent redirect",
          description:
            "Permanent redirects (308) tell browsers and search engines this change is permanent. Use temporary (307) for testing or when you might change the destination later.",
          initialValue: true,
          type: "boolean",
          validation: (Rule) => Rule.required(),
        }),
      ],

      preview: {
        prepare({destination, permanent, source}) {
          return {
            media: (
              <div
                style={{
                  fontSize: FONT_SIZE,
                }}
              >
                {getRedirectCode(permanent)}
              </div>
            ),
            subtitle: `Redirects to: ${destination}`,
            title: `${source} →`,
          };
        },
        select: {
          destination: "destination",
          permanent: "permanent",
          source: "source",
        },
      },
    }),
  ],
});

function ArrayInput({members, ...props}: ArrayOfObjectsInputProps) {
  const [search, setSearch] = React.useState("");

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.currentTarget.value);
    },
    [],
  );

  const filteredMembers = !search
    ? members
    : members?.filter((member) => {
        const {item} = member as unknown as {
          item: {
            value: {source: string; destination: string; permanent: boolean};
          };
        };

        return item?.value ? matchesSearch(item.value, search) : false;
      });

  const totalMembers = members?.length || 0;
  const filteredCount = filteredMembers?.length || 0;
  const isFiltered = search.length > 0;

  return (
    <div style={{display: "grid", gap: 8}}>
      <div style={{display: "flex", flexDirection: "column", gap: 4}}>
        <TextInput
          onChange={handleSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
          type="text"
          value={search}
        />
        {isFiltered && (
          <div style={{fontSize: 12, color: "#666"}}>
            {filteredCount === 0
              ? "No redirects match your search"
              : `Showing ${filteredCount} of ${totalMembers} redirect${totalMembers === 1 ? "" : "s"}`}
          </div>
        )}
      </div>
      {props.renderDefault({...props, members: filteredMembers})}
    </div>
  );
}
