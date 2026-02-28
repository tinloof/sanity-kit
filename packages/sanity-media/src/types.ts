export type ImageTransformerOptions = {
	width: number;
	height?: number;
	fit?: "cover" | "contain" | "scale-down";
	quality?: number;
};

export interface MediaStoragePluginConfig {
	allowedTypes?: string[];
	uploadPrefix?: string;
}

/**
 * media.image value structure
 * alt and caption can be set here to override the defaults from the asset document
 */
export interface MediaImageValue {
	_type: "media.image";
	asset: {
		_type: "reference";
		_ref: string;
	};
	/** Overrides asset.alt if set */
	alt?: string;
	/** Overrides asset.caption if set */
	caption?: string;
	crop?: {
		_type: "sanity.imageCrop";
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	hotspot?: {
		_type: "sanity.imageHotspot";
		x: number;
		y: number;
		height: number;
		width: number;
	};
}

/**
 * media.file value structure
 * title and description can be set here to override the defaults from the asset document
 */
export interface MediaFileValue {
	_type: "media.file";
	asset: {
		_type: "reference";
		_ref: string;
	};
	/** Overrides asset.title if set */
	title?: string;
	/** Overrides asset.description if set */
	description?: string;
}

/**
 * media.video value structure
 * title and description can be set here to override the defaults from the asset document
 */
export interface MediaVideoValue {
	_type: "media.video";
	asset: {
		_type: "reference";
		_ref: string;
	};
	/** Overrides asset.title if set */
	title?: string;
	/** Overrides asset.description if set */
	description?: string;
}
