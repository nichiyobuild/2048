import { Layout } from "#/components/pages/layout";
import type { NavigationLink } from "#/lib/portal";

type Props = {
	navigationLinks?: NavigationLink[];
};

export function Home({ navigationLinks }: Props) {
	return (
		<Layout navigationLinks={navigationLinks}>
			<div class="flex w-full max-w-105 flex-col gap-5">
				<header class="text-center">
					<h1 class="font-serif text-4xl text-ink tracking-wide">年輪 2048</h1>
					<p class="mt-2 text-ink-dim text-sm">
						同じ数字のタイルを重ねて、年輪のように育てよう
					</p>
				</header>

				<div class="flex items-center justify-between gap-3">
					<div class="flex gap-3">
						<div class="min-w-19 rounded-[10px] border border-panel-edge bg-panel px-4 py-2 text-center">
							<div class="text-ink-dim text-xs">スコア</div>
							<div class="font-bold font-mono text-ink text-xl" id="score">
								0
							</div>
						</div>
						<div class="min-w-19 rounded-[10px] border border-panel-edge bg-panel px-4 py-2 text-center">
							<div class="text-ink-dim text-xs">ベスト</div>
							<div class="font-bold font-mono text-ink text-xl" id="best-score">
								0
							</div>
						</div>
					</div>
					<button
						class="rounded-[10px] border border-panel-edge bg-accent-dark px-4 py-3 font-bold text-ink text-sm transition hover:brightness-110"
						id="reset-button"
						type="button"
					>
						新しく始める
					</button>
				</div>

				<div
					class="rings-bg relative rounded-[14px] border border-panel-edge bg-panel p-3"
					id="board-wrap"
				>
					<div class="grid grid-cols-4 gap-3" id="board-cells">
						{Array.from({ length: 16 }).map((_, index) => (
							<div class="aspect-square rounded-lg bg-cell-empty" key={index} />
						))}
					</div>

					<div
						class="pointer-events-none absolute inset-3 grid grid-cols-4 grid-rows-4 gap-3"
						id="tile-layer"
					/>

					<div
						class="absolute inset-0 z-20 hidden flex-col items-center justify-center gap-4 rounded-[14px] bg-bg-deep/90 p-6 text-center"
						id="win-overlay"
					>
						<h2 class="font-serif text-2xl text-gold">2048 達成!</h2>
						<p class="text-ink-dim text-sm">
							このまま続けて、もっと大きな年輪を育てることもできます。
						</p>
						<div class="flex gap-3">
							<button
								class="rounded-[10px] border border-panel-edge bg-accent px-4 py-2 font-bold text-bg-deep text-sm transition hover:brightness-110"
								id="keep-going-button"
								type="button"
							>
								続ける
							</button>
							<button
								class="rounded-[10px] border border-panel-edge bg-panel px-4 py-2 font-bold text-ink text-sm transition hover:brightness-110"
								id="win-restart-button"
								type="button"
							>
								はじめから
							</button>
						</div>
					</div>

					<div
						class="absolute inset-0 z-20 hidden flex-col items-center justify-center gap-4 rounded-[14px] bg-bg-deep/90 p-6 text-center"
						id="lose-overlay"
					>
						<h2 class="font-serif text-2xl text-ink">これ以上動かせません</h2>
						<p class="text-ink-dim text-sm">
							スコア <span id="lose-score">0</span>{" "}
							でした。もう一度挑戦しましょう。
						</p>
						<button
							class="rounded-[10px] border border-panel-edge bg-accent px-4 py-2 font-bold text-bg-deep text-sm transition hover:brightness-110"
							id="lose-restart-button"
							type="button"
						>
							はじめから
						</button>
					</div>
				</div>

				<p class="text-center text-ink-dim text-xs">
					矢印キー、またはスワイプで操作
				</p>
			</div>
		</Layout>
	);
}
