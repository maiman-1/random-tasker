import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

export interface RandomTaskerSettings {
	TaskFolder: string;
}

export const DEFAULT_SETTINGS: RandomTaskerSettings = {
	TaskFolder: 'TaskList/'
}

export class RandomTaskerSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Task folder name')
			.setDesc('Enter the name of the folder containing your tasks')
			.addText(text => text
				.setPlaceholder('Enter task folder name')
				.setValue(this.plugin.settings.TaskFolder)
				.onChange(async (value) => {
					this.plugin.settings.TaskFolder = value;
					await this.plugin.saveSettings();
				}));
	}
}
