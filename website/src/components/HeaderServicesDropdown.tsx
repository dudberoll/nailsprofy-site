import {
	Children,
	createContext,
	isValidElement,
	useContext,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./HeaderServicesDropdown.css";

type Direction = "rtl" | "ltr" | null;

type DirectionContextValue = {
	direction: Direction;
	setAnimationDirection: (tab: number | null) => void;
};

type CurrentTabContextValue = {
	currentTab: number | null;
};

type ServiceMenuItem = {
	id: string;
	label: string;
};

type Props = {
	services: ServiceMenuItem[];
	isActive?: boolean;
};

const DirectionContext = createContext<DirectionContextValue | null>(null);
const CurrentTabContext = createContext<CurrentTabContextValue | null>(null);

const useDirection = () => {
	const context = useContext(DirectionContext);
	if (!context) throw new Error("useDirection must be used inside Dropdown");
	return context;
};

const useCurrentTab = () => {
	const context = useContext(CurrentTabContext);
	if (!context) throw new Error("useCurrentTab must be used inside Dropdown");
	return context;
};

function Dropdown({ children }: { children: ReactNode }) {
	const [currentTab, setCurrentTab] = useState<null | number>(null);
	const [direction, setDirection] = useState<Direction>(null);

	const setAnimationDirection = (tab: number | null) => {
		if (typeof currentTab === "number" && typeof tab === "number") {
			setDirection(currentTab > tab ? "rtl" : "ltr");
		} else if (tab === null) {
			setDirection(null);
		}

		setCurrentTab(tab);
	};

	return (
		<DirectionContext.Provider value={{ direction, setAnimationDirection }}>
			<CurrentTabContext.Provider value={{ currentTab }}>
				<span
					className="header-services-dropdown"
					onMouseLeave={() => setAnimationDirection(null)}
				>
					{children}
				</span>
			</CurrentTabContext.Provider>
		</DirectionContext.Provider>
	);
}

function TriggerWrapper({ children }: { children: ReactNode }) {
	const { currentTab } = useCurrentTab();
	const { setAnimationDirection } = useDirection();

	return (
		<>
			{Children.map(children, (child, index) => {
				const tab = index + 1;
				const expanded = currentTab === tab;
				const active =
					isValidElement<{ isActive?: boolean }>(child) && Boolean(child.props.isActive);

				return (
					<button
						className={[
							"header-services-dropdown__trigger",
							expanded ? "header-services-dropdown__trigger--open" : "",
							active ? "header-services-dropdown__trigger--active" : "",
						]
							.filter(Boolean)
							.join(" ")}
						type="button"
						aria-haspopup="menu"
						aria-expanded={expanded ? "true" : "false"}
						onMouseEnter={() => setAnimationDirection(tab)}
						onClick={() => setAnimationDirection(expanded ? null : tab)}
						onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
							if (event.key === "Escape") {
								setAnimationDirection(null);
							}
						}}
					>
						{child}
					</button>
				);
			})}
		</>
	);
}

function Trigger({ children }: { children: ReactNode; isActive?: boolean }) {
	return (
		<>
			<span className="header-services-dropdown__trigger-label">{children}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="header-services-dropdown__chevron"
				aria-hidden="true"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</>
	);
}

function Tabs({ children }: { children: ReactNode }) {
	const { currentTab } = useCurrentTab();
	const { direction } = useDirection();

	return (
		<motion.div
			id="services-menu-content"
			className="header-services-dropdown__content"
			data-open={currentTab ? "true" : undefined}
			initial={{ opacity: 0, scale: 0.98 }}
			animate={currentTab ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
			transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
		>
			<div className="header-services-dropdown__hover-bridge" />
			<div className="header-services-dropdown__panel">
				{Children.map(children, (child, index) => (
					<div>
						<AnimatePresence mode="wait">
							{currentTab !== null && currentTab === index + 1 ? (
								<motion.div
									key={currentTab}
									initial={{
										opacity: 0,
										x: direction === "ltr" ? 24 : direction === "rtl" ? -24 : 0,
									}}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
								>
									{child}
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				))}
			</div>
		</motion.div>
	);
}

function Tab({ children }: { children: ReactNode }) {
	return <div>{children}</div>;
}

export default function HeaderServicesDropdown({ services, isActive = false }: Props) {
	return (
		<Dropdown>
			<TriggerWrapper>
				<Trigger isActive={isActive}>Услуги</Trigger>
			</TriggerWrapper>
			<Tabs>
				<Tab>
					<div className="header-services-dropdown__grid" role="menu" aria-label="Услуги">
						{services.map((service) => (
							<a
								key={service.id}
								className="header-services-dropdown__item"
								href={`/services#${service.id}`}
								role="menuitem"
							>
								<span className="header-services-dropdown__item-title">{service.label}</span>
								<span className="header-services-dropdown__item-arrow" aria-hidden="true">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5"
											stroke="currentColor"
											strokeWidth="1.35"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							</a>
						))}
					</div>
					<div className="header-services-dropdown__footer">
						<a href="/services">Смотреть всё</a>
					</div>
				</Tab>
			</Tabs>
		</Dropdown>
	);
}
