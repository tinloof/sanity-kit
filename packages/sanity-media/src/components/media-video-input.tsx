import { TrashIcon, UploadIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useRef, useState } from "react";
import { type ObjectInputProps, set, unset, useClient } from "sanity";
import { useAdapter } from "../context/adapter-context";
import { handleVideoUpload } from "../upload-handler";

export function MediaVideoInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const { adapter, credentials, loading } = useAdapter();
  const client = useClient({ apiVersion: "2024-01-01" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const assetRef = value?.asset?._ref;
  const [assetData, setAssetData] = useState<any>(null);
  const [fetchingAsset, setFetchingAsset] = useState(false);

  const fetchAsset = useCallback(async () => {
    if (!assetRef) return;
    setFetchingAsset(true);
    try {
      const asset = await client.getDocument(assetRef);
      setAssetData(asset);
    } catch (error) {
      console.error("Failed to fetch asset:", error);
    } finally {
      setFetchingAsset(false);
    }
  }, [assetRef, client]);

  useState(() => {
    if (assetRef) {
      fetchAsset();
    }
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !credentials) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const assetRef = await handleVideoUpload(
        file,
        adapter,
        credentials,
        client,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      onChange([
        set(assetRef, ["asset"]),
        set(file.name.replace(/\.[^/.]+$/, ""), ["title"]),
      ]);

      setTimeout(() => {
        fetchAsset();
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(unset());
    setAssetData(null);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(set(event.target.value, ["title"]));
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChange(set(event.target.value, ["description"]));
  };

  if (loading || fetchingAsset) {
    return (
      <Card padding={4}>
        <Text muted>Loading...</Text>
      </Card>
    );
  }

  if (!credentials) {
    return (
      <Card padding={4} tone="caution">
        <Text>Please configure storage credentials in the Media tool.</Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      {assetData ? (
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={3}>
            {/* Video preview with thumbnail */}
            {assetData.thumbnail && (
              <Box
                style={{
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: "4px",
                  background: "#000",
                  position: "relative",
                }}
              >
                <video
                  src={assetData.url}
                  poster={assetData.thumbnail.url}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            {/* Video info */}
            <Stack space={2}>
              <Text size={1} weight="semibold">
                {assetData.originalFilename}
              </Text>
              {assetData.metadata?.dimensions && (
                <Text size={0} muted>
                  {assetData.metadata.dimensions.width} ×{" "}
                  {assetData.metadata.dimensions.height}
                  {assetData.metadata.duration &&
                    ` · ${formatDuration(assetData.metadata.duration)}`}
                </Text>
              )}
            </Stack>

            {/* Remove button */}
            <Button
              icon={TrashIcon}
              text="Remove"
              tone="critical"
              mode="ghost"
              onClick={handleRemove}
            />
          </Stack>
        </Card>
      ) : (
        <Card padding={4} radius={2} shadow={1} tone="transparent">
          <Flex direction="column" align="center" justify="center" gap={3}>
            <UploadIcon style={{ fontSize: "2em", opacity: 0.5 }} />
            <Stack space={2}>
              <Text align="center" weight="semibold">
                Upload Video
              </Text>
              <Button
                text={
                  uploading ? `Uploading... ${uploadProgress}%` : "Choose File"
                }
                tone="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                loading={uploading}
              />
            </Stack>
          </Flex>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </Card>
      )}

      {/* Title and Description fields */}
      {assetData && (
        <Stack space={3}>
          <TextInput
            placeholder="Title"
            value={value?.title || ""}
            onChange={handleTitleChange}
          />
          <textarea
            placeholder="Description"
            value={value?.description || ""}
            onChange={handleDescriptionChange}
            rows={3}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              fontFamily: "inherit",
              fontSize: "inherit",
              resize: "vertical",
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
