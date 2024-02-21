import { createContext } from "react";

export type OnItemAdd = (itemValue: any) => void;

export const SectionsContext = createContext<{
  openSectionPicker: (onAdd?: OnItemAdd) => void;
}>({
  openSectionPicker: () => {},
});
