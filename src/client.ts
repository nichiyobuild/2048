type Board = number[][];
type Direction = "up" | "down" | "left" | "right";

const SIZE = 4;
const BEST_SCORE_KEY = "nenrin2048-best-score";
const SWIPE_THRESHOLD = 24;

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
	2: { bg: "#E8DCC8", text: "#3A2A18" },
	4: { bg: "#DDCBA8", text: "#3A2A18" },
	8: { bg: "#CBAE7D", text: "#3A2A18" },
	16: { bg: "#C79A5B", text: "#3A2A18" },
	32: { bg: "#C68547", text: "#F5EDDD" },
	64: { bg: "#BA6F3B", text: "#F5EDDD" },
	128: { bg: "#A8592F", text: "#F5EDDD" },
	256: { bg: "#955228", text: "#F5EDDD" },
	512: { bg: "#7C4225", text: "#F5EDDD" },
	1024: { bg: "#63321D", text: "#F5EDDD" },
	2048: { bg: "#4A2416", text: "#F5EDDD" },
};
const TILE_COLOR_OVER_2048 = { bg: "#33190E", text: "#F5EDDD" };

function getTileColor(value: number) {
	return TILE_COLORS[value] ?? TILE_COLOR_OVER_2048;
}

function fontSizeClass(value: number): string {
	const digits = String(value).length;
	if (digits <= 2) return "text-3xl";
	if (digits === 3) return "text-2xl";
	if (digits === 4) return "text-xl";
	return "text-base";
}

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getRequiredElement(id: string): HTMLElement {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Element #${id} not found`);
	return el;
}

function createEmptyBoard(): Board {
	return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneBoard(board: Board): Board {
	return board.map((row) => row.slice());
}

function emptyCells(board: Board): Array<[number, number]> {
	const cells: Array<[number, number]> = [];
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			if (board[r][c] === 0) cells.push([r, c]);
		}
	}
	return cells;
}

function addRandomTile(board: Board): [number, number] | null {
	const cells = emptyCells(board);
	if (cells.length === 0) return null;
	const [r, c] = cells[Math.floor(Math.random() * cells.length)];
	board[r][c] = Math.random() < 0.9 ? 2 : 4;
	return [r, c];
}

function slideLine(line: number[]): {
	line: number[];
	scoreGained: number;
	merged: Set<number>;
} {
	const filtered = line.filter((v) => v !== 0);
	const result: number[] = [];
	const merged = new Set<number>();
	let scoreGained = 0;
	let i = 0;
	while (i < filtered.length) {
		if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
			const value = filtered[i] * 2;
			result.push(value);
			merged.add(result.length - 1);
			scoreGained += value;
			i += 2;
		} else {
			result.push(filtered[i]);
			i += 1;
		}
	}
	while (result.length < SIZE) result.push(0);
	return { line: result, scoreGained, merged };
}

function applyMove(
	board: Board,
	direction: Direction,
): {
	board: Board;
	scoreGained: number;
	moved: boolean;
	mergedCells: Array<[number, number]>;
} {
	const newBoard = cloneBoard(board);
	let scoreGained = 0;
	let moved = false;
	const mergedCells: Array<[number, number]> = [];
	const reversed = direction === "right" || direction === "down";
	const horizontal = direction === "left" || direction === "right";

	for (let idx = 0; idx < SIZE; idx++) {
		let line: number[] = horizontal
			? newBoard[idx].slice()
			: [0, 1, 2, 3].map((r) => newBoard[r][idx]);

		if (reversed) line = line.slice().reverse();

		const { line: resultLine, scoreGained: gained, merged } = slideLine(line);
		scoreGained += gained;

		const finalLine = reversed ? resultLine.slice().reverse() : resultLine;
		const mergedIndices = reversed
			? new Set([...merged].map((i) => SIZE - 1 - i))
			: merged;

		for (let pos = 0; pos < SIZE; pos++) {
			const value = finalLine[pos];
			const r = horizontal ? idx : pos;
			const c = horizontal ? pos : idx;
			if (newBoard[r][c] !== value) moved = true;
			newBoard[r][c] = value;
			if (mergedIndices.has(pos)) mergedCells.push([r, c]);
		}
	}

	return { board: newBoard, scoreGained, moved, mergedCells };
}

function hasWinningTile(board: Board): boolean {
	return board.some((row) => row.some((v) => v >= 2048));
}

function canMove(board: Board): boolean {
	if (emptyCells(board).length > 0) return true;
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const value = board[r][c];
			if (c + 1 < SIZE && board[r][c + 1] === value) return true;
			if (r + 1 < SIZE && board[r + 1][c] === value) return true;
		}
	}
	return false;
}

class Game {
	board: Board = createEmptyBoard();
	score = 0;
	best = 0;
	isGameOver = false;
	hasAnnouncedWin = false;
	isOverlayVisible = false;

	boardCellsEl = getRequiredElement("board-cells");
	tileLayerEl = getRequiredElement("tile-layer");
	scoreEl = getRequiredElement("score");
	bestScoreEl = getRequiredElement("best-score");
	loseScoreEl = getRequiredElement("lose-score");
	winOverlayEl = getRequiredElement("win-overlay");
	loseOverlayEl = getRequiredElement("lose-overlay");

	constructor() {
		this.best = this.loadBest();
		this.updateScoreDisplay();
		this.start();
		this.bindEvents();
	}

	loadBest(): number {
		try {
			const raw = window.localStorage.getItem(BEST_SCORE_KEY);
			return raw ? parseInt(raw, 10) || 0 : 0;
		} catch {
			return 0;
		}
	}

	saveBest() {
		try {
			window.localStorage.setItem(BEST_SCORE_KEY, String(this.best));
		} catch {
			// localStorageが使えない環境では無視する
		}
	}

	start() {
		this.board = createEmptyBoard();
		this.score = 0;
		this.isGameOver = false;
		this.hasAnnouncedWin = false;
		this.isOverlayVisible = false;
		this.hideOverlays();
		addRandomTile(this.board);
		addRandomTile(this.board);
		this.updateScoreDisplay();
		this.renderBoard(new Set(), new Set());
	}

	updateScoreDisplay() {
		this.scoreEl.textContent = String(this.score);
		this.bestScoreEl.textContent = String(this.best);
	}

	hideOverlays() {
		this.winOverlayEl.classList.add("hidden");
		this.winOverlayEl.classList.remove("flex");
		this.loseOverlayEl.classList.add("hidden");
		this.loseOverlayEl.classList.remove("flex");
	}

	showWinOverlay() {
		this.winOverlayEl.classList.remove("hidden");
		this.winOverlayEl.classList.add("flex");
		this.isOverlayVisible = true;
	}

	showLoseOverlay() {
		this.loseScoreEl.textContent = String(this.score);
		this.loseOverlayEl.classList.remove("hidden");
		this.loseOverlayEl.classList.add("flex");
		this.isOverlayVisible = true;
	}

	renderBoard(mergedCells: Set<string>, newTileCells: Set<string>) {
		this.tileLayerEl.innerHTML = "";
		const reduceMotion = prefersReducedMotion();

		for (let r = 0; r < SIZE; r++) {
			for (let c = 0; c < SIZE; c++) {
				const value = this.board[r][c];
				if (value === 0) continue;

				const key = `${r},${c}`;
				const tile = document.createElement("div");
				tile.className = `flex items-center justify-center rounded-lg font-mono font-bold select-none ${fontSizeClass(value)}`;
				tile.style.gridColumnStart = String(c + 1);
				tile.style.gridRowStart = String(r + 1);

				const colors = getTileColor(value);
				tile.style.backgroundColor = colors.bg;
				tile.style.color = colors.text;
				tile.textContent = String(value);

				if (value >= 2048) tile.classList.add("tile-2048-glow");

				if (!reduceMotion) {
					if (newTileCells.has(key)) tile.classList.add("tile-appear");
					else if (mergedCells.has(key)) tile.classList.add("tile-pop");
				}

				this.tileLayerEl.appendChild(tile);
			}
		}
	}

	move(direction: Direction) {
		if (this.isGameOver || this.isOverlayVisible) return;

		const { board, scoreGained, moved, mergedCells } = applyMove(
			this.board,
			direction,
		);
		if (!moved) return;

		this.board = board;
		this.score += scoreGained;
		if (this.score > this.best) {
			this.best = this.score;
			this.saveBest();
		}

		const newTileCell = addRandomTile(this.board);
		const mergedSet = new Set(mergedCells.map(([r, c]) => `${r},${c}`));
		const newTileSet = new Set(
			newTileCell ? [`${newTileCell[0]},${newTileCell[1]}`] : [],
		);

		this.updateScoreDisplay();
		this.renderBoard(mergedSet, newTileSet);

		if (!this.hasAnnouncedWin && hasWinningTile(this.board)) {
			this.hasAnnouncedWin = true;
			this.showWinOverlay();
			return;
		}

		if (!canMove(this.board)) {
			this.isGameOver = true;
			this.showLoseOverlay();
		}
	}

	keepGoing() {
		this.winOverlayEl.classList.add("hidden");
		this.winOverlayEl.classList.remove("flex");
		this.isOverlayVisible = false;
	}

	bindEvents() {
		const KEY_TO_DIRECTION: Record<string, Direction> = {
			ArrowUp: "up",
			ArrowDown: "down",
			ArrowLeft: "left",
			ArrowRight: "right",
		};

		window.addEventListener("keydown", (e) => {
			const direction = KEY_TO_DIRECTION[e.key];
			if (!direction) return;
			e.preventDefault();
			this.move(direction);
		});

		const boardWrap = getRequiredElement("board-wrap");
		let touchStartX = 0;
		let touchStartY = 0;

		boardWrap.addEventListener(
			"touchstart",
			(e) => {
				const touch = e.changedTouches[0];
				touchStartX = touch.clientX;
				touchStartY = touch.clientY;
			},
			{ passive: true },
		);

		boardWrap.addEventListener(
			"touchmove",
			(e) => {
				e.preventDefault();
			},
			{ passive: false },
		);

		boardWrap.addEventListener(
			"touchend",
			(e) => {
				const touch = e.changedTouches[0];
				const dx = touch.clientX - touchStartX;
				const dy = touch.clientY - touchStartY;
				const absDx = Math.abs(dx);
				const absDy = Math.abs(dy);

				if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

				if (absDx > absDy) {
					this.move(dx > 0 ? "right" : "left");
				} else {
					this.move(dy > 0 ? "down" : "up");
				}
			},
			{ passive: true },
		);

		document.getElementById("reset-button")?.addEventListener("click", () => {
			this.start();
		});
		document
			.getElementById("win-restart-button")
			?.addEventListener("click", () => {
				this.start();
			});
		document
			.getElementById("lose-restart-button")
			?.addEventListener("click", () => {
				this.start();
			});
		document
			.getElementById("keep-going-button")
			?.addEventListener("click", () => {
				this.keepGoing();
			});
	}
}

new Game();
