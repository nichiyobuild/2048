import type { Child } from "hono/jsx";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";
import { type NavigationLink, PORTAL_URL } from "#/lib/portal";

type Props = {
	children: Child;
	navigationLinks?: NavigationLink[];
};

export function Layout({ children, navigationLinks }: Props) {
	return (
		<html lang="ja">
			<head>
				<meta charset="utf-8" />
				<meta
					content="width=device-width, initial-scale=1, maximum-scale=1"
					name="viewport"
				/>
				<title>年輪 2048</title>
				<meta
					content="同じ数字のタイルを重ねて、年輪のように育てよう"
					name="description"
				/>
				<Link href="/src/style.css" rel="stylesheet" />
				<ViteClient />
				<Script src="/src/client.ts" type="module" />
			</head>
			<body class="page-gradient bg-slate-950 font-sans text-ink">
				<div class="flex min-h-svh flex-col">
					<main class="mx-auto flex-1 px-4">{children}</main>
					<Footer navigationLinks={navigationLinks} />
				</div>
			</body>
		</html>
	);
}

type FooterProps = {
	navigationLinks?: NavigationLink[];
};

function Footer({ navigationLinks }: FooterProps) {
	return (
		<footer class="flex flex-wrap justify-end gap-x-4 gap-y-2 px-4 py-8 text-sm sm:px-12">
			{navigationLinks?.map((link) => (
				<a class="hover:underline" href={`${PORTAL_URL}${link.path}`}>
					{link.title}
				</a>
			))}
		</footer>
	);
}
