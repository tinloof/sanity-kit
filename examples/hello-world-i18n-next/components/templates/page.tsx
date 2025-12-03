import {notFound} from "next/navigation";

import type {
  HOME_QUERYResult,
  PAGE_QUERYResult,
} from "@examples/hello-world-i18n-studio/types";
import {SectionsRenderer} from "../sections";

export default function PageTemplate({
  data,
}: {
  data: HOME_QUERYResult | PAGE_QUERYResult;
}) {
  if (data?._type !== "modular.page" && data?._type !== "home")
    return notFound();

  const {sections} = data;

  return (
    <SectionsRenderer fieldName="sections" sectionsData={sections ?? []} />
  );
}
