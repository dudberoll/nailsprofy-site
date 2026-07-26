export interface PortfolioItem {
	image: string;
	width: number;
	height: number;
	date: string;
	procedure: string;
	alt: string;
}

export const portfolioItems: PortfolioItem[] = [
	{
		image: "/images/portfolio/blue-manicure.jpg",
		width: 625,
		height: 469,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр, выравнивание, покрытие и дизайн",
		alt: "Синий маникюр с прозрачными лунками и белыми акцентами",
	},
	{
		image: "/images/portfolio/portrait-design.jpg",
		width: 625,
		height: 625,
		date: "2018-11-23",
		procedure: "Коррекция ногтей и портретный дизайн",
		alt: "Светло-розовый маникюр с портретным дизайном",
	},
	{
		image: "/images/portfolio/classic-french.jpg",
		width: 625,
		height: 781,
		date: "2018-11-23",
		procedure: "Коррекция ногтей и французское покрытие",
		alt: "Классический французский маникюр миндалевидной формы",
	},
	{
		image: "/images/portfolio/glitter-almond.jpg",
		width: 625,
		height: 645,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр, покрытие и дизайн",
		alt: "Светлый миндалевидный маникюр с серебряным глиттером",
	},
	{
		image: "/images/portfolio/short-nails.jpg",
		width: 625,
		height: 618,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр и однотонное покрытие",
		alt: "Однотонный сиреневый маникюр на коротких ногтях",
	},
	{
		image: "/images/portfolio/almond-design.jpg",
		width: 381,
		height: 366,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр, покрытие и дизайн",
		alt: "Светлый миндалевидный маникюр с геометрическим акцентом",
	},
	{
		image: "/images/portfolio/red-manicure.jpg",
		width: 625,
		height: 489,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр и однотонное покрытие",
		alt: "Красный однотонный маникюр на коротких ногтях",
	},
	{
		image: "/images/portfolio/gray-manicure.jpg",
		width: 625,
		height: 625,
		date: "2018-11-23",
		procedure: "Аппаратный маникюр и покрытие",
		alt: "Серый маникюр с контрастным узором",
	},
	{
		image: "/images/portfolio/glitter-design.jpg",
		width: 625,
		height: 625,
		date: "2018-11-23",
		procedure: "Коррекция ногтей, покрытие и дизайн",
		alt: "Чёрный маникюр с серебряным дизайном и глиттером",
	},
	{
		image: "/images/portfolio/red-design.jpg",
		width: 625,
		height: 781,
		date: "2018-11-23",
		procedure: "Маникюр, покрытие и дизайн",
		alt: "Красный маникюр с золотыми акцентами",
	},
];

const portfolioDateFormatter = new Intl.DateTimeFormat("ru-RU", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

export const formatPortfolioDate = (date: string) =>
	portfolioDateFormatter.format(new Date(`${date}T00:00:00Z`));
