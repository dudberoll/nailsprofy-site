import articles from "./blogArticles.json";

export const POSTS_PER_PAGE = 24;

export const blogCategories = [
	{ slug: "all", label: "Все" },
	{ slug: "sovety", label: "Советы" },
	{ slug: "manikyur", label: "Маникюр" },
	{ slug: "pedikyur", label: "Педикюр" },
	{ slug: "volosy", label: "Волосы" },
	{ slug: "brovi", label: "Брови" },
] as const;

export type BlogCategorySlug = (typeof blogCategories)[number]["slug"];
export type BlogCategory = Exclude<(typeof blogCategories)[number]["label"], "Все">;

export const blogCardImages = [
	"/images/blog/nude-manicure.png",
	"/images/blog/manicure-care.png",
	"/images/blog/french-manicure.png",
	"/images/blog/nail-inspiration.png",
];

export type BlogArticle = {
	id: string;
	wp_id: number;
	slug: string;
	url: string;
	date: string;
	category: BlogCategory;
	title: string;
	text: string;
	readingTime: string;
	body: string[];
	tips: string[];
};

export const blogArticles = (articles as BlogArticle[])
	.filter((article) => article.slug && article.title && article.body.length)
	.toSorted((a, b) => b.date.localeCompare(a.date));

export const totalBlogPages = Math.ceil(blogArticles.length / POSTS_PER_PAGE);

export function blogPagePath(page: number) {
	return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
	return blogCategories.some((category) => category.slug === value);
}

export function blogCategoryPath(category: BlogCategorySlug, page = 1) {
	if (category === "all") return blogPagePath(page);

	return page <= 1 ? `/blog/category/${category}` : `/blog/category/${category}/page/${page}`;
}

export function categoryLabel(category: BlogCategorySlug) {
	return blogCategories.find((item) => item.slug === category)?.label ?? "Все";
}

export function articlePath(article: Pick<BlogArticle, "slug">) {
	return `/blog/${article.slug}`;
}

export function formatBlogDate(date: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(`${date.replace(" ", "T")}Z`));
}

export function blogPageArticles(page: number) {
	const start = (page - 1) * POSTS_PER_PAGE;
	return blogArticles.slice(start, start + POSTS_PER_PAGE);
}

export function blogCategoryArticles(category: BlogCategorySlug) {
	if (category === "all") return blogArticles;

	const label = categoryLabel(category);
	return blogArticles.filter((article) => article.category === label);
}

export function blogCategoryPageArticles(category: BlogCategorySlug, page: number) {
	const start = (page - 1) * POSTS_PER_PAGE;
	return blogCategoryArticles(category).slice(start, start + POSTS_PER_PAGE);
}

export function blogCategoryTotalPages(category: BlogCategorySlug) {
	return Math.ceil(blogCategoryArticles(category).length / POSTS_PER_PAGE);
}
