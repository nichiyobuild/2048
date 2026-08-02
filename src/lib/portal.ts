import z from "zod";

export const PORTAL_URL = "https://nichiyobuild.com";

const navigationLinkSchema = z.object({
	title: z.string(),
	url: z.url(),
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
