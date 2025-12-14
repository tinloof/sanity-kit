import type {Ref} from "react";

import {useEffect, useRef, useState} from "react";

/**
 * Options for configuring the Intersection Observer
 */
type IntersectionOptions = {
	/** The element used as the viewport for checking visibility */
	root?: Element | null;
	/** Margin around the root (e.g., "10px 20px 30px 40px") */
	rootMargin?: string;
	/** Number between 0 and 1 indicating visibility percentage threshold */
	threshold?: number;
};

/**
 * A lightweight React hook wrapper around the Intersection Observer API
 *
 * Detects when an element enters the viewport. Useful for implementing
 * lazy loading, infinite scroll triggers, and viewport-based animations.
 *
 * @param options - Configuration options for the Intersection Observer
 * @returns Object containing `inView` state and `ref` to attach to element
 *
 * @example
 * ```tsx
 * import { useInView } from "@tinloof/sanity-next/hooks";
 *
 * function LazySection() {
 *   const { inView, ref } = useInView({
 *     threshold: 0.5,
 *     rootMargin: "100px",
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {inView ? (
 *         <ExpensiveComponent />
 *       ) : (
 *         <div>Scroll to load...</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInView(options: IntersectionOptions = {}): {
	inView: boolean;
	ref: Ref<HTMLDivElement>;
} {
	const [inView, setInView] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			// Update our state when observer callback fires
			setInView(entry.isIntersecting);
		}, options);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				observer.unobserve(ref.current);
			}
		};
	}, [ref, options]);

	return {inView, ref};
}
