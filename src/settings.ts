import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

export interface RandomTaskerSettings {
	TaskFolder: string,
	rewardsFile?: string,
	punishmentsFile?: string,
}

export const DEFAULT_SETTINGS: RandomTaskerSettings = {
	TaskFolder: 'TaskList/',
	rewardsFile: 'Rewards.md',
	punishmentsFile: 'Punishments.md',
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
				}
			)
		)
		
		new Setting(containerEl)
			.setName('Rewards file name')
			.setDesc('Enter the name of the file containing your rewards')
			.addText(text => text
				.setPlaceholder('Enter rewards file name')
				.setValue(this.plugin.settings.rewardsFile || '')
				.onChange(async (value) => {
					this.plugin.settings.rewardsFile = value;
					await this.plugin.saveSettings();
				}
			)
		)

		new Setting(containerEl)
			.setName('Punishments file name')
			.setDesc('Enter the name of the file containing your punishments')
			.addText(text => text
				.setPlaceholder('Enter punishments file name')
				.setValue(this.plugin.settings.punishmentsFile || '')
				.onChange(async (value) => {
					this.plugin.settings.punishmentsFile = value;
					await this.plugin.saveSettings();
				}
			)
		)
	}	
}
