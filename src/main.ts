import { Plugin, BasesView, QueryController, 
	HoverParent, HoverPopover, parsePropertyId, Keymap,
  BasesEntry, BasesViewConfig } from 'obsidian';
import {DEFAULT_SETTINGS, RandomTaskerSettings, RandomTaskerSettingsTab} from "./settings";
export const ExampleViewType = 'example-view';

// Remember to rename these classes and interfaces!


export default class RandomTasker extends Plugin {
	settings: RandomTaskerSettings;

	async onload() {
		// Tell Obsidian about the new view type that this plugin provides.
    await this.loadSettings();
    this.addSettingTab(new RandomTaskerSettingsTab(this.app, this));

		this.registerBasesView(ExampleViewType, {
			name: 'Random-Tasker',
			icon: 'lucide-graduation-cap',
			factory: (controller, containerEl) => {
				return new RandomTaskerView(controller, containerEl)
			},
			options: () => ([
				{
				type: 'text',
				displayName: 'Task file path prefix',
				key: 'filePath',
				default: 'TaskList/',
				},
				// ...
			]),
		});		
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<RandomTaskerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



export class RandomTaskerView extends BasesView implements HoverParent {

	hoverPopover: HoverPopover | null;

	readonly type = ExampleViewType;
	private containerEl: HTMLElement;

	constructor(controller: QueryController, parentEl: HTMLElement) {
		super(controller);
		this.containerEl = parentEl.createDiv('bases-example-view-container');
	}

	// onDataUpdated is called by Obsidian whenever there is a configuration
	// or data change in the vault which may affect your view. For now,
	// simply draw "Hello World" to screen.
	public onDataUpdated(): void {
	
	const { app } = this;

    // Retrieve the user configured order set in the Properties menu.
    const order = this.config.getOrder();

    // Clear entries created by previous iterations.
    this.containerEl.empty();

    // Collect all entries from all groups
    const allEntries: BasesEntry[] = [];
    const configuredFilePath = String((this.config as any).get?.('filePath') ?? 'TaskList/').trim();
    const filePath = configuredFilePath.length > 0 ? configuredFilePath : 'TaskList/';

    //console.log(configuredFilePath);

    //console.log(this.data);
    for (const group of this.data.groupedData) {
      //console.log(group);
      for (const entry of group.entries) {
        if (entry.file.path.startsWith(filePath)) {
          //console.log(entry);
          allEntries.push(entry);
        }
      }
      //allEntries.push(...group.entries);
    }

    // If no entries, show a message
    if (allEntries.length === 0) {
      this.containerEl.createEl('p', { text: 'No tasks available' });
      return;
    }

    // Select a random task
    const randomTask = allEntries[Math.floor(Math.random() * allEntries.length)];

    // Create dashboard container
    const dashboardEl = this.containerEl.createDiv('weekly-task-dashboard');
    
    // Header with task title
    const headerEl = dashboardEl.createDiv('dashboard-header');
    const titleEl = headerEl.createEl('h2', { cls: 'task-title' });
    
    // Set the title (use file name)
    //console.log(randomTask);
    const fileName = String(randomTask.file.basename);
    const linkEl = titleEl.createEl('a', { text: fileName });
    linkEl.onClickEvent((evt) => {
      if (evt.button !== 0 && evt.button !== 1) return;
      evt.preventDefault();
      const path = randomTask.file.path;
      const modEvent = Keymap.isModEvent(evt);
      void app.workspace.openLinkText(path, '', modEvent);
    });

    linkEl.addEventListener('mouseover', (evt) => {
      app.workspace.trigger('hover-link', {
        event: evt,
        source: 'bases',
        hoverParent: this,
        targetEl: linkEl,
        linktext: randomTask.file.path,
      });
    });

    // Properties display section
    const propertiesEl = dashboardEl.createDiv('dashboard-properties');

    //console.log(order);
    for (const propertyName of order) {
      //console.log(propertyName);
      const { type, name } = parsePropertyId(propertyName);
      //console.log(type, name);
      
      // Skip the file name property since we already displayed it as title
      if (name === 'name' && type === 'file') continue;

      const value = randomTask.getValue(propertyName);
      
      // Skip empty values
      if (!value || value.toString().trim() === '') continue;
      //console.log(name, value.data);

      const propertyRowEl = propertiesEl.createDiv('property-row');
      //propertyRowEl.createDiv('property-label', { text: name });
      //propertyRowEl.createDiv('property-value', { text: value.toString() });
    }

    // Refresh button
    const buttonContainer = dashboardEl.createDiv('dashboard-actions');
    const refreshBtn = buttonContainer.createEl('button', { text: 'Next Task' });
    refreshBtn.addEventListener('click', () => {
      this.onDataUpdated();
    });
  }
}
