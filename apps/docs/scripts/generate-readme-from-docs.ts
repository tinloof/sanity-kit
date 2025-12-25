import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {join} from "node:path";

// Docs to package mapping
const DOCS_TO_PACKAGE: Record<string, string> = {
	"sanity-next": "sanity-next",
	"sanity-web": "sanity-web",
	"sanity-studio": "sanity-studio",
	"sanity-document-options": "sanity-document-options",
	"sanity-document-i18n": "document-i18n",
	"sanity-extends": "extends",
};

// Sections to preserve from existing README
const PRESERVE_SECTIONS = ["License", "Requirements", "Develop & test"];

const ROOT_DIR = join(process.cwd(), "..", "..");
const DOCS_DIR = join(process.cwd(), "content", "docs");

interface Heading {
	level: number; // 2 for ##, 3 for ###
	text: string;
	anchor: string;
}

/**
 * Convert heading text to anchor (lowercase, hyphens)
 */
function textToAnchor(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Strip frontmatter from MDX content
 */
function stripFrontmatter(content: string): string {
	// Remove frontmatter block (--- ... ---)
	const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
	return content.replace(frontmatterRegex, "").trim();
}

/**
 * Convert heading levels: # → ##, ## → ###, etc.
 */
function convertHeadingLevels(content: string, increment: number = 1): string {
	const lines = content.split("\n");
	return lines
		.map((line) => {
			// Match markdown headings
			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
			if (headingMatch) {
				const currentLevel = headingMatch[1].length;
				const newLevel = Math.min(currentLevel + increment, 6);
				const headingText = headingMatch[2];
				return `${"#".repeat(newLevel)} ${headingText}`;
			}
			return line;
		})
		.join("\n");
}

/**
 * Extract headings from content
 */
function extractHeadings(content: string): Heading[] {
	const headings: Heading[] = [];
	const lines = content.split("\n");

	for (const line of lines) {
		const match = line.match(/^(#{2,3})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const text = match[2].trim();
			headings.push({
				level,
				text,
				anchor: textToAnchor(text),
			});
		}
	}

	return headings;
}

/**
 * Generate Table of Contents from headings
 */
function generateTableOfContents(headings: Heading[]): string {
	if (headings.length === 0) {
		return "";
	}

	const toc: string[] = [];
	for (const heading of headings) {
		if (heading.text === "Table of Contents") {
			continue; // Skip TOC itself
		}
		const indent = heading.level === 2 ? "" : "  ";
		toc.push(`${indent}- [${heading.text}](#${heading.anchor})`);
	}

	return toc.join("\n");
}

/**
 * Extract sections from existing README
 */
function extractPreservedSections(readmeContent: string): string {
	const sections: string[] = [];
	const lines = readmeContent.split("\n");
	let currentSection: string[] | null = null;
	let currentSectionName = "";

	for (const line of lines) {
		const headingMatch = line.match(/^##\s+(.+)$/);

		if (headingMatch) {
			// Save previous section if it's one we want to preserve
			if (
				currentSection &&
				PRESERVE_SECTIONS.some(
					(s) => s.toLowerCase() === currentSectionName.toLowerCase(),
				)
			) {
				sections.push(currentSection.join("\n"));
			}

			// Start new section
			currentSectionName = headingMatch[1].trim();
			currentSection = [line];
		} else if (currentSection) {
			currentSection.push(line);
		}
	}

	// Save last section
	if (
		currentSection &&
		PRESERVE_SECTIONS.some(
			(s) => s.toLowerCase() === currentSectionName.toLowerCase(),
		)
	) {
		sections.push(currentSection.join("\n"));
	}

	return sections.join("\n\n");
}

/**
 * Parse index.mdx to extract title, description, and content
 */
function parseIndexMdx(content: string): {
	title: string;
	description: string;
	body: string;
} {
	const stripped = stripFrontmatter(content);
	const lines = stripped.split("\n");

	// Extract title (first # heading)
	let title = "";
	let description = "";
	let bodyStartIndex = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith("# ")) {
			title = line.replace(/^#\s+/, "").trim();
			bodyStartIndex = i + 1;
			// Next non-empty line is description
			for (let j = i + 1; j < lines.length; j++) {
				if (lines[j].trim() && !lines[j].startsWith("#")) {
					description = lines[j].trim();
					bodyStartIndex = j + 1;
					break;
				}
			}
			break;
		}
	}

	const body = lines.slice(bodyStartIndex).join("\n").trim();

	return {title, description, body};
}

/**
 * Parse other MDX files (strip frontmatter and convert headings)
 */
function parseMdxFile(content: string): string {
	const stripped = stripFrontmatter(content);
	// Convert # → ## (since these become top-level sections in README)
	return convertHeadingLevels(stripped, 1);
}

/**
 * Generate README for a package
 */
function generateReadme(docsPath: string, packagePath: string): void {
	const packageDocsDir = join(DOCS_DIR, docsPath);
	const metaJsonPath = join(packageDocsDir, "meta.json");
	const readmePath = join(ROOT_DIR, "packages", packagePath, "README.md");

	if (!existsSync(metaJsonPath)) {
		console.warn(`⚠️  meta.json not found: ${metaJsonPath}`);
		return;
	}

	console.log(`📝 Generating README for ${packagePath}...`);

	// Read meta.json to get page order
	const metaJson = JSON.parse(readFileSync(metaJsonPath, "utf-8"));
	const pages = metaJson.pages || [];

	// Read index.mdx
	const indexPath = join(packageDocsDir, "index.mdx");
	if (!existsSync(indexPath)) {
		console.warn(`⚠️  index.mdx not found: ${indexPath}`);
		return;
	}

	const indexContent = readFileSync(indexPath, "utf-8");
	const {title, description, body: indexBody} = parseIndexMdx(indexContent);

	// Collect all content sections and headings
	const contentSections: string[] = [];
	const allHeadings: Heading[] = [];

	// Add index body (Installation + first section like Quick Start)
	// Extract headings from index body
	const indexHeadings = extractHeadings(indexBody);
	allHeadings.push(...indexHeadings);
	contentSections.push(indexBody);

	// Read and add other pages
	for (const page of pages) {
		if (page === "index") {
			continue;
		}

		const pagePath = join(packageDocsDir, `${page}.mdx`);
		if (!existsSync(pagePath)) {
			console.warn(`⚠️  Page not found: ${pagePath}`);
			continue;
		}

		const pageContent = readFileSync(pagePath, "utf-8");
		const parsedContent = parseMdxFile(pageContent);

		// Extract headings
		const pageHeadings = extractHeadings(parsedContent);
		allHeadings.push(...pageHeadings);

		// Add content
		contentSections.push(parsedContent);
	}

	// Generate Table of Contents
	const toc = generateTableOfContents(allHeadings);

	// Build final README
	const readmeParts: string[] = [];

	// Title and description
	readmeParts.push(`# ${title}`);
	readmeParts.push("");
	readmeParts.push(description);
	readmeParts.push("");

	// Table of Contents
	if (toc) {
		readmeParts.push("## Table of Contents");
		readmeParts.push("");
		readmeParts.push(toc);
		readmeParts.push("");
	}

	// Main content sections
	readmeParts.push(contentSections.join("\n\n"));

	// Preserve License, Requirements, Develop & test from existing README
	if (existsSync(readmePath)) {
		const existingReadme = readFileSync(readmePath, "utf-8");
		const preservedSections = extractPreservedSections(existingReadme);
		if (preservedSections) {
			readmeParts.push("");
			readmeParts.push(preservedSections);
		}
	}

	// Write README
	const finalReadme = readmeParts.join("\n");
	writeFileSync(readmePath, finalReadme, "utf-8");
	console.log(`  ✓ Generated ${readmePath}`);
}

/**
 * Main generation function
 */
function generate(): void {
	console.log("🔄 Generating README files from docs...\n");

	for (const [docsPath, packagePath] of Object.entries(DOCS_TO_PACKAGE)) {
		generateReadme(docsPath, packagePath);
		console.log();
	}

	console.log("✅ Generation complete!");
}

// Run generation
generate();
