import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent,
} from "react";
import "./ServiceCategoryNav.css";

type ServiceCategoryNavItem = {
	id: string;
	label: string;
};

type Indicator = {
	left: number;
	width: number;
};

type Props = {
	categories: ServiceCategoryNavItem[];
	activeCategoryId: string;
};

export default function ServiceCategoryNav({ categories, activeCategoryId }: Props) {
	const ids = useMemo(() => categories.map((category) => category.id), [categories]);
	const fallbackId = ids[0] ?? "";
	const initialId = ids.includes(activeCategoryId) ? activeCategoryId : fallbackId;
	const [currentId, setCurrentId] = useState(initialId);
	const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0 });
	const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

	const measure = useCallback((id: string) => {
		const button = buttonRefs.current.get(id);
		if (!button) return;

		setIndicator({
			left: button.offsetLeft,
			width: button.getBoundingClientRect().width,
		});
	}, []);

	const activateService = useCallback(
		(id: string, options: { updateHash?: boolean; focus?: boolean } = {}) => {
			if (!ids.includes(id)) return;

			setCurrentId(id);
			window.requestAnimationFrame(() => {
				measure(id);
				buttonRefs.current.get(id)?.scrollIntoView({
					block: "nearest",
					inline: "center",
					behavior: "smooth",
				});
			});

			if (options.focus) {
				buttonRefs.current.get(id)?.focus();
			}

			document.querySelectorAll<HTMLElement>("[data-service-panel]").forEach((panel) => {
				panel.hidden = panel.dataset.servicePanel !== id;
			});

			if (options.updateHash ?? true) {
				history.replaceState(null, "", `#${id}`);
			}
		},
		[ids, measure],
	);

	useEffect(() => {
		const hashId = window.location.hash.replace("#", "");
		const nextId = ids.includes(hashId) ? hashId : initialId;
		activateService(nextId, { updateHash: false });

		const onHashChange = () => {
			const nextHashId = window.location.hash.replace("#", "");
			if (ids.includes(nextHashId)) {
				activateService(nextHashId, { updateHash: false });
			}
		};
		window.addEventListener("hashchange", onHashChange);

		return () => {
			window.removeEventListener("hashchange", onHashChange);
		};
	}, [activateService, ids, initialId]);

	useEffect(() => {
		const onResize = () => measure(currentId);
		window.addEventListener("resize", onResize);
		measure(currentId);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, [currentId, measure]);

	const focusRelative = (direction: number) => {
		if (ids.length === 0) return;

		const currentIndex = Math.max(ids.indexOf(currentId), 0);
		const nextIndex = (currentIndex + direction + ids.length) % ids.length;
		activateService(ids[nextIndex], { focus: true });
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			focusRelative(1);
		}

		if (event.key === "ArrowLeft") {
			event.preventDefault();
			focusRelative(-1);
		}

		if (event.key === "Home") {
			event.preventDefault();
			if (!ids[0]) return;
			activateService(ids[0], { focus: true });
		}

		if (event.key === "End") {
			event.preventDefault();
			if (!ids[ids.length - 1]) return;
			activateService(ids[ids.length - 1], { focus: true });
		}
	};

	const style = {
		"--service-category-indicator-left": `${indicator.left}px`,
		"--service-category-indicator-width": `${indicator.width}px`,
	} as CSSProperties;

	return (
		<div className="service-category-nav-scroll" aria-label="Категории услуг">
			<div className="service-category-nav" role="tablist" aria-label="Категории услуг" style={style}>
				{categories.map((category) => {
					const active = category.id === currentId;

					return (
						<button
							key={category.id}
							ref={(node) => {
								if (node) {
									buttonRefs.current.set(category.id, node);
								} else {
									buttonRefs.current.delete(category.id);
								}
							}}
							id={`service-tab-${category.id}`}
							className={[
								"service-category-nav__button",
								active ? "service-category-nav__button--active" : "",
							]
								.filter(Boolean)
								.join(" ")}
							type="button"
							role="tab"
							aria-selected={active ? "true" : "false"}
							aria-controls={`service-panel-${category.id}`}
							tabIndex={active ? 0 : -1}
							onClick={() => activateService(category.id)}
							onKeyDown={handleKeyDown}
						>
							{category.label}
						</button>
					);
				})}
				<div className="service-category-nav__indicator-layer" aria-hidden="true">
					<div className="service-category-nav__indicator-track">
						<div className="service-category-nav__indicator" />
					</div>
				</div>
			</div>
		</div>
	);
}
