import type { APIRoute } from "astro";
import {
	articlePath,
	blogArticles,
	blogCategories,
	blogCategoryPath,
	blogCategoryTotalPages,
	blogPagePath,
	totalBlogPages,
} from "../data/blog";

const siteUrl = "https://nailsprofi.ru";
const staticPaths = ["/", "/services", "/portfolio", "/sertifikaty_abonementy", "/blog"];

function escapeXml(value: string) {
	return value.replace(/[<>&'\"]/g, (character) => ({
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;",
		"'": "&apos;",
		'"': "&quot;",
	})[character]!);
}

export const GET: APIRoute = () => {
	const paths = [...staticPaths];

	for (let page = 2; page <= totalBlogPages; page += 1) {
		paths.push(blogPagePath(page));
	}

	for (const category of blogCategories.filter(({ slug }) => slug !== "all")) {
		const totalPages = blogCategoryTotalPages(category.slug);
		for (let page = 1; page <= totalPages; page += 1) {
			paths.push(blogCategoryPath(category.slug, page));
		}
	}

	for (const article of blogArticles) {
		paths.push(articlePath(article));
	}

	const urls = paths
		.map((path) => `\t<url><loc>${escapeXml(new URL(path, siteUrl).href)}</loc></url>`)
		.join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8" } },
	);
};
