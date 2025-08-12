"use client";

import {useIsPresentationTool} from "next-sanity/hooks";
import {useRouter} from "next/navigation";
import React, {useTransition} from "react";

export type ExitPreviewProps = {
  disableDraftMode: () => Promise<void>;
};

export function ExitPreview({disableDraftMode}: ExitPreviewProps) {
  const isPresentationTool = useIsPresentationTool();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isPresentationTool === true) return null;

  const handleDisableDraftMode = async () => {
    await disableDraftMode();
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        zIndex: 50,
        transform: "translateX(-50%)",
      }}
    >
      <button
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "8px 16px",
          borderRadius: "16px",
        }}
        disabled={pending}
        onClick={handleDisableDraftMode}
      >
        {pending ? "Disabling..." : "Disable draft mode"}
      </button>
    </div>
  );
}
