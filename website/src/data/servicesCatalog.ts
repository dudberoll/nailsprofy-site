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
	id: string;
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

const hasValidPrice = (item: SourcePriceItem) => {
	const value = item.price_text.match(/\d[\d\s]*\s*р\./iu)?.[0];
	return value ? Number.parseInt(value.replace(/\D/gu, ""), 10) > 0 : false;
};

const sourceSection = (serviceTitle: string, sectionTitle: string) =>
	sourceServices
		.find((service) => service.title === serviceTitle)
		?.price_sections?.find((section) => section.name === sectionTitle);

const priceGroup = (
	id: string,
	title: string,
	items: SourcePriceItem[],
): PriceGroup => ({
	id,
	title,
	items: items.map((item) => ({
		name: item.name,
		prices: [["Цена", normalizePrice(item.price_text)]],
	})),
});

const sourcePriceGroup = (
	id: string,
	serviceTitle: string,
	sectionTitle: string,
	title = sectionTitle,
	filter: (item: SourcePriceItem) => boolean = () => true,
) =>
	priceGroup(
		id,
		title,
		(sourceSection(serviceTitle, sectionTitle)?.items ?? []).filter(
			(item) => hasValidPrice(item) && filter(item),
		),
	);

const sourcePriceGroups = (serviceTitle: string, idPrefix: string): PriceGroup[] =>
	(sourceServices.find((service) => service.title === serviceTitle)?.price_sections ?? []).map(
		(section, index) =>
			priceGroup(
				`${idPrefix}-${index + 1}`,
				section.name,
				section.items.filter(hasValidPrice),
			),
	);

const uniquePriceGroups = (groups: PriceGroup[]): PriceGroup[] => {
	const seen = new Set<string>();

	return groups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => {
				const key = `${item.name}\u0000${item.prices.map(([, price]) => price).join("\u0000")}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			}),
		}))
		.filter((group) => group.items.length > 0);
};

const isPedicureItem = (item: SourcePriceItem) =>
	/педикюр|покрытие ног(?:\s|$)|архитектур/iu.test(item.name);

export const serviceCategories: ServiceCategory[] = [
	{
		id: "manicure",
		label: "Маникюр",
		image: "/images/services/manicure-closeup.png",
		heroImage: "/images/services/manicure-closeup.png",
		heroAlt: "Нежный нюдовый маникюр с розой и лепестками",
		priceGroups: uniquePriceGroups([
			sourcePriceGroup(
				"manicure-complex",
				"Маникюр",
				"Комплексные услуги",
				"Комплексные услуги",
				(item) => !isPedicureItem(item),
			),
			sourcePriceGroup("manicure-basic", "Маникюр", "Маникюр"),
			sourcePriceGroup(
				"manicure-coverage-design",
				"Маникюр",
				"Покрытие\\Дизайн",
				"Покрытие и дизайн",
				(item) => !isPedicureItem(item),
			),
			sourcePriceGroup(
				"manicure-extensions",
				"Наращивание ногтей",
				"Наращивание ногтей",
			),
			sourcePriceGroup(
				"manicure-acrylic-polygel",
				"Наращивание ногтей акрилом/полигелем",
				"Наращивание ногтей",
				"Акрил и полигель",
			),
			sourcePriceGroup(
				"manicure-gel",
				"Наращивание ногтей гелем",
				"Наращивание ногтей",
				"Наращивание гелем",
			),
			sourcePriceGroup(
				"manicure-men",
				"Мужской маникюр в салоне",
				"Услуги для мужчин",
				"Мужской маникюр",
			),
		]),
	},
	{
		id: "pedicure",
		label: "Педикюр",
		image: "/images/services/pedicure-spa.png",
		heroImage: "/images/services/pedicure-spa.png",
		heroAlt: "Аккуратный педикюр в розовой спа-зоне",
		priceGroups: uniquePriceGroups([
			sourcePriceGroup(
				"pedicure-complex",
				"Маникюр",
				"Комплексные услуги",
				"Комплексные услуги",
				isPedicureItem,
			),
			sourcePriceGroup("pedicure-basic", "Педикюр", "Педикюр"),
			sourcePriceGroup(
				"pedicure-coverage",
				"Маникюр",
				"Покрытие\\Дизайн",
				"Покрытие",
				isPedicureItem,
			),
			sourcePriceGroup("pedicure-podology", "Педикюр", "ПОДОЛОГИЯ", "Подология"),
			sourcePriceGroup(
				"pedicure-men",
				"Мужской педикюр",
				"Услуги для мужчин",
				"Мужской педикюр",
			),
		]),
	},
	{
		id: "hair",
		label: "Волосы",
		image: "/images/services/hair-care.png",
		heroImage: "/images/services/hair-care.png",
		heroAlt: "Мягкая укладка длинных волос на свету",
		priceGroups: uniquePriceGroups([
			...sourcePriceGroups("Парикмахерские услуги", "hair"),
			...sourcePriceGroups("Стрижка волос", "hair-cut"),
			...sourcePriceGroups("Укладка волос", "hair-style"),
			...sourcePriceGroups("Окрашивание волос", "hair-color"),
			...sourcePriceGroups("SPA-программы для волос", "hair-spa"),
			sourcePriceGroup(
				"hair-men",
				"Мужская стрижка",
				"Услуги для мужчин",
				"Мужские услуги",
			),
		]),
	},
	{
		id: "brows",
		label: "Брови/Ресницы",
		image: "/images/services/brows-portrait.png",
		heroImage: "/images/services/brows-portrait.png",
		heroAlt: "Портрет с аккуратными натуральными бровями",
		priceGroups: [
			sourcePriceGroup(
				"brows-brows",
				"Услуги бровиста",
				"Брови",
				"Брови",
				(item) => /бров/iu.test(item.name),
			),
			sourcePriceGroup(
				"brows-lashes",
				"Услуги бровиста",
				"Брови",
				"Ресницы",
				(item) => /ресниц/iu.test(item.name),
			),
			sourcePriceGroup(
				"brows-face-epilation",
				"Услуги бровиста",
				"Брови",
				"Эпиляция лица",
				(item) => !/бров|ресниц/iu.test(item.name),
			),
		],
	},
];

export const initialServiceCategory = serviceCategories[0];
