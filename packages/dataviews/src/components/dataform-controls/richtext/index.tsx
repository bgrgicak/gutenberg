/**
 * External dependencies
 */
import type { ComponentType } from 'react';

/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import RichTextControlAssembly from './control';
import type { DataFormControlProps } from '../../../types';

type RichTextControlProps = {
	label: string;
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	id?: string;
	hideLabelFromVision?: boolean;
	className?: string;
	clientId?: string;
	allowedFormats?: string[];
	disableFormats?: boolean;
	withoutInteractiveFormatting?: boolean;
	preserveWhiteSpace?: boolean;
	disableLineBreaks?: boolean;
};

// `./control` is the untyped rich-text "assembly": it wires `@wordpress/rich-text`
// to the presentational `RichTextControl` shell from `@wordpress/components`. Its
// JSDoc `@return {Element}` resolves to the DOM `Element`, so cast it to a React
// component to consume it as JSX with a typed prop contract here.
const RichTextControl =
	RichTextControlAssembly as unknown as ComponentType< RichTextControlProps >;

export default function RichText< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	config,
}: DataFormControlProps< Item > ) {
	const {
		className,
		clientId,
		allowedFormats,
		disableFormats,
		withoutInteractiveFormatting,
		preserveWhiteSpace,
		disableLineBreaks,
	} = config || {};
	const { label, placeholder, id, setValue } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue: string ) =>
			onChange( setValue( { item: data, value: newValue } ) ),
		[ data, onChange, setValue ]
	);

	return (
		<RichTextControl
			label={ label }
			value={ value }
			onChange={ onChangeControl }
			placeholder={ placeholder }
			id={ id }
			hideLabelFromVision={ hideLabelFromVision }
			className={ className }
			clientId={ clientId }
			allowedFormats={ allowedFormats }
			disableFormats={ disableFormats }
			withoutInteractiveFormatting={ withoutInteractiveFormatting }
			preserveWhiteSpace={ preserveWhiteSpace }
			disableLineBreaks={ disableLineBreaks }
		/>
	);
}
