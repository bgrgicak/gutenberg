/**
 * Shared utilities for waveform audio player functionality.
 * Used by both the WaveformPlayer component (editor) and view.js (frontend).
 */

/**
 * External dependencies
 */
import { colord } from 'colord';
import WaveformPlayerLib from '@arraypress/waveform-player';

/**
 * Configuration constants.
 * Note: DEFAULT_WAVEFORM_HEIGHT should match $waveform-player-height in style.scss.
 */
const DEFAULT_WAVEFORM_HEIGHT = 100;
const DEFAULT_WAVEFORM_BACKGROUND_COLOR = '#ffffff';

/**
 * Get computed style for an element, using ownerDocument for iframe compatibility.
 *
 * @param {Element} element - The element to get styles from.
 * @return {CSSStyleDeclaration} The computed style.
 */
function getComputedStyle( element ) {
	return element.ownerDocument.defaultView.getComputedStyle( element );
}

/**
 * Get all colors needed for the waveform player based on the element's styles.
 *
 * @param {Element} element - The element to derive colors from.
 * @return {Object} Object containing textColor, buttonColor, iconColor, waveformColor, progressColor, backgroundColor.
 */
export function getWaveformColors( element ) {
	const textColor = getComputedStyle( element ).color;
	const buttonColor = textColor;
	const iconColor = colord( buttonColor ).isDark() ? '#ffffff' : '#000000';
	const waveformColor = colord( textColor ).alpha( 0.3 ).toRgbString();
	const progressColor = colord( textColor ).alpha( 0.6 ).toRgbString();
	let backgroundColor = getComputedStyle( element ).backgroundColor;
	let backgroundNode = element.parentElement;

	while (
		colord( backgroundColor ).alpha() === 0 &&
		backgroundNode instanceof element.ownerDocument.defaultView.Element
	) {
		backgroundColor = getComputedStyle( backgroundNode ).backgroundColor;
		backgroundNode = backgroundNode.parentElement;
	}

	if ( colord( backgroundColor ).alpha() === 0 ) {
		backgroundColor = DEFAULT_WAVEFORM_BACKGROUND_COLOR;
	}

	return {
		textColor,
		buttonColor,
		waveformColor,
		progressColor,
		backgroundColor,
		iconColor,
	};
}

/**
 * Create a waveform container element with the specified attributes.
 *
 * @param {Object} options                 - The options for the container.
 * @param {string} options.url             - The audio URL.
 * @param {string} options.title           - The track title.
 * @param {string} options.artist          - The track artist.
 * @param {string} options.artwork         - The album artwork URL.
 * @param {string} options.waveformColor   - The waveform bar color.
 * @param {string} options.progressColor   - The progress indicator color.
 * @param {string} options.buttonColor     - The play button color.
 * @param {string} options.textColor       - The primary text color.
 * @param {string} options.iconColor       - The play/pause icon color.
 * @param {string} options.backgroundColor - The waveform background color.
 * @param {number} options.height          - The waveform height in pixels.
 * @param {string} options.waveformStyle   - The visualization style (bars, mirror, line, blocks, dots, seekbar).
 * @return {Element} The configured container element.
 */
export function createWaveformContainer( {
	url,
	title,
	artist,
	artwork,
	waveformColor,
	progressColor,
	buttonColor,
	textColor,
	iconColor,
	backgroundColor = DEFAULT_WAVEFORM_BACKGROUND_COLOR,
	height = DEFAULT_WAVEFORM_HEIGHT,
	waveformStyle = 'bars',
} ) {
	const container = document.createElement( 'div' );
	container.setAttribute( 'data-waveform-player', '' );
	container.setAttribute( 'data-url', url );
	container.setAttribute( 'data-height', String( height ) );
	container.setAttribute( 'data-waveform-style', waveformStyle );
	container.setAttribute( 'data-waveform-color', waveformColor );
	container.setAttribute( 'data-progress-color', progressColor );
	container.setAttribute( 'data-button-color', buttonColor );
	container.setAttribute( 'data-icon-color', iconColor );
	container.setAttribute( 'data-background-color', backgroundColor );
	container.setAttribute( 'data-text-color', textColor );
	container.setAttribute( 'data-text-secondary-color', buttonColor );
	container.style.setProperty(
		'--wp--playlist--waveform-background-color',
		backgroundColor
	);
	container.style.setProperty(
		'--wp--playlist--waveform-bar-color',
		waveformColor
	);
	container.style.setProperty(
		'--wp--playlist--waveform-button-background-color',
		buttonColor
	);
	container.style.setProperty(
		'--wp--playlist--waveform-button-icon-color',
		iconColor
	);
	if ( title ) {
		container.setAttribute( 'data-title', title );
	}
	if ( artist ) {
		container.setAttribute( 'data-subtitle', artist );
	}
	if ( artwork ) {
		container.setAttribute( 'data-artwork', artwork );
	}
	return container;
}

/**
 * Apply contrasting color to SVG icon paths for visibility.
 * The icons should contrast with the button background (which uses textColor).
 *
 * @param {Object}  options           - The options.
 * @param {Element} options.container - The waveform container element.
 * @param {string}  options.iconColor - The color to apply to the icon paths.
 */
export function styleSvgIcons( { container, iconColor } ) {
	const svgPaths = container.querySelectorAll( 'svg path' );
	svgPaths.forEach( ( path ) => {
		path.style.fill = iconColor;
	} );
}

/**
 * Set up play button accessibility: aria-label that toggles on play/pause.
 *
 * @param {Element} container    - The waveform container element.
 * @param {Object}  labels       - Button labels.
 * @param {string}  labels.play  - Label for the play state.
 * @param {string}  labels.pause - Label for the pause state.
 */
export function setupPlayButtonAccessibility(
	container,
	{ play: playLabel = 'Play', pause: pauseLabel = 'Pause' } = {}
) {
	const playBtn = container.querySelector( '.waveform-btn' );
	if ( ! playBtn ) {
		return;
	}

	playBtn.setAttribute( 'aria-label', playLabel );

	const onPlay = () => playBtn.setAttribute( 'aria-label', pauseLabel );
	const onPause = () => playBtn.setAttribute( 'aria-label', playLabel );

	container.addEventListener( 'waveformplayer:play', onPlay );
	container.addEventListener( 'waveformplayer:pause', onPause );
	container.addEventListener( 'waveformplayer:ended', onPause );

	return () => {
		container.removeEventListener( 'waveformplayer:play', onPlay );
		container.removeEventListener( 'waveformplayer:pause', onPause );
		container.removeEventListener( 'waveformplayer:ended', onPause );
	};
}

/**
 * Log play errors, filtering out expected AbortError.
 *
 * @param {Error} error - The error from play().
 */
export function logPlayError( error ) {
	// The browser throws AbortError when a play() promise is interrupted
	// by a subsequent pause() or a new audio source load (track change).
	// This is normal during rapid user interaction and safe to ignore.
	if ( error.name === 'AbortError' ) {
		return;
	}
	// eslint-disable-next-line no-console
	console.error( 'Playlist play error:', error );
}

/**
 * Initialize a WaveformPlayer instance on an element.
 *
 * This is the shared core logic used by both the React component (editor)
 * and the Interactivity API (frontend).
 *
 * @param {Element}  element               - The container element (must be in DOM).
 * @param {Object}   options               - Configuration options.
 * @param {string}   options.src           - The audio file URL.
 * @param {string}   options.title         - The track title.
 * @param {string}   options.artist        - The artist name.
 * @param {string}   options.image         - The artwork image URL.
 * @param {boolean}  options.autoPlay      - Whether to auto-play when ready.
 * @param {Function} options.onEnded       - Callback when track ends.
 * @param {Object}   options.labels        - Translated button labels.
 * @param {string}   options.waveformStyle - Waveform style (bars, mirror, line, blocks, dots, seekbar).
 * @return {Object} Object with instance, container, and destroy function.
 */
export function initWaveformPlayer(
	element,
	{ src, title, artist, image, autoPlay, onEnded, labels, waveformStyle }
) {
	// Get colors from computed styles.
	const {
		buttonColor,
		iconColor,
		textColor,
		waveformColor,
		progressColor,
		backgroundColor,
	} = getWaveformColors( element );

	// Create the waveform container.
	const container = createWaveformContainer( {
		url: src,
		title,
		artist,
		artwork: image,
		waveformColor,
		progressColor,
		buttonColor,
		iconColor,
		textColor,
		backgroundColor,
		waveformStyle,
	} );
	element.appendChild( container );

	// Initialize the WaveformPlayer library.
	const instance = new WaveformPlayerLib( container );

	// Set up event handlers.
	let cleanupAccessibility;
	const handlers = {
		ready: () => {
			styleSvgIcons( { container, iconColor } );
			cleanupAccessibility = setupPlayButtonAccessibility(
				container,
				labels
			);
			if ( autoPlay ) {
				instance.play()?.catch( logPlayError );
			}
		},
		ended: () => onEnded?.(),
	};

	container.addEventListener( 'waveformplayer:ready', handlers.ready );
	container.addEventListener( 'waveformplayer:ended', handlers.ended );

	// Return instance, container, and cleanup function.
	return {
		instance,
		container,
		destroy: () => {
			cleanupAccessibility?.();
			container.removeEventListener(
				'waveformplayer:ready',
				handlers.ready
			);
			container.removeEventListener(
				'waveformplayer:ended',
				handlers.ended
			);
			instance.destroy();
			container.remove();
		},
	};
}
