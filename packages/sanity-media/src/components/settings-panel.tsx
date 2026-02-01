import { ArrowLeftIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { useSecrets } from "@sanity/studio-secrets";
import { useCallback, useEffect, useState } from "react";
import type { StorageAdapter } from "../adapters";
import { validateCredentials } from "../storage-client";

const SECRETS_NAMESPACE = "media-storage";

interface SettingsPanelProps {
  adapter: StorageAdapter;
  /** Callback to go back to media panel */
  onBack?: () => void;
}

export function SettingsPanel({ adapter, onBack }: SettingsPanelProps) {
  const { secrets, loading, storeSecrets } =
    useSecrets<Record<string, string>>(SECRETS_NAMESPACE);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Load secrets when they become available
  useEffect(() => {
    if (secrets) {
      setValues(secrets);
    }
  }, [secrets]);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setTestSuccess(false);
  }, []);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setError(null);
    setSuccess(false);
    setTestSuccess(false);

    try {
      const credentials = adapter.toCredentials(values);
      const isValid = await validateCredentials(credentials);

      if (!isValid) {
        throw new Error("Connection failed. Please check your credentials.");
      }

      setTestSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
    } finally {
      setTesting(false);
    }
  }, [adapter, values]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const credentials = adapter.toCredentials(values);
      const isValid = await validateCredentials(credentials);

      if (!isValid) {
        throw new Error(
          "Invalid credentials. Please check your configuration.",
        );
      }

      storeSecrets(values);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save credentials",
      );
    } finally {
      setSaving(false);
    }
  }, [adapter, values, storeSecrets]);

  if (loading) {
    return (
      <Box paddingY={5}>
        <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
          <Spinner />
        </Flex>
      </Box>
    );
  }

  return (
    <Box paddingY={5}>
      <Stack space={5}>
        <Box paddingX={4}>
          <Flex justify="space-between" align="flex-start">
            <Stack space={2}>
              <Text size={3} weight="bold">
                Storage Configuration
              </Text>
              <Text size={1} muted>
                Configure your {adapter.name} credentials to enable media uploads
              </Text>
            </Stack>
            {onBack && (
              <Button
                icon={ArrowLeftIcon}
                text="Back to Media"
                mode="ghost"
                onClick={onBack}
                fontSize={1}
                padding={3}
              />
            )}
          </Flex>
        </Box>

        <Box paddingX={4}>
          <Card padding={5} radius={2} border>
            <Stack space={5}>
              <Stack space={3}>
                <Text size={2} weight="semibold">
                  {adapter.name}
                </Text>
                {adapter.description && (
                  <Text size={1} muted>
                    {adapter.description}
                  </Text>
                )}
              </Stack>

              <Stack space={4}>
                {adapter.fields.map((field) => (
                  <Stack key={field.key} space={3}>
                    <Stack space={2}>
                      <Text size={1} weight="semibold">
                        {field.label}
                        {field.required && (
                          <span
                            style={{
                              color: "var(--card-badge-critical-fg-color)",
                            }}
                          >
                            {" "}
                            *
                          </span>
                        )}
                      </Text>
                      {field.description && (
                        <Text size={1} muted>
                          {field.description}
                        </Text>
                      )}
                    </Stack>
                    <TextInput
                      type={field.type === "password" ? "password" : "text"}
                      value={values[field.key] || ""}
                      onChange={(e) =>
                        handleChange(field.key, e.currentTarget.value)
                      }
                      placeholder={field.placeholder}
                      fontSize={1}
                      padding={3}
                    />
                  </Stack>
                ))}
              </Stack>

              {error && (
                <Card padding={4} tone="critical" radius={2}>
                  <Text size={1}>{error}</Text>
                </Card>
              )}

              {success && (
                <Card padding={4} tone="positive" radius={2}>
                  <Text size={1}>Credentials saved successfully!</Text>
                </Card>
              )}

              {testSuccess && (
                <Card padding={4} tone="positive" radius={2}>
                  <Text size={1}>Connection test successful! ✓</Text>
                </Card>
              )}

              <Flex justify="flex-end" gap={3}>
                <Button
                  text={testing ? "Testing..." : "Test Connection"}
                  tone="default"
                  onClick={handleTest}
                  disabled={testing || saving}
                  fontSize={1}
                  padding={3}
                />
                <Button
                  text={saving ? "Saving..." : "Save Configuration"}
                  tone="primary"
                  onClick={handleSave}
                  disabled={saving || testing}
                  fontSize={1}
                  padding={3}
                />
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
