import data from "./nailsprofi.json";

export type SourcePriceItem = {
	name: string;
	price_text: string;
};

export type SourcePriceSection = {
	name: string;
	items: SourcePriceItem[];
};

export type SourceService = {
	title: string;
	price_sections?: SourcePriceSection[];
};

export type PriceItem = {
	name: string;
	description?: string;
	prices: [string, string][];
};

export type PriceGroup = {
	title: string;
	note?: string;
	items: PriceItem[];
};

export type ServiceCategory = {
	id: string;
	label: string;
	image: string;
	heroImage: string;
	heroAlt: string;
	priceGroups: PriceGroup[];
};

const sourceServices = data.services as SourceService[];

const normalizePrice = (price: string) => price.replace(/\s*р\./u, " ₽").trim();

const sourcePriceGroups = (serviceTitles: string[]): PriceGroup[] =>
	serviceTitles.flatMap((title) => {
		const service = sourceServices.find((item) => item.title === title);
		const sections = service?.price_sections ?? [];

		return sections.map((section) => ({
			title: section.name,
			items: section.items.map((item) => ({
				name: item.name,
				prices: [["Цена", normalizePrice(item.price_text)]],
			})),
		}));
	});

export const serviceCategories: ServiceCategory[] = [
	{
		id: "manicure",
		label: "Маникюр",
		image: "/images/services/manicure-closeup.png",
		heroImage: "/images/services/manicure-closeup.png",
		heroAlt: "Нежный нюдовый маникюр с розой и лепестками",
		priceGroups: sourcePriceGroups([
			"Маникюр",
			"Наращивание ногтей",
			"Наращивание ногтей акрилом/полигелем",
			"Наращивание ногтей гелем",
			"Мужской маникюр в салоне",
		]),
	},
	{
		id: "pedicure",
		label: "Педикюр",
		image: "/images/services/pedicure-spa.png",
		heroImage: "/images/services/pedicure-spa.png",
		heroAlt: "Аккуратный педикюр в розовой спа-зоне",
		priceGroups: sourcePriceGroups(["Педикюр", "Мужской педикюр"]),
	},
	{
		id: "hair",
		label: "Волосы",
		image: "/images/services/hair-care.png",
		heroImage: "/images/services/hair-care.png",
		heroAlt: "Мягкая укладка длинных волос на свету",
		priceGroups: sourcePriceGroups([
			"Парикмахерские услуги",
			"Стрижка волос",
			"Укладка волос",
			"Окрашивание волос",
			"SPA-программы для волос",
			"Мужская стрижка",
		]),
	},
	{
		id: "brows",
		label: "Брови",
		image: "/images/services/brows-portrait.png",
		heroImage: "/images/services/brows-portrait.png",
		heroAlt: "Портрет с аккуратными натуральными бровями",
		priceGroups: sourcePriceGroups(["Услуги бровиста"]),
	},
];

export const initialServiceCategory = serviceCategories[0];
