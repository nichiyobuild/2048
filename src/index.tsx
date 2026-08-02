import { Hono } from "hono";
import { Home } from "#/components/pages/home";

const app = new Hono();

app.get("/", (c) => c.html(<Home />));

export default app;
