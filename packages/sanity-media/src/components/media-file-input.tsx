import {
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { useCallback, useRef, useState } from "react";
import { set, unset, type ObjectInputProps, useClient } from "sanity";
import { API_VERSION } from "../constants";
import { useAdapter } from "../context/adapter-context";
import { handleFileUpload } from "../upload-handler";
import { formatFileSize } from "../utils";

export function MediaFileInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const { adapter, credentials, loading: credentialsLoading } = useAdapter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [assetPreview, setAssetPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAsset = useCallback(async () => {
    if (value?.asset?._ref) {
      try {
        const asset = await client.getDocument(value.asset._ref);
        setAssetPreview(asset);
      } catch (err) {
        console.error("Failed to load asset:", err);
      }
    }
  }, [value?.asset?._ref, client]);

  useState(() => {
    loadAsset();
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !credentials) return;

      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const assetRef = await handleFileUpload(
          file,
          adapter,
          credentials,
          client,
          (pct) => setProgress(pct),
        );

        onChange(set({ ...value, asset: assetRef }));
        await loadAsset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [credentials, adapter, client, onChange, value, loadAsset],
  );

  const handleRemove = useCallback(() => {
    onChange(unset());
    setAssetPreview(null);
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!credentials) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        const event = {
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event);
      }
    },
    [credentials, handleFileSelect],
  );

  if (credentialsLoading) {
    return (
      <Card padding={4}>
        <Flex justify="center" align="center">
          <Spinner />
        </Flex>
      </Card>
    );
  }

  if (!credentials) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Stack space={2}>
          <Text size={2} weight="semibold">
            Storage Not Configured
          </Text>
          <Text size={1} muted>
            Configure storage credentials in Sanity to enable uploads.
          </Text>
        </Stack>
      </Card>
    );
  }

  if (value?.asset?._ref && assetPreview) {
    return (
      <Stack space={3}>
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={2}>
            <Text size={1} weight="medium">
              {assetPreview.originalFilename}
            </Text>
            <Text size={0} muted>
              {assetPreview.mimeType} • {formatFileSize(assetPreview.size)}
            </Text>
          </Stack>
        </Card>

        <TextInput
          value={value.title || ""}
          onChange={(e) => onChange(set(e.currentTarget.value, ["title"]))}
          placeholder="Title"
        />

        <Button
          text="Remove"
          tone="critical"
          mode="ghost"
          onClick={handleRemove}
        />
      </Stack>
    );
  }

  return (
    <Stack space={3}>
      <Card
        padding={5}
        radius={2}
        shadow={1}
        style={{
          border: "2px dashed var(--card-border-color)",
          cursor: "pointer",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Flex direction="column" align="center" gap={3}>
          <Text size={4}>📄</Text>
          <Text size={1} weight="medium">
            Click or drag file to upload
          </Text>
          <Text size={0} muted>
            All file types supported
          </Text>
        </Flex>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && (
        <Card padding={3}>
          <Stack space={2}>
            <Flex align="center" gap={2}>
              <Spinner />
              <Text size={1}>Uploading... {progress}%</Text>
            </Flex>
            <div
              style={{
                height: 4,
                backgroundColor: "var(--card-border-color)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "var(--card-focus-ring-color)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </Stack>
        </Card>
      )}

      {error && (
        <Card padding={3} tone="critical" radius={2}>
          <Text>{error}</Text>
        </Card>
      )}
    </Stack>
  );
}

