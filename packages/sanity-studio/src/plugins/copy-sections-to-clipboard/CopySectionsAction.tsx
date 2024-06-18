import { CopyIcon } from "@sanity/icons";
import { Button } from "@sanity/ui";
import React from "react";
import { DocumentActionComponent, useDocumentValues } from "sanity";

export const CopySectionsAction: DocumentActionComponent = (props) => {
  const docValues = useDocumentValues(props.id, ["sectionsBody"]);
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  if (docValues.error || docValues.isLoading || !docValues.value) {
    return null;
  }

  if (!("sectionsBody" in docValues.value)) {
    return null;
  }

  const sections = docValues.value.sectionsBody as Array<{
    _key: string;
    _type: string;
  }>;

  if (sections.length === 0) {
    return null;
  }

  return {
    label: "Copy sections",
    onHandle: () => {
      setDialogOpen(true);
    },
    icon: CopyIcon,
    dialog: isDialogOpen && {
      type: "dialog",
      onClose: () => setDialogOpen(false),
      header: "Copy sections to clipboard",
      content: sections.map((section) => (
        <div key={section._key}>{section._type}</div>
      )),
      footer: <Button>Copy to clipboard</Button>,
    },
  };
};
