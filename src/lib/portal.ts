import z from "zod";

const PORTAL_URL = "https://nichiyobuild.com";

const navigationLinkSchema = z.object({
	path: z.string(),
	title: z.string(),
});
const navigationLinksSchema = z.array(navigationLinkSchema);

export type NavigationLink = z.infer<typeof navigationLinkSchema>;

export async function getNavigationLinks() {
	try {
		const response = await fetch(`${PORTAL_URL}/api/navigation-links`);
		const parsed = navigationLinksSchema.parse(await response.json());
		return parsed;
	} catch (error) {
		console.error(error);
	}
}
