import {Button, Grid} from "@sanity/ui";

type DeleteTranslationFooterProps = {
	translations: unknown[];
	onClose: () => void;
	onProceed: () => void;
	disabled: boolean;
};

export default function DeleteTranslationFooter(
	props: DeleteTranslationFooterProps,
) {
	const {translations, onClose, onProceed, disabled} = props;

	return (
		<Grid gridTemplateColumns={2} gap={2}>
			<Button text="Cancel" onClick={onClose} mode="ghost" />
			<Button
				disabled={disabled}
				text={
					translations && translations.length > 0
						? `Unset translation reference`
						: `Delete document`
				}
				onClick={onProceed}
				tone="critical"
			/>
		</Grid>
	);
}
