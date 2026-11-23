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

const normalizeServiceName = (name: string) => name.replace(/[ \t]{2,}/g, " ").trim();

const sectionItems = (...sectionNames: string[]) =>
	sectionNames.flatMap(
		(sectionName) => sourceSections.find((section) => section.name === sectionName)?.items ?? [],
	);

const matchingItems = (sectionNames: string[], pattern: RegExp) =>
	sectionItems(...sectionNames).filter((item) => pattern.test(item.name));

const shortServiceDescriptions: Record<string, string> = {
	"30675354": "Для клиентов, которые уже ходят к нам на услуги и пока не выбрали своего бровиста в студии. Запишитесь на основную услугу, а коррекцию бровей добавим в подарок.",
	"15371415": "В будни с 12:00 до 15:00 при записи на маникюр с покрытием гель лак, снятие старого покрытия будет в подарок. Удобный вариант, если хотите обновить покрытие в спокойное время дня. Не суммируется с акциями и скидками.",
	"15371759": "С 12:00 до 15:00 комплекс для бровей стоит на 400 ₽ меньше. В услугу входят ламинирование бровей, окрашивание, коррекция и ботокс для аккуратной формы и ухоженного вида. Не суммируется с акциями и скидками.",
	"30056808": "Акция, не отдельная услуга. В разделе «Пилочный маникюр» выберите вариант с покрытием или без. В комментарии напишите «первый пилочный маникюр». Администратор применит бонус 500 ₽. Работаем пилками Japure. Не суммируется с акциями и скидками.",
	"15443402": "Скидка 15% на все услуги студии в честь дня рождения. Действует 7 дней до даты рождения, в сам день рождения и 7 дней после.",
	"23495742": "Порекомендуйте наш салон красоты маме, подруге или коллеге. Когда гость впервые придет по вашей рекомендации и назовет ваш номер телефона, начислим вам 1000 бонусов. 1 бонус = 1 ₽. Условия начисления и использования уточнит администратор.",
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
	priceGroup("bonus-happy-hours", "Счастливые часы", sectionItems("Счастливые часы")),
	priceGroup("bonus-gifts", "Дарим подарки!", sectionItems("Дарим подарки!")),
];

const browGroups: PriceGroup[] = [
	priceGroup("brows-services", "Брови", sectionItems("Брови"), { showInSubcategoryNav: false }),
];

const lashGroups: PriceGroup[] = [
	priceGroup("lashes-services", "Ресницы", sectionItems("Ресницы"), { showInSubcategoryNav: false }),
];

const manicureGroups: PriceGroup[] = [
	priceGroup("manicure-bonding", "Бондирование ногтей", sectionItems("Бондирование ногтей")),
	priceGroup("manicure-coverage", "Маникюр с покрытием", [
		...sectionItems("Маникюр с покрытием"),
		...sectionItems("Модели"),
	]),
	priceGroup("manicure-coverage-top", "Маникюр с покрытием ТОП-мастер", sectionItems("Маникюр с покрытием ТОП-мастер")),
	priceGroup("manicure-file", "Пилочный маникюр", sectionItems("Пилочный маникюр")),
	priceGroup("manicure-express", "ЭКСПРЕСС маникюр", sectionItems("ЭКСПРЕСС маникюр")),
	priceGroup(
		"manicure-express-top",
		"ЭКСПРЕСС маникюр ТОП-мастер",
		sectionItems("ЭКСПРЕСС маникюр ТОП-мастер"),
	),
	priceGroup("manicure-without-coverage", "Маникюр без покрытия", sectionItems("Маникюр без покрытия")),
	priceGroup(
		"manicure-without-coverage-top",
		"Маникюр без покрытия ТОП-мастер",
		sectionItems("Маникюр без покрытия ТОП-мастер"),
	),
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
	priceGroup("pedicure-without-coverage", "Педикюр без покрытия", [
		...sectionItems("Педикюр без покрытия"),
		...sectionItems("Педикюр без покрытия ТОП-мастер"),
	]),
	priceGroup("pedicure-podology", "Подология", sectionItems("Подология")),
];

const coverageGroups: PriceGroup[] = [
	priceGroup("coverage-design-services", "Покрытие\\Дизайн", sectionItems("Покрытие\\Дизайн"), {
		showInSubcategoryNav: false,
	}),
];

const extensionGroups: PriceGroup[] = [
	priceGroup("extension-gel", "Наращивание гель", [
		...sectionItems("Наращивание ногтей ГЕЛЬ"),
		...sectionItems("Наращивание ногтей ГЕЛЬ ТОП-мастер"),
	]),
	priceGroup("extension-acrylic", "Наращивание акрил", sectionItems("Наращивание ногтей АКРИЛ")),
	priceGroup("extension-polygel", "Наращивание полигель", [
		...sectionItems("Наращивание ногтей ПОЛИГЕЛЬ"),
		...sectionItems("Наращивание ногтей ПОЛИГЕЛЬ ТОП-мастер"),
	]),
];

const hairGroups: PriceGroup[] = [
	priceGroup("hair-cuts", "Стрижки и укладки", sectionItems("Стрижки и укладки")),
	priceGroup("hair-color", "Окрашивание волос", sectionItems("Окрашивание волос")),
	priceGroup("hair-lightening", "Осветление волос", sectionItems("Осветление волос")),
	priceGroup("hair-spa", "СПА процедуры для волос", sectionItems("СПА процедуры для волос")),
	priceGroup("hair-keratin", "Кератин BBone", sectionItems("Кератин BB Оne")),
];

const maleGroups: PriceGroup[] = [
	priceGroup("men-cuts", "Стрижки", matchingItems(["Услуги для МУЖЧИН"], /стрижк|бород/iu)),
	priceGroup("men-brows", "Брови", matchingItems(["Услуги для МУЖЧИН"], /бров/iu)),
	priceGroup("men-manicure", "Маникюр", matchingItems(["Услуги для МУЖЧИН"], /маникюр/iu)),
	priceGroup("men-pedicure", "Педикюр", matchingItems(["Услуги для МУЖЧИН"], /педикюр/iu)),
];

export const serviceCategories: ServiceCategory[] = [
	{
		id: "bonuses",
		label: "Бонусы и подарки",
		image: "/images/services/manicure.webp",
		heroImage: "/images/services/manicure.webp",
		heroAlt: "Уход за ногтями",
		priceGroups: bonusGroups,
	},
	{
		id: "brows",
		label: "Брови",
		image: "/images/services/brows-portrait.webp",
		heroImage: "/images/services/brows-portrait.webp",
		heroAlt: "Аккуратные брови",
		priceGroups: browGroups,
	},
	{
		id: "lashes",
		label: "Ресницы",
		image: "/images/services/lashes.webp",
		heroImage: "/images/services/lashes.webp",
		heroAlt: "Ухоженные ресницы",
		priceGroups: lashGroups,
	},
	{
		id: "manicure",
		label: "Маникюр",
		image: "/images/services/manicure-closeup.webp",
		heroImage: "/images/services/manicure-closeup.webp",
		heroAlt: "Нежный маникюр",
		priceGroups: manicureGroups,
	},
	{
		id: "pedicure",
		label: "Педикюр",
		image: "/images/services/pedicure-spa.webp",
		heroImage: "/images/services/pedicure-spa.webp",
		heroAlt: "Аккуратный педикюр",
		priceGroups: pedicureGroups,
	},
	{
		id: "coverage-design",
		label: "Покрытие\\Дизайн",
		image: "/images/services/manicure.webp",
		heroImage: "/images/services/manicure.webp",
		heroAlt: "Покрытие и дизайн ногтей",
		priceGroups: coverageGroups,
	},
	{
		id: "extensions",
		label: "Наращивание ногтей",
		image: "/images/services/manicure-closeup.webp",
		heroImage: "/images/services/manicure-closeup.webp",
		heroAlt: "Наращивание ногтей",
		priceGroups: extensionGroups,
	},
	{
		id: "hair",
		label: "Волосы",
		image: "/images/services/hair-care.webp",
		heroImage: "/images/services/hair-care.webp",
		heroAlt: "Уход за волосами",
		priceGroups: hairGroups,
	},
	{
		id: "men",
		label: "Услуги для мужчин",
		image: "/images/services/manicure.webp",
		heroImage: "/images/services/manicure.webp",
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
