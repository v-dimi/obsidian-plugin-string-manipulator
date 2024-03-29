import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
	normalizePath,
} from "obsidian";
import { base64Encode } from "scripts/base64Encode";
import { base64Decode } from "scripts/base64Decode";
import { toSnakeCase } from "scripts/snakeCase";
import { toCamelCase } from "scripts/camelCase";
import { formatJSON } from "scripts/formatJson";
import { toUpperCase } from "scripts/upperCase";
import { toLowerCase } from "scripts/lowerCase";
import { hexToAscii } from "scripts/hexToAscii";
import { asciiToHex } from "scripts/asciiToHex";
import { SideTrayView, VIEW_TYPE } from "SideTrayView";
import { toTitleCase } from "scripts/titleCase";

// ! Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

function editorSelectionWrapper(
	editor: Editor,
	stringMutationCallback: (selection: string) => string
) {
	const selection = editor.getSelection();

	const mutatedSelection = stringMutationCallback(selection);

	editor.replaceSelection(mutatedSelection);
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {

		await this.loadSettings();

		this.registerView(VIEW_TYPE, (leaf) => new SideTrayView(leaf));

		this.addRibbonIcon("dice", "Activate view", () => {
			this.activateView();
		});

		this.addStringManipulatorCommands();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	private addNavigationCommands() {
		this.addCommand({
			id: "open-todos",
			name: "Open Todo File",
			editorCallback(editor) {
				const leaf = this.app.workspace.getRightLeaf();
				const path = normalizePath("ToDo.md");
				const file = this.app.workspace.getAbstractFileByPath(path);
			},
		});
	}

	private addStringManipulatorCommands() {
		this.addCommand({
			id: "to-uppercase",
			name: "To Uppercase",
			editorCallback(editor) {
				editorSelectionWrapper(editor, toUpperCase);
			},
		});

		this.addCommand({
			id: "to-titlecase",
			name: "To Title Case",
			editorCallback(editor) {
				editorSelectionWrapper(editor, toTitleCase);
			},
		});		

		this.addCommand({
			id: "to-lowercase",
			name: "To Lower Case",
			editorCallback(editor) {
				editorSelectionWrapper(editor, toLowerCase);
			},
		});

		this.addCommand({
			id: "encode-base64",
			name: "Base64 Encode",
			editorCallback(editor) {
				editorSelectionWrapper(editor, base64Encode);
			},
		});

		this.addCommand({
			id: "decode-base64",
			name: "Base64 Decode",
			editorCallback(editor) {
				editorSelectionWrapper(editor, base64Decode);
			},
		});

		this.addCommand({
			id: "to-snakeCase",
			name: "To SnakeCase",
			editorCallback(editor) {
				editorSelectionWrapper(editor, toSnakeCase);
			},
		});

		this.addCommand({
			id: "to-camelCase",
			name: "To CamleCase",
			editorCallback(editor) {
				editorSelectionWrapper(editor, toCamelCase);
			},
		});

		this.addCommand({
			id: "format-json",
			name: "Format JSON",
			editorCallback(editor) {
				editorSelectionWrapper(editor, formatJSON);
			},
		});

		this.addCommand({
			id: "hex-to-ascii",
			name: "Hex To Ascii",
			editorCallback(editor) {
				editorSelectionWrapper(editor, hexToAscii);
			},
		});

		this.addCommand({
			id: "ascii-to-hex",
			name: "Ascii To Hex",
			editorCallback(editor) {
				editorSelectionWrapper(editor, asciiToHex);
			},
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});
	}

	onunload() { }

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);

		if (leaves.length > 0) {
			console.log("A view already exists");

			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
