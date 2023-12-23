import {
	ItemView,
	MarkdownRenderer,
	TFile,
	WorkspaceLeaf,
	moment,
} from "obsidian";
import { getDailyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";
import { dailyNotes } from "ui/stores";


export const VIEW_TYPE = "super-scratchpad";
let timer: NodeJS.Timeout | null = null;

export class SideTrayView extends ItemView {

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.onFileModified = this.onFileModified.bind(this);
		this.registerEvent(this.app.vault.on("modify", this.onFileModified));

		this.registerDomEvent(window, "keydown", () => {
			console.log("asd");
		})
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Super Scratchpad";
	}

	private async onFileModified(file: TFile): Promise<void> {

		if (file.parent?.path != "Journal") return;

		if (timer) {
			clearTimeout(timer);
			timer = null;
		}

		timer = setTimeout(() => {
			console.log("Performing operations after delay...");
		}, 200);
		// console.log(`Modified file : ${file}`);
		// console.log(file);



		if (this.containerEl) this.containerEl.empty();

		dailyNotes.reindex();
		const allDailyNotes = get(dailyNotes);
		const today = moment();
		const todayNote = getDailyNote(today, allDailyNotes);
		const compactedData = await this.app.vault.adapter.read(todayNote.path);

		MarkdownRenderer.render(
			this.app,
			compactedData,
			this.containerEl,
			todayNote.path,
			this
		);
	}

	async onOpen(): Promise<void> {
		console.log(this);

		dailyNotes.reindex();

		const allDailyNotes = get(dailyNotes);
		const today = moment();
		const todayNote = getDailyNote(today, allDailyNotes);
		const compactedData = await this.app.vault.adapter.read(todayNote.path);

		this.containerEl.empty();

		MarkdownRenderer.render(
			this.app,
			compactedData,
			this.containerEl,
			todayNote.path,
			this
		);
	}

	async onClose() {
		console.log("Closed");
		// Nothing to clean up.
	}
}
