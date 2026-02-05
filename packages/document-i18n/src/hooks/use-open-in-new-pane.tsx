import {useCallback} from "react";
import {useRouter} from "sanity/router";
import {usePaneRouter} from "sanity/structure";

export function useOpenInNewPane(id?: string | null, type?: string) {
	const router = useRouter();
	const {routerPanesState, groupIndex} = usePaneRouter();

	const openInNewPane = useCallback(() => {
		if (!id || !type) {
			return;
		}

		// No panes open, function might be called outside Structure
		if (!routerPanesState.length) {
			router.navigateIntent("edit", {id, type});
			return;
		}

		const panes = [...routerPanesState];
		panes.splice(groupIndex + 1, 0, [
			{
				id: id,
				params: {type},
			},
		]);

		const href = router.resolvePathFromState({panes});
		router.navigateUrl({path: href});
	}, [id, type, router, routerPanesState, groupIndex]);

	return openInNewPane;
}
