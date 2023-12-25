import {
	ItemView,
	MarkdownRenderer,
	TFile,
	WorkspaceLeaf,
	moment
} from "obsidian";
import { getDailyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";
import { dailyNotesStore } from "ui/stores";

export const VIEW_TYPE = "super-scratchpad";

export class SideTrayView extends ItemView {

	private timer: NodeJS.Timeout | null = null;
	private today: moment.Moment;

	private baseContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.onFileModified = this.onFileModified.bind(this);
		this.openSelectedDayNoteInRootLeaf = this.openSelectedDayNoteInRootLeaf.bind(this);
		this.registerEvent(this.app.vault.on("modify", this.onFileModified));
		this.today = moment();
		this.baseContainer = document.createElement('div');
		this.baseContainer.id = "super-scratchpad"
		this.containerEl.empty();
		this.containerEl.appendChild(this.baseContainer)
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Super Scratchpad";
	}

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

		this.mergeAllDailyNotesAndDisplay();
	}

	async onOpen(): Promise<void> {
		this.mergeAllDailyNotesAndDisplay();
	}

	private async mergeAllDailyNotesAndDisplay() {
		this.baseContainer.empty();

		const mergedDailyNotes = await this.mergeAllDailyNotes();

		MarkdownRenderer.render(this.app, mergedDailyNotes, this.baseContainer, "", this);

		this.attachOnClickEventHandlerToDateLinks();
	}

	private async mergeAllDailyNotes() {
		dailyNotesStore.reindex();
		const allNotes: Record<string, TFile> = get(dailyNotesStore);
		const allMoments: moment.Moment[] = Object.keys(allNotes).map(k => k.replace(/^day-/i, '')).map(v => moment(v));

		var headingsAndNotesForEachDay: string[] = [];
		for (const thatMoment of allMoments) {
			const thatDatesNote = getDailyNote(thatMoment, allNotes);
			const thatDatesData = await this.app.vault.adapter.read(thatDatesNote.path);
			headingsAndNotesForEachDay.push(`# [${thatMoment.format("DD.MM.YYYY")}](${thatMoment.format("DD.MM.YYYY")})\n`);
			headingsAndNotesForEachDay.push(thatDatesData + '\n');
		}

		const headingAndContentPairs: string[] = [];
		for (var i = 0; i < headingsAndNotesForEachDay.length; i += 2) {
			const headingAndContentPair = headingsAndNotesForEachDay.slice(i, i + 2).join('\n');
			headingAndContentPairs.push(headingAndContentPair);
		}

		const mergedDailyNotes = headingAndContentPairs.join('\n---\n');
		return mergedDailyNotes;
	}

	private attachOnClickEventHandlerToDateLinks() {
		const dateLinks = document.querySelectorAll('#super-scratchpad h1>a.internal-link');

		dateLinks.forEach((link: HTMLAnchorElement) => {
			link.addEventListener('click', this.openSelectedDayNoteInRootLeaf);
		});
	}

	private async openSelectedDayNoteInRootLeaf(event: MouseEvent) {
		const tFile = this.getTFileForClickedNote(event);
		if (tFile == null) return
		this.openTFileInRootLeaf(tFile)
	}

	private getTFileForClickedNote(event: MouseEvent): TFile | null {
		const element = event.target as HTMLAnchorElement;
		const noteName: string | null = element.getAttribute('href');
		const path = 'Journal/' + noteName + '.md';
		return this.app.vault.getAbstractFileByPath(path) as TFile | null;
	}

	private async openTFileInRootLeaf(tFile: TFile) {
		const newLeaf: WorkspaceLeaf = this.app.workspace.getLeaf(true);
		await newLeaf.setViewState({ type: "tab", active: true });
		newLeaf.openFile(tFile)
		this.app.workspace.revealLeaf(newLeaf)
	}

	async onClose() {
		console.log("Closed");
		// Nothing to clean up.
	}
}
