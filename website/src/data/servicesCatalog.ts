import data from "./yclientsServices.json";

export type SourcePriceItem = {
	id: string;
	name: string;
	price_text: string | null;
};

export type SourcePriceSection = {
	name: string;
	items: SourcePriceItem[];
};

export type PriceItem = {
	sourceId: string;
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

const sourceSections = data.price_sections as SourcePriceSection[];

const normalizeServiceName = (name: string) => name.replace(/\s*\+\s*(?=\p{L})/gu, " + ");

const sectionItems = (...sectionNames: string[]) =>
	sectionNames.flatMap(
		(sectionName) => sourceSections.find((section) => section.name === sectionName)?.items ?? [],
	);

const matchingItems = (sectionNames: string[], pattern: RegExp) =>
	sectionItems(...sectionNames).filter((item) => pattern.test(item.name));

const priceGroup = (id: string, title: string, items: SourcePriceItem[]): PriceGroup => ({
	id,
	title,
	note: items.length === 0 ? "Сейчас в YCLIENTS нет услуг в этой подкатегории." : undefined,
	items: items.map((item) => ({
		sourceId: item.id,
		name: normalizeServiceName(item.name),
		prices: [["Цена", item.price_text ?? "—"]],
	})),
});

const manicureGroups: PriceGroup[] = [
	priceGroup("manicure-complex", "Комплексные услуги", [
		...sectionItems(
			"Маникюр с покрытием",
			"Маникюр с покрытием ТОП-мастер",
			"ЭКСПРЕСС маникюр",
			"ЭКСПРЕСС маникюр ТОП-мастер",
			"Пилочный маникюр",
		),
		...matchingItems(["Счастливые часы"], /маникюр/iu),
		...sectionItems("Дарим подарки!"),
	]),
	priceGroup("manicure-basic", "Маникюр", sectionItems("Маникюр без покрытия")),
	priceGroup(
		"manicure-coverage-design",
		"Покрытие и дизайн",
		sectionItems("Покрытие\\Дизайн"),
	),
	priceGroup(
		"manicure-acrylic-polygel",
		"Акрил и полигель",
		sectionItems("Наращивание ногтей АКРИЛ", "Наращивание ногтей ПОЛИГЕЛЬ"),
	),
	priceGroup("manicure-gel", "Наращивание гелем", sectionItems("Наращивание ногтей ГЕЛЬ")),
	priceGroup(
		"manicure-men",
		"Мужской маникюр",
		matchingItems(["Услуги для МУЖЧИН"], /маникюр/iu),
	),
];

const pedicureGroups: PriceGroup[] = [
	priceGroup(
		"pedicure-complex",
		"Комплексные услуги",
		sectionItems(
			"Педикюр с покрытием",
			"Педикюр с покрытием ТОП-мастер",
			"ЭКСПРЕСС педикюр",
			"ЭКСПРЕСС педикюр ТОП-мастер",
		),
	),
	priceGroup("pedicure-basic", "Педикюр", sectionItems("Педикюр без покрытия")),
	priceGroup("pedicure-coverage", "Покрытие", sectionItems("Покрытие\\Дизайн")),
	priceGroup("pedicure-podology", "Подология", sectionItems("Подология")),
	priceGroup(
		"pedicure-men",
		"Мужской педикюр",
		matchingItems(["Услуги для МУЖЧИН"], /педикюр/iu),
	),
];

const hairCutAndStyleItems = sectionItems("Стрижки и укладки");
const hairColorItems = sectionItems("Окрашивание волос");
const hairSpaItems = sectionItems("СПА процедуры для волос");

const hairGroups: PriceGroup[] = [
	priceGroup("hair-1", "Стрижки и укладки", hairCutAndStyleItems),
	priceGroup("hair-2", "Окрашивание волос", hairColorItems),
	priceGroup("hair-3", "Осветление волос", sectionItems("Осветление волос")),
	priceGroup(
		"hair-4",
		"СПА процедуры для волос",
		sectionItems("СПА процедуры для волос", "Кератин BBone"),
	),
	priceGroup("hair-5", "Завивка для волос LEBEL", []),
	priceGroup(
		"hair-cut-1",
		"Стрижка",
		hairCutAndStyleItems.filter((item) => /^Стрижка(?!.*горячими ножницами)/iu.test(item.name)),
	),
	priceGroup(
		"hair-cut-2",
		"Стрижка / Горячие ножницы",
		hairCutAndStyleItems.filter((item) => /горячими ножницами/iu.test(item.name)),
	),
	priceGroup("hair-style-1", "Вечерняя прическа простая", []),
	priceGroup("hair-style-2", "Вечерняя", []),
	priceGroup(
		"hair-style-3",
		"Мытье волос",
		hairCutAndStyleItems.filter((item) => /^Мытье/iu.test(item.name)),
	),
	priceGroup(
		"hair-style-4",
		"Укладка",
		hairCutAndStyleItems.filter((item) => /брашинг/iu.test(item.name)),
	),
	priceGroup(
		"hair-style-5",
		"Укладка на плойку",
		hairCutAndStyleItems.filter((item) => /плойку/iu.test(item.name)),
	),
	priceGroup("hair-style-6", "Укладка с плетением", []),
	priceGroup(
		"hair-color-1",
		"Окрашивание Лейбел",
		hairColorItems.filter(
			(item) => /Lebel/iu.test(item.name) && !/Air Touch|Фитоламинирование/iu.test(item.name),
		),
	),
	priceGroup(
		"hair-color-2",
		"Окрашивание Лейбел \\ Air Touch",
		hairColorItems.filter((item) => /Air Touch.*Lebel/iu.test(item.name)),
	),
	priceGroup("hair-color-3", "Окрашивание Лейбел \\ Щелочная смывка LTEX", []),
	priceGroup(
		"hair-color-4",
		"Фитоламинирование-завивка LEBEL \\ Фитоламинирование для окрашеных волос",
		hairColorItems.filter((item) => /Фитоламинирование/iu.test(item.name)),
	),
	priceGroup(
		"hair-color-5",
		"Окрашивание MATRIX",
		hairColorItems.filter((item) => /MATRIX/iu.test(item.name) && !/Air Touch/iu.test(item.name)),
	),
	priceGroup(
		"hair-color-6",
		"Окрашивание MATRIX \\ Air Touch",
		hairColorItems.filter((item) => /Air Touch.*MATRIX/iu.test(item.name)),
	),
	priceGroup("hair-color-7", "Окрашивание MATRIX \\ Декапирование волос", []),
	priceGroup(
		"hair-color-8",
		"Окрашивание Wella",
		hairColorItems.filter((item) => /Wella/iu.test(item.name) && !/Air Touch/iu.test(item.name)),
	),
	priceGroup(
		"hair-color-9",
		"Окрашивание Wella \\ Air Touch",
		hairColorItems.filter((item) => /Air Touch.*Wella/iu.test(item.name)),
	),
	priceGroup("hair-color-10", "Окрашивание Wella \\ Декапирование волос", []),
	priceGroup("hair-color-11", "Кислотная смывка Color off", []),
	priceGroup("hair-spa-1", "Lebel \\ SPA \\ Блеск и сила", []),
	priceGroup("hair-spa-2", "Greymy кератиновые уходы", []),
	priceGroup("hair-spa-3", "Olaplex", []),
	priceGroup(
		"hair-spa-4",
		"Lebel \\ SPA-программа «Жизненная сила»",
		hairSpaItems.filter((item) => /Жизненная сила/iu.test(item.name)),
	),
	priceGroup(
		"hair-spa-5",
		"Lebel \\ Абсолютное счастье",
		hairSpaItems.filter((item) => /Абсолютное счастье/iu.test(item.name)),
	),
	priceGroup("hair-spa-6", "Matrix \\ Protopak 5+", []),
	priceGroup("hair-spa-7", "Экспресс уходы для волос", []),
	priceGroup(
		"hair-men",
		"Мужские услуги",
		matchingItems(["Услуги для МУЖЧИН"], /стрижк/iu),
	),
];

const browItems = sectionItems("Брови");
const browsGroups: PriceGroup[] = [
	priceGroup("brows-brows", "Брови", [
		...browItems.filter((item) => !/эпиляц/iu.test(item.name)),
		...matchingItems(["Счастливые часы"], /бров/iu),
	]),
	priceGroup("brows-lashes", "Ресницы", sectionItems("Ресницы")),
	priceGroup(
		"brows-face-epilation",
		"Эпиляция лица",
		browItems.filter((item) => /эпиляц/iu.test(item.name)),
	),
];

export const serviceCategories: ServiceCategory[] = [
	{
		id: "manicure",
		label: "Маникюр",
		image: "/images/services/manicure-closeup.png",
		heroImage: "/images/services/manicure-closeup.png",
		heroAlt: "Нежный нюдовый маникюр с розой и лепестками",
		priceGroups: manicureGroups,
	},
	{
		id: "pedicure",
		label: "Педикюр",
		image: "/images/services/pedicure-spa.png",
		heroImage: "/images/services/pedicure-spa.png",
		heroAlt: "Аккуратный педикюр в розовой спа-зоне",
		priceGroups: pedicureGroups,
	},
	{
		id: "hair",
		label: "Волосы",
		image: "/images/services/hair-care.png",
		heroImage: "/images/services/hair-care.png",
		heroAlt: "Мягкая укладка длинных волос на свету",
		priceGroups: hairGroups,
	},
	{
		id: "brows",
		label: "Брови/Ресницы",
		image: "/images/services/brows-portrait.png",
		heroImage: "/images/services/brows-portrait.png",
		heroAlt: "Портрет с аккуратными натуральными бровями",
		priceGroups: browsGroups,
	},
];

const routedSourceIds = new Set(
	serviceCategories.flatMap((category) =>
		category.priceGroups.flatMap((group) => group.items.map((item) => item.sourceId)),
	),
);
const missingSourceItems = sourceSections
	.flatMap((section) => section.items)
	.filter((item) => !routedSourceIds.has(item.id));

if (missingSourceItems.length > 0) {
	throw new Error(`Не распределены услуги YCLIENTS: ${missingSourceItems.map((item) => item.name).join(", ")}`);
}

export const initialServiceCategory = serviceCategories[0];
