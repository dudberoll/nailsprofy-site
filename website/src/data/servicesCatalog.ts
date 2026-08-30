import data from "./yclientsServices.json";

export type SourcePriceItem = {
	id: string;
	name: string;
	duration?: string | null;
	price_text: string | null;
};

export type SourcePriceSection = {
	name: string;
	items: SourcePriceItem[];
};

export type PriceItem = {
	sourceId: string;
	name: string;
	duration?: string;
	description?: string;
	prices: [string, string][];
};

export type PriceGroup = {
	id: string;
	title: string;
	note?: string;
	showInSubcategoryNav?: boolean;
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

const normalizeServiceName = (name: string) =>
	name
		.replace(/\s*\+\s*(?=\p{L})/gu, " + ")
		.replace(/машиинкой/giu, "машинкой")
		.replace(/длинна/giu, "длина")
		.replace(/востанавливающие покрытие/giu, "восстанавливающее покрытие")
		.replace(/бондироавние/giu, "бондирование")
		.replace(/[ \t]{2,}/g, " ")
		.trim();

const sectionItems = (...sectionNames: string[]) =>
	sectionNames.flatMap(
		(sectionName) => sourceSections.find((section) => section.name === sectionName)?.items ?? [],
	);

const matchingItems = (sectionNames: string[], pattern: RegExp) =>
	sectionItems(...sectionNames).filter((item) => pattern.test(item.name));

const liveItem = (
	id: string,
	name: string,
	price_text: string | null,
	duration: string | null,
): SourcePriceItem => ({
	id,
	name,
	price_text,
	duration,
});

const liveBrowCompliment = liveItem("30675354", "Коррекция бровей - комплимент от мастера", "В подарок", "1 ч");
const liveMaleBrow = liveItem("12955329", "Коррекция бровей мужская", "1 400 ₽", "1 ч");
const liveBrowLightening = liveItem("12955338", "Осветление бровей", "1 200 ₽", "30 мин");

const liveBondingItems = [
	liveItem("31123020", "Маникюр + бондирование натуральных ногтей", "3 100 ₽", "1 ч"),
	liveItem("31123182", "Маникюр + бондироавние натуральных ногтей - топ мастер", "3 600 ₽", "1 ч"),
	liveItem("31183956", "Смарт педикюр + бондирование - топ мастер", "5 250 ₽", "1 ч"),
];

const liveManicureItems = [
	liveItem("31197960", "Классический маникюр + гель лак", "3 100 ₽", "1 ч 30 мин"),
	liveItem("31198380", "Классический маникюр + гель лак френч", "3 900 ₽", "2 ч"),
	liveItem("31198419", "Классический маникюр + лак", "2 500 ₽", "1 ч 30 мин"),
	liveItem("31203780", "Опил искусственных + маникюр + гель - лак", "3 800 ₽", "1 ч 30 мин"),
];

const liveTopManicureItem = liveItem(
	"31203852",
	"Опил искусственных + маникюр + гель - лак - топ мастер",
	"4 500 ₽",
	"1 ч 30 мин",
);
const liveClassicManicureItem = liveItem("31197909", "Классический маникюр", "2 300 ₽", "1 ч");
const liveIbxItem = liveItem("12955983", "Укрепление ногтей IBX", "700 ₽", "30 мин");

const liveMaleItems = [
	liveMaleBrow,
	liveItem("31198632", "Классический мужской маникюр", "2 500 ₽", "1 ч"),
	liveItem("31183167", "Пилочный маникюр мужской", "3 000 ₽", "1 ч"),
];

const shortServiceDescriptions: Record<string, string> = {
	"30675354": "Коррекция бровей в подарок при записи на любую услугу NailsProfi.",
	"15371415": "В будни в обеденное время снятие старого покрытия — в подарок.",
	"15371759": "Комплекс для бровей: ламинирование, окрашивание, коррекция и ботокс. В обеденное время — на 400 ₽ выгоднее.",
	"30056808": "Пилочный маникюр без ножниц и фрез. Для новых гостей — подарок 500 ₽; покрытие оплачивается отдельно.",
	"15443402": "Скидка 15% на все услуги действует 7 дней до и 7 дней после дня рождения.",
	"23495742": "Порекомендуйте NailsProfi другу — получите 1000 бонусных рублей. Бонусами можно оплачивать по 500 ₽ за услугу.",
};

const priceGroup = (
	id: string,
	title: string,
	items: SourcePriceItem[],
	options: { showInSubcategoryNav?: boolean } = {},
): PriceGroup => ({
	id,
	title,
	showInSubcategoryNav: options.showInSubcategoryNav,
	note: items.length === 0 ? "Сейчас в YCLIENTS нет услуг в этой подкатегории." : undefined,
	items: items.map((item) => ({
		sourceId: item.id,
		name: normalizeServiceName(item.name),
		duration: item.duration ?? undefined,
		description: shortServiceDescriptions[item.id],
		prices: item.price_text ? [["Цена", item.price_text]] : [],
	})),
});

const bonusGroups: PriceGroup[] = [
	priceGroup("bonus-happy-hours", "Счастливые часы", [
		...sectionItems("Счастливые часы"),
		liveBrowCompliment,
	]),
	priceGroup("bonus-gifts", "Дарим подарки!", sectionItems("Дарим подарки!")),
];

const browGroups: PriceGroup[] = [
	priceGroup(
		"brows-services",
		"Брови",
		[
			...sectionItems("Брови").filter(
				(item) => item.id !== liveBrowCompliment.id && item.id !== liveMaleBrow.id,
			),
			liveBrowLightening,
		],
		{ showInSubcategoryNav: false },
	),
];

const lashGroups: PriceGroup[] = [
	priceGroup("lashes-services", "Ресницы", sectionItems("Ресницы"), {
		showInSubcategoryNav: false,
	}),
];

const manicureWithoutCoverageItems = sectionItems("Маникюр без покрытия");
const manicureWithoutCoverageTopItems = manicureWithoutCoverageItems.filter((item) => /- топ мастер$/iu.test(item.name));

const manicureGroups: PriceGroup[] = [
	priceGroup("manicure-bonding", "Бондирование ногтей", liveBondingItems),
	priceGroup("manicure-coverage", "Маникюр с покрытием", [
		...sectionItems("Маникюр с покрытием"),
		...liveManicureItems,
	]),
	priceGroup("manicure-coverage-top", "Маникюр с покрытием ТОП-мастер", [
		...sectionItems("Маникюр с покрытием ТОП-мастер"),
		liveTopManicureItem,
	]),
	priceGroup("manicure-file", "Пилочный маникюр", sectionItems("Пилочный маникюр")),
	priceGroup("manicure-express", "ЭКСПРЕСС маникюр", sectionItems("ЭКСПРЕСС маникюр")),
	priceGroup(
		"manicure-express-top",
		"ЭКСПРЕСС маникюр ТОП-мастер",
		sectionItems("ЭКСПРЕСС маникюр ТОП-мастер"),
	),
	priceGroup("manicure-without-coverage", "Маникюр без покрытия", [
		...manicureWithoutCoverageItems.filter((item) => !/- топ мастер$/iu.test(item.name)),
		liveClassicManicureItem,
	]),
	priceGroup("manicure-without-coverage-top", "Маникюр без покрытия ТОП-мастер", manicureWithoutCoverageTopItems),
];

const pedicureGroups: PriceGroup[] = [
	priceGroup("pedicure-coverage", "Педикюр с покрытием", sectionItems("Педикюр с покрытием")),
	priceGroup(
		"pedicure-coverage-top",
		"Педикюр с покрытием ТОП-мастер",
		sectionItems("Педикюр с покрытием ТОП-мастер"),
	),
	priceGroup("pedicure-express", "ЭКСПРЕСС педикюр", sectionItems("ЭКСПРЕСС педикюр")),
	priceGroup(
		"pedicure-express-top",
		"ЭКСПРЕСС педикюр ТОП-мастер",
		sectionItems("ЭКСПРЕСС педикюр ТОП-мастер"),
	),
	priceGroup("pedicure-without-coverage", "Педикюр без покрытия", sectionItems("Педикюр без покрытия")),
	priceGroup("pedicure-podology", "Подология", sectionItems("Подология")),
];

const coverageGroups: PriceGroup[] = [
	priceGroup(
		"coverage-design-services",
		"Покрытие\\Дизайн",
		[...sectionItems("Покрытие\\Дизайн"), liveIbxItem],
		{ showInSubcategoryNav: false },
	),
];

const extensionGroups: PriceGroup[] = [
	priceGroup("extension-gel", "Наращивание гель", sectionItems("Наращивание ногтей ГЕЛЬ")),
	priceGroup("extension-acrylic", "Наращивание акрил", sectionItems("Наращивание ногтей АКРИЛ")),
	priceGroup("extension-polygel", "Наращивание полигель", sectionItems("Наращивание ногтей ПОЛИГЕЛЬ")),
];

const hairGroups: PriceGroup[] = [
	priceGroup("hair-cuts", "Стрижки и укладки", sectionItems("Стрижки и укладки")),
	priceGroup("hair-color", "Окрашивание волос", sectionItems("Окрашивание волос")),
	priceGroup("hair-lightening", "Осветление волос", sectionItems("Осветление волос")),
	priceGroup("hair-spa", "СПА процедуры для волос", sectionItems("СПА процедуры для волос")),
	priceGroup("hair-keratin", "Кератин BBone", sectionItems("Кератин BBone")),
];

const maleGroups: PriceGroup[] = [
	priceGroup("men-cuts", "Стрижки", matchingItems(["Услуги для МУЖЧИН"], /стрижк/iu)),
	priceGroup("men-brows", "Брови", [liveMaleBrow]),
	priceGroup("men-manicure", "Маникюр", [
		...matchingItems(["Услуги для МУЖЧИН"], /маникюр/iu),
		...liveMaleItems.filter((item) => /маникюр/iu.test(item.name)),
	]),
	priceGroup("men-pedicure", "Педикюр", matchingItems(["Услуги для МУЖЧИН"], /педикюр/iu)),
];

export const serviceCategories: ServiceCategory[] = [
	{
		id: "bonuses",
		label: "Бонусы и подарки",
		image: "/images/services/manicure.jpg",
		heroImage: "/images/services/manicure.jpg",
		heroAlt: "Уход за ногтями",
		priceGroups: bonusGroups,
	},
	{
		id: "brows",
		label: "Брови",
		image: "/images/services/brows-portrait.png",
		heroImage: "/images/services/brows-portrait.png",
		heroAlt: "Аккуратные брови",
		priceGroups: browGroups,
	},
	{
		id: "lashes",
		label: "Ресницы",
		image: "/images/services/lashes.jpg",
		heroImage: "/images/services/lashes.jpg",
		heroAlt: "Ухоженные ресницы",
		priceGroups: lashGroups,
	},
	{
		id: "manicure",
		label: "Маникюр",
		image: "/images/services/manicure-closeup.png",
		heroImage: "/images/services/manicure-closeup.png",
		heroAlt: "Нежный маникюр",
		priceGroups: manicureGroups,
	},
	{
		id: "pedicure",
		label: "Педикюр",
		image: "/images/services/pedicure-spa.png",
		heroImage: "/images/services/pedicure-spa.png",
		heroAlt: "Аккуратный педикюр",
		priceGroups: pedicureGroups,
	},
	{
		id: "coverage-design",
		label: "Покрытие\\Дизайн",
		image: "/images/services/manicure.jpg",
		heroImage: "/images/services/manicure.jpg",
		heroAlt: "Покрытие и дизайн ногтей",
		priceGroups: coverageGroups,
	},
	{
		id: "extensions",
		label: "Наращивание ногтей",
		image: "/images/services/manicure-closeup.png",
		heroImage: "/images/services/manicure-closeup.png",
		heroAlt: "Наращивание ногтей",
		priceGroups: extensionGroups,
	},
	{
		id: "hair",
		label: "Волосы",
		image: "/images/services/hair-care.png",
		heroImage: "/images/services/hair-care.png",
		heroAlt: "Уход за волосами",
		priceGroups: hairGroups,
	},
	{
		id: "men",
		label: "Услуги для мужчин",
		image: "/images/services/manicure.jpg",
		heroImage: "/images/services/manicure.jpg",
		heroAlt: "Услуги для мужчин",
		priceGroups: maleGroups,
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
