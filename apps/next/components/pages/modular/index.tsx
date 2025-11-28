import type {PagePayload} from "@/types";
import Sections from "@/components/sections";

export interface PageProps {
  data: PagePayload | null;
}

export function Page({data}: PageProps) {
  const {sectionsBody} = data ?? {};

  return <Sections sectionsData={sectionsBody} />;
}
