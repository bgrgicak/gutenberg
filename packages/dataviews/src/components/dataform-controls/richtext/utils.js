// @ts-nocheck — vendored, loosely-typed glue around `@wordpress/rich-text`
// private APIs (formerly the untyped `@wordpress/rich-text-control` package).
export function getAllowedFormats( { allowedFormats, disableFormats } ) {
	if ( disableFormats ) {
		return getAllowedFormats.EMPTY_ARRAY;
	}

	return allowedFormats;
}

getAllowedFormats.EMPTY_ARRAY = [];
