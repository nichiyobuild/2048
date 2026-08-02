import type { Child } from "hono/jsx";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";

/** 2048はサブドメイン運用なので、フッターのリンクはportal側の絶対URLにする。 */
const PORTAL_ORIGIN = "https://nichiyobuild.com";

const FOOTER_LINKS = [
	{ path: "/about", title: "このサイトについて" },
	{ path: "/terms", title: "利用規約" },
	{ path: "/privacy", title: "プライバシーポリシー" },
	{ path: "/legal", title: "特定商取引法に基づく表記" },
	{ path: "/contact", title: "お問い合わせ" },
] as const;

type Props = {
	children: Child;
};

export function Layout({ children }: Props) {
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
					<Footer />
				</div>
			</body>
		</html>
	);
}

function Footer() {
	return (
		<footer class="flex flex-wrap justify-end gap-x-4 gap-y-2 px-4 py-8 text-sm sm:px-12">
			{FOOTER_LINKS.map((link) => (
				<a class="hover:underline" href={`${PORTAL_ORIGIN}${link.path}`}>
					{link.title}
				</a>
			))}
		</footer>
	);
}
