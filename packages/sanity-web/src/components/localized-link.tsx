"use client";

import type {LinkProps} from "next/link";

import React from "react";

import DynamicLink from "./dynamic-link";
import {useLocale} from "../hooks";
import {localizePathname, isExternalUrl} from "../utils";
import {i18nConfig} from "../types";

export type LocalizedLinkProps = Omit<LinkProps, "href"> & {
  children: React.ReactNode;
  className?: string;
  href: string;
  i18n?: i18nConfig;
};

export function LocalizedLink({...props}: LocalizedLinkProps) {
  const {href, i18n, ...rest} = props;

  const {locale} = useLocale(i18n);

  // Check if the href is an external URL
  const isExternalLink = isExternalUrl(href);

  // Check if the href is a relative path or has a hash link
  const isRelativeOrHashLink = !href.startsWith("/") || href.startsWith("#");

  // Check if already localized
  const isAlreadyLocalized = i18n.locales.some((loc) =>
    href.startsWith(`/${loc.id}/`),
  );

  // Only localize the pathname if it matches one of the above conditions
  const shouldLocalize =
    !isExternalLink && !isRelativeOrHashLink && !isAlreadyLocalized;

  const localizedPathname = shouldLocalize
    ? localizePathname({
        pathname: href,
        localeId: locale.id,
        isDefault: locale.id === i18n.defaultLocaleId,
      })
    : href;

  return <DynamicLink {...rest} href={localizedPathname} />;
}

export function createLocalizedLink(i18n: i18nConfig) {
  return function LocalizedLinkWrapper(
    props: Omit<LocalizedLinkProps, "i18n">,
  ) {
    return <LocalizedLink {...props} i18n={i18n} />;
  };
}
