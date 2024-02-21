import { Box, Select } from "@sanity/ui";
import React from "react";

import { LocaleProps } from "../../../types";
import { useNavigator } from "../context";

const LocaleSelect = (props: LocaleProps) => {
  const { locale, setLocale } = useNavigator();

  const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (setLocale) {
      setLocale(event.currentTarget.value);
    }
  };

  return (
    <Box ref={props.domRef} paddingBottom={1} paddingX={1}>
      <Select
        fontSize={1}
        padding={3}
        radius={2}
        onChange={handleLocaleChange}
        value={locale}
      >
        {props.locales.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.title}
          </option>
        ))}
      </Select>
    </Box>
  );
};

LocaleSelect.displayName = "LocaleSelect";

export default LocaleSelect;
