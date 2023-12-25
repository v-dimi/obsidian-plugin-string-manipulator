import { log } from "console";
import {
	ItemView,
	MarkdownRenderer,
	TFile,
	WorkspaceLeaf,
	moment,
} from "obsidian";
import { getAllWeeklyNotes, getDailyNote, getDateUID } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";
import { dailyNotesStore } from "ui/stores";


export const VIEW_TYPE = "super-scratchpad";
let timer: NodeJS.Timeout | null = null;

export class SideTrayView extends ItemView {

	private today;

	private baseContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		console.log("After super");
		
		this.onFileModified = this.onFileModified.bind(this);
		this.registerEvent(this.app.vault.on("modify", this.onFileModified));
		this.today = moment();
		this.baseContainer = document.createElement('div');
		this.baseContainer.id = "super-scratchpad"
		this.containerEl.empty();
		this.containerEl.appendChild(this.baseContainer)	
		console.log("Called constructor");
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Super Scratchpad";
	}

	private timer: NodeJS.Timeout | null = null; // Define timer at class level

	private async onFileModified(file: TFile): Promise<void> {

		if (file.parent?.path != "Journal") return;

		if (this.timer) {
			clearTimeout(this.timer); // Clear the existing timer if it's set
			this.timer = null;
		}

		this.timer = setTimeout(() => {
			console.log("Performing operations after delay...");
			// Place operations that you want to perform after the delay here
		}, 1000);

		this.renderAllData();
	}

	async onOpen(): Promise<void> {
		this.renderAllData();
	}

	async renderAllData() {
		dailyNotesStore.reindex();
		const allNotes: Record<string, TFile> = get(dailyNotesStore);
		const todayNote: TFile = getDailyNote(this.today, allNotes);
		const allMoments = Object.keys(allNotes).map(k => k.replace(/^day-/i, '')).map(v => moment(v));

		console.log(allNotes);

		var trayData: string[] = [];
		for (const thatMoment of allMoments) {
			const thatDatesNote = getDailyNote(thatMoment, allNotes);
			const thatDatesData = await this.app.vault.adapter.read(thatDatesNote.path);
			trayData.push(`# ${thatMoment.format("DD.MM.YYYY")}[Go](${thatMoment.format("DD.MM.YYYY")})\n`)
			trayData.push(thatDatesData + '\n');
		}

		const pairs: string[] = [];
		for (let i = 0; i < trayData.length; i += 2) {
			const pair = trayData.slice(i, i + 2).join('\n');
			pairs.push(pair);
		}

		const result = pairs.join('\n---\n');

		this.baseContainer.empty();

		MarkdownRenderer.render(
			this.app,
			result,
			this.baseContainer,
			todayNote.path,
			this
		);
	}

	async onClose() {
		console.log("Closed");
		// Nothing to clean up.
	}
}
