import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { Home } from "#/components/pages/home";
import { getNavigationLinks } from "#/lib/portal";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(csrf());

app.get("/", async (c) => {
	const navigationLinks = await getNavigationLinks();
	return c.html(<Home navigationLinks={navigationLinks} />);
});

export default app;
