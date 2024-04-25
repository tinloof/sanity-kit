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
          const memberValue = JSON.stringify(member.item.value).toLowerCase();
          return memberValue.includes(search.toLowerCase());
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
