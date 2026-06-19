// @ts-nocheck — vendored, loosely-typed glue around `@wordpress/rich-text`
// private APIs (formerly the untyped `@wordpress/rich-text-control` package).
export default ( props ) => ( element ) => {
	const { keyboardShortcuts } = props.current;
	function onKeyDown( event ) {
		for ( const keyboardShortcut of keyboardShortcuts.current ) {
			keyboardShortcut( event );
		}
	}

	element.addEventListener( 'keydown', onKeyDown );
	return () => {
		element.removeEventListener( 'keydown', onKeyDown );
	};
};
