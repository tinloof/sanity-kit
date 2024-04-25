import type { ImageUrlBuilder, ImageCrop, ImageHotspot } from "sanity";

import { getImageDimensions } from "@sanity/asset-utils";
import imageUrlBuilder from "@sanity/image-url";
import React from "react";

export type SanityImageProps = {
  /** The aspect ratio of the image, in the format of `width/height`.
   *
   * @example
   * ```
   * <SanityImage data={image} aspectRatio="4/5" />
   * ```
   */
  aspectRatio?: string;
  config: {
    dataset: string;
    projectId: string;
  };
  className?: string;
  data: {
    _type: "image";
    alt?: string;
    asset?: {
      _ref: string;
      _type: "reference";
    };
    crop?: ImageCrop;
    hotspot?: ImageHotspot;
  } | null;
} & React.ComponentPropsWithRef<"img">;

const SanityImage = React.forwardRef<HTMLImageElement, SanityImageProps>(
  (
    { aspectRatio, className, data, style, config, ...passthroughProps },
    ref
  ) => {
    if (!data || !data.asset || !config) {
      return null;
    }

    const _ref = data.asset._ref;
    const { height, width } = getImageDimensions(_ref);
    const aspectRatioValues = aspectRatio?.split("/");

    if (aspectRatio && aspectRatioValues?.length !== 2) {
      console.warn(
        `Invalid aspect ratio: ${aspectRatio}. Using the original aspect ratio. The aspect ratio should be in the format "width/height".`
      );
    }

    const aspectRatioWidth = aspectRatioValues
      ? parseFloat(aspectRatioValues[0])
      : undefined;
    const aspectRatioHeight = aspectRatioValues
      ? parseFloat(aspectRatioValues[1])
      : undefined;

    const urlBuilder = imageUrlBuilder({
      dataset: config.dataset,
      projectId: config.projectId,
    })
      .image({
        _ref,
        crop: data.crop,
        hotspot: data.hotspot,
      })
      .auto("format");

    // Values used for srcset attribute of image tag (in pixels)
    const srcSetValues = [
      50, 100, 200, 450, 600, 750, 900, 1000, 1250, 1500, 1750, 2000, 2500,
      3000, 3500, 4000, 5000,
    ];

    const urlDefault = generateImageUrl({
      aspectRatioHeight,
      aspectRatioWidth,
      urlBuilder,
      width,
    });

    // Create srcset attribute
    const srcSet = srcSetValues
      .filter((value) => value < width)
      .map((value) => {
        const imageUrl = generateImageUrl({
          aspectRatioHeight,
          aspectRatioWidth,
          urlBuilder,
          width: value,
        });
        if (width >= value) {
          return `${imageUrl} ${value}w`;
        }
        return "";
      })
      .join(", ")
      .concat(`, ${urlDefault} ${width}w`);

    // Blurry bg image used as LQIP (Low Quality Image Placeholder)
    // while high quality image is loading.
    const blurDataUrl = generateImageUrl({
      aspectRatioHeight,
      aspectRatioWidth,
      blur: 10,
      urlBuilder,
      width: 30,
    });

    const LQIP = {
      background: `url(${blurDataUrl})`,
      backgroundPositionX: `var(--focalX)`,
      backgroundPositionY: `var(--focalY)`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    } as React.CSSProperties;

    const focalCoords = data.hotspot?.x &&
      data.hotspot?.y && {
        x: Math.ceil(data.hotspot.x * 100),
        y: Math.ceil(data.hotspot.y * 100),
      };

    const focalProperties =
      focalCoords &&
      ({
        "--focalX": focalCoords?.x + "%",
        "--focalY": focalCoords?.y + "%",
        objectPosition: `var(--focalX) var(--focalY)`,
      } as React.CSSProperties);

    return (
      <img
        alt={data.alt || ""}
        className={className}
        height={aspectRatioHeight ? aspectRatioHeight * 100 : height}
        ref={ref}
        src={urlDefault}
        srcSet={srcSet}
        style={
          {
            ...style,
            ...focalProperties,
            ...LQIP,
            aspectRatio: `${aspectRatioWidth || width}/${
              aspectRatioHeight || height
            }`,
            height: "100%",
            width: "100%",
          } as React.CSSProperties
        }
        width={aspectRatioWidth ? aspectRatioWidth * 100 : width}
        {...passthroughProps}
      />
    );
  }
);

SanityImage.displayName = "SanityImage";

export { SanityImage };

function generateImageUrl(args: {
  aspectRatioHeight?: number;
  aspectRatioWidth?: number;
  blur?: number;
  urlBuilder: ImageUrlBuilder;
  width: number;
}) {
  const {
    aspectRatioHeight,
    aspectRatioWidth,
    blur = 0,
    urlBuilder,
    width,
  } = args;
  let imageUrl = urlBuilder.width(width);
  const imageHeight =
    aspectRatioHeight && aspectRatioWidth
      ? Math.round((width / aspectRatioWidth) * aspectRatioHeight)
      : undefined;

  if (imageHeight) {
    imageUrl = imageUrl.height(imageHeight);
  }

  if (blur && blur > 0) {
    imageUrl = imageUrl.blur(blur);
  }

  return imageUrl.url();
}
