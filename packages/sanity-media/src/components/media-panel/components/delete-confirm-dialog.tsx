import { TrashIcon } from "@sanity/icons";
import { Box, Button, Dialog, Flex, Stack, Text } from "@sanity/ui";

export interface DeleteConfirmDialogProps {
  open: boolean;
  target: "single" | "bulk" | null;
  singleAssetName?: string;
  bulkCount?: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  target,
  singleAssetName,
  bulkCount = 0,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  const message =
    target === "single"
      ? `Are you sure you want to delete "${singleAssetName || "this asset"}"?`
      : `Are you sure you want to delete ${bulkCount} selected item${bulkCount > 1 ? "s" : ""}?`;

  const isBulk = target === "bulk" && bulkCount > 1;

  return (
    <Dialog
      id="delete-dialog"
      header={isBulk ? "Delete assets" : "Delete asset"}
      onClose={onCancel}
      zOffset={1000}
      width={1}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text>{message}</Text>
          <Text size={1} muted>
            This action cannot be undone.
          </Text>
          <Flex gap={2} justify="flex-end">
            <Button
              text="Cancel"
              mode="ghost"
              onClick={onCancel}
              fontSize={1}
              padding={3}
            />
            <Button
              icon={TrashIcon}
              text={isDeleting ? "Deleting..." : "Delete"}
              tone="critical"
              onClick={onConfirm}
              disabled={isDeleting}
              fontSize={1}
              padding={3}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  );
}
