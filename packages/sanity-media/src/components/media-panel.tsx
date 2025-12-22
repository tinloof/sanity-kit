import { AddIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
} from "@sanity/ui";
import { useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import type { StorageAdapter } from "../adapters";
import { useCredentials } from "../hooks/use-credentials";
import { handleImageUpload, handleVideoUpload } from "../upload-handler";

interface MediaPanelProps {
  adapter: StorageAdapter;
}

interface ImageAsset {
  _id: string;
  _type: string;
  url: string;
  originalFilename?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface VideoAsset {
  _id: string;
  _type: string;
  url: string;
  originalFilename?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
  };
  thumbnail?: {
    url: string;
  };
}

export function MediaPanel({ adapter }: MediaPanelProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const { credentials, loading: credentialsLoading } = useCredentials(adapter);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const query = `*[_type == "${adapter.typePrefix}.imageAsset"] | order(_createdAt desc)`;
      const result = await client.fetch<ImageAsset[]>(query);
      setImages(result);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const query = `*[_type == "${adapter.typePrefix}.videoAsset"] | order(_createdAt desc) {
        _id,
        _type,
        url,
        originalFilename,
        metadata,
        thumbnail->{url}
      }`;
      const result = await client.fetch<VideoAsset[]>(query);
      setVideos(result);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  };

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      await Promise.all([fetchImages(), fetchVideos()]);
      setLoading(false);
    };
    fetchMedia();
  }, [adapter.typePrefix, client]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !credentials) return;

    setUploading(true);
    try {
      if (activeTab === "images") {
        await handleImageUpload(file, adapter, credentials, client);
        await fetchImages();
      } else {
        await handleVideoUpload(file, adapter, credentials, client);
        await fetchVideos();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        `Failed to upload ${activeTab === "images" ? "image" : "video"}. Please try again.`,
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading || credentialsLoading) {
    return (
      <Box padding={4}>
        <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
          <Spinner />
        </Flex>
      </Box>
    );
  }

  if (!credentials) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} shadow={1} tone="caution">
          <Text align="center">
            Please configure your storage credentials in the Settings tab first.
          </Text>
        </Card>
      </Box>
    );
  }

  const currentItems = activeTab === "images" ? images : videos;
  const itemType = activeTab === "images" ? "image" : "video";
  const acceptType = activeTab === "images" ? "image/*" : "video/*";

  return (
    <Box paddingY={5}>
      <Stack space={5}>
        <Box paddingX={4}>
          <TabList space={1}>
            <Tab
              aria-controls="images-content"
              id="images-tab"
              label="Images"
              selected={activeTab === "images"}
              onClick={() => setActiveTab("images")}
              fontSize={1}
              padding={3}
            />
            <Tab
              aria-controls="videos-content"
              id="videos-tab"
              label="Videos"
              selected={activeTab === "videos"}
              onClick={() => setActiveTab("videos")}
              fontSize={1}
              padding={3}
            />
          </TabList>
        </Box>

        <Flex justify="space-between" align="center" paddingX={4}>
          <Stack space={2}>
            <Text size={3} weight="bold">
              {activeTab === "images" ? "Images" : "Videos"}
            </Text>
            <Text size={1} muted>
              {currentItems.length}{" "}
              {currentItems.length === 1 ? itemType : `${itemType}s`} uploaded
            </Text>
          </Stack>
          <Button
            icon={AddIcon}
            text={`Upload ${activeTab === "images" ? "Image" : "Video"}`}
            tone="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            loading={uploading}
            fontSize={1}
            padding={3}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptType}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </Flex>

        <Box paddingX={4}>
          <TabPanel
            aria-labelledby="images-tab"
            id="images-content"
            hidden={activeTab !== "images"}
          >
            {images.length === 0 ? (
              <Card padding={5} radius={2} tone="transparent" border>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  style={{ minHeight: "300px" }}
                >
                  <Stack
                    space={3}
                    style={{ textAlign: "center", maxWidth: "320px" }}
                  >
                    <Text size={2} weight="semibold">
                      No images yet
                    </Text>
                    <Text size={1} muted>
                      Upload your first image to get started with your media
                      library.
                    </Text>
                    <Button
                      icon={AddIcon}
                      text="Upload Image"
                      tone="primary"
                      onClick={() => fileInputRef.current?.click()}
                      fontSize={1}
                      padding={3}
                    />
                  </Stack>
                </Flex>
              </Card>
            ) : (
              <Grid columns={[3, 4, 5, 6]} gap={3}>
                {images.map((image) => (
                  <Card
                    key={image._id}
                    radius={2}
                    shadow={1}
                    style={{
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    tone="default"
                  >
                    <Stack space={0}>
                      <Box
                        style={{
                          aspectRatio: "1",
                          overflow: "hidden",
                          background: "var(--card-bg-color)",
                          position: "relative",
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.originalFilename || "Uploaded image"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <Box
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            background: "rgba(0, 0, 0, 0.7)",
                            borderRadius: "4px",
                            padding: "2px 6px",
                          }}
                        >
                          <Text size={0} style={{ color: "white" }}>
                            {image.metadata?.dimensions
                              ? `${image.metadata.dimensions.width}×${image.metadata.dimensions.height}`
                              : "Image"}
                          </Text>
                        </Box>
                      </Box>
                      <Box padding={2}>
                        <Text
                          size={0}
                          weight="medium"
                          style={{
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {image.originalFilename || "Untitled"}
                        </Text>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel
            aria-labelledby="videos-tab"
            id="videos-content"
            hidden={activeTab !== "videos"}
          >
            {videos.length === 0 ? (
              <Card padding={5} radius={2} tone="transparent" border>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  style={{ minHeight: "300px" }}
                >
                  <Stack
                    space={3}
                    style={{ textAlign: "center", maxWidth: "320px" }}
                  >
                    <Text size={2} weight="semibold">
                      No videos yet
                    </Text>
                    <Text size={1} muted>
                      Upload your first video to get started with your media
                      library.
                    </Text>
                    <Button
                      icon={AddIcon}
                      text="Upload Video"
                      tone="primary"
                      onClick={() => fileInputRef.current?.click()}
                      fontSize={1}
                      padding={3}
                    />
                  </Stack>
                </Flex>
              </Card>
            ) : (
              <Grid columns={[3, 4, 5, 6]} gap={3}>
                {videos.map((video) => (
                  <Card
                    key={video._id}
                    radius={2}
                    shadow={1}
                    style={{
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    tone="default"
                  >
                    <Stack space={0}>
                      <Box
                        style={{
                          aspectRatio: "16/9",
                          overflow: "hidden",
                          background: "#000",
                          position: "relative",
                        }}
                      >
                        {video.thumbnail?.url ? (
                          <img
                            src={video.thumbnail.url}
                            alt={video.originalFilename || "Video thumbnail"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            style={{ width: "100%", height: "100%" }}
                          >
                            <Text muted size={1}>
                              No thumbnail
                            </Text>
                          </Flex>
                        )}
                        <Box
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            background: "rgba(0, 0, 0, 0.7)",
                            borderRadius: "4px",
                            padding: "2px 6px",
                          }}
                        >
                          <Text size={0} style={{ color: "white" }}>
                            {video.metadata?.duration
                              ? formatDuration(video.metadata.duration)
                              : "Video"}
                          </Text>
                        </Box>
                      </Box>
                      <Box padding={2}>
                        <Text
                          size={0}
                          weight="medium"
                          style={{
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {video.originalFilename || "Untitled"}
                        </Text>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Box>
      </Stack>
    </Box>
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
