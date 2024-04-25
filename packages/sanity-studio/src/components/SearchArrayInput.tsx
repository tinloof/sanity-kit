import { TextInput } from "@sanity/ui";
import React from "react";
import type { ArrayOfObjectsInputProps } from "sanity";

export function SearchArrayInput({
  members,
  ...props
}: ArrayOfObjectsInputProps): JSX.Element {
  const [search, setSearch] = React.useState("");

  const filteredMembers = !search
    ? members
    : members?.filter((member) => {
        if (member.kind === "item") {
          if (member.open) {
            return true;
          }

          const itemValues = getAllValues(member.item.value);
          return itemValues
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase());
        }
        return false;
      });

  const handleChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setSearch(e.currentTarget.value);
    },
    [setSearch]
  );

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TextInput
        onChange={handleChange}
        placeholder="Filter by source or destination"
        type="text"
        value={search}
      />
      {props.renderDefault({ ...props, members: filteredMembers })}
    </div>
  );
}
/**
 * Recursively get all values from an object
 */
function getAllValues<
  T extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
>(obj: T): T[keyof T][] {
  const values: T[keyof T][] = [];
  Object.values(obj).forEach((value) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      values.push(...getAllValues(value));
    } else {
      values.push(value);
    }
  });
  return values;
}
