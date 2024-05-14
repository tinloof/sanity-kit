/**
 * Provides the context needed for usePrefixLogic.
 * Adapted from: https://github.com/sanity-io/sanity/blob/next/packages/sanity/src/core/form/inputs/Slug/utils/useSlugContext.ts
 */

import { useMemo } from 'react'
import {
  useCurrentUser,
  useDataset,
  useProjectId,
  useSchema,
  SlugSourceContext,
  useClient,
} from 'sanity';

export type SlugContext = Omit<SlugSourceContext, 'parent' | 'parentPath'>

export function usePathnameContext(): SlugContext {
  const client = useClient({apiVersion: '2024-05-14'})
  const schema = useSchema()
  const currentUser = useCurrentUser()
  const projectId = useProjectId()
  const dataset = useDataset()

  return useMemo(() => {
    return {
      getClient: () => client,
      projectId,
      dataset,
      schema,
      currentUser,
    }
  }, [client, schema, currentUser, projectId, dataset])
}
