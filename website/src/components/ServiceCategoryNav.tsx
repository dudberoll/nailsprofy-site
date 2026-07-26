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
	subcategories: {
		id: string;
		label: string;
	}[];
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
	const [currentSubcategoryId, setCurrentSubcategoryId] = useState(
		categories.find((category) => category.id === initialId)?.subcategories[0]?.id ?? "",
	);
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

	const activateSubcategory = useCallback((categoryId: string, subcategoryId: string) => {
		const category = categories.find((item) => item.id === categoryId);
		if (!category?.subcategories.some((subcategory) => subcategory.id === subcategoryId)) return;

		setCurrentSubcategoryId(subcategoryId);
		document.querySelectorAll<HTMLElement>("[data-price-group]").forEach((group) => {
			group.hidden = group.dataset.priceGroup !== subcategoryId;
		});
	}, [categories]);

	const activateService = useCallback(
		(id: string, options: { updateHash?: boolean; focus?: boolean } = {}) => {
			if (!ids.includes(id)) return;
			const initialSubcategoryId =
				categories.find((category) => category.id === id)?.subcategories[0]?.id ?? "";

			setCurrentId(id);
			window.requestAnimationFrame(() => {
				measure(id);
				buttonRefs.current.get(id)?.scrollIntoView({
					block: "nearest",
					inline: "center",
					behavior: options.focus ? "auto" : "smooth",
				});
			});

			if (options.focus) {
				buttonRefs.current.get(id)?.focus();
			}

			document.querySelectorAll<HTMLElement>("[data-service-panel]").forEach((panel) => {
				panel.hidden = panel.dataset.servicePanel !== id;
			});
			activateSubcategory(id, initialSubcategoryId);

			if (options.updateHash ?? true) {
				history.replaceState(null, "", `#${id}`);
			}
		},
		[activateSubcategory, categories, ids, measure],
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

	const currentCategory = categories.find((category) => category.id === currentId);
	const subcategoryIds = currentCategory?.subcategories.map((subcategory) => subcategory.id) ?? [];

	const handleSubcategoryKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const currentIndex = Math.max(subcategoryIds.indexOf(currentSubcategoryId), 0);
		let nextIndex = currentIndex;

		if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % subcategoryIds.length;
		else if (event.key === "ArrowLeft") {
			nextIndex = (currentIndex - 1 + subcategoryIds.length) % subcategoryIds.length;
		} else if (event.key === "Home") nextIndex = 0;
		else if (event.key === "End") nextIndex = subcategoryIds.length - 1;
		else return;

		event.preventDefault();
		const nextId = subcategoryIds[nextIndex];
		if (!nextId) return;
		activateSubcategory(currentId, nextId);
		window.requestAnimationFrame(() => document.getElementById(`price-tab-${currentId}-${nextId}`)?.focus());
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
		<div className="service-navigation">
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
			<div className="service-subcategory-nav-scroll">
				<div
					className="service-subcategory-nav"
					role="tablist"
					aria-label={`Подкатегории: ${currentCategory?.label ?? ""}`}
				>
					{currentCategory?.subcategories.map((subcategory) => {
						const active = subcategory.id === currentSubcategoryId;

						return (
							<button
								key={subcategory.id}
								id={`price-tab-${currentId}-${subcategory.id}`}
								className={[
									"service-subcategory-nav__button",
									active ? "service-subcategory-nav__button--active" : "",
								]
									.filter(Boolean)
									.join(" ")}
								type="button"
								role="tab"
								aria-selected={active ? "true" : "false"}
								aria-controls={`price-${currentId}-${subcategory.id}`}
								tabIndex={active ? 0 : -1}
								onClick={() => activateSubcategory(currentId, subcategory.id)}
								onKeyDown={handleSubcategoryKeyDown}
							>
								{subcategory.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
