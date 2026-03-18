import { Plugin, BasesView, QueryController, 
	HoverParent, HoverPopover, parsePropertyId, Keymap,
  BasesEntry, 
  Notice} from 'obsidian';
import {DEFAULT_SETTINGS, RandomTaskerSettings, RandomTaskerSettingsTab} from "./settings";

//save states
import { RandomTaskerState } from "./taskState";

export const ExampleViewType = 'example-view';

// Remember to rename these classes and interfaces!


export default class RandomTasker extends Plugin {
	settings: RandomTaskerSettings;
  taskState: RandomTaskerState;

	async onload() {
		// Tell Obsidian about the new view type that this plugin provides.
    await this.loadSettings();
    await this.loadState();
    this.addSettingTab(new RandomTaskerSettingsTab(this.app, this));

		this.registerBasesView(ExampleViewType, {
			name: 'Random-Tasker',
			icon: 'lucide-graduation-cap',
			factory: (controller, containerEl) => {
				return new RandomTaskerView(this, controller, containerEl)
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

  async loadState() {
    this.taskState = Object.assign({}, {
        currentTaskName: null,
        currentTaskPath: null
      }, 
      await this.loadData() as Partial<RandomTaskerState>);
  }

  async saveState() {
    await this.saveData(this.taskState);
  }
}



export class RandomTaskerView extends BasesView implements HoverParent {

	hoverPopover: HoverPopover | null;

	currentTask: BasesEntry | null;
  plugin: RandomTasker;

	readonly type = ExampleViewType;
	private containerEl: HTMLElement;

	constructor(plugin: RandomTasker, controller: QueryController, parentEl: HTMLElement) {
		super(controller);
    this.plugin = plugin;
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

    

    // Create dashboard container
    const dashboardEl = this.containerEl.createDiv('weekly-task-dashboard');
    
    // Header with task title
    const headerEl = dashboardEl.createDiv('dashboard-header');
    const titleEl = headerEl.createEl('h2', { cls: 'task-title' });
    
    // Set the title (use file name)
    //console.log(randomTask);
    const fileName = this.plugin.taskState.currentTaskName;

    console.debug('Current task:', fileName);

    const linkEl = titleEl.createEl('a', { text: fileName ?? 'No tasks found', href: '#' });
    linkEl.onClickEvent((evt) => {
      if (evt.button !== 0 && evt.button !== 1) return;
      evt.preventDefault();
      const path = this.plugin.taskState.currentTaskPath ?? '';
      const modEvent = Keymap.isModEvent(evt);
      void app.workspace.openLinkText(path, '', modEvent);
    });

    linkEl.addEventListener('mouseover', (evt) => {
      app.workspace.trigger('hover-link', {
        event: evt,
        source: 'bases',
        hoverParent: this,
        targetEl: linkEl,
        linktext: this.plugin.taskState.currentTaskPath ?? '',
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

      //TODO: get the task file and extract the property value from the file's frontmatter or content based on the property type and name
      const value = this.currentTask?.getValue(propertyName);
      
      // Skip empty values
      if (!value || value.toString().trim() === '') continue;
      //console.log(name, value.data);

      const propertyRowEl = propertiesEl.createDiv('property-row');
      //propertyRowEl.createDiv('property-label', { text: name });
      //propertyRowEl.createDiv('property-value', { text: value.toString() });
    }

    // Refresh button
    const buttonContainer = dashboardEl.createDiv('dashboard-actions');

    //TODO: this buttons only show when there is no task found.
    const refreshBtn = buttonContainer.createEl('button', { text: 'Next task' });
    //TODO: 2 buttons: "Complete Task" and "Fail Task".
    // Complete task will get a task and a reward from reward file, and mark the current task as completed (e.g. by moving it to a "Completed" folder or adding a "completed" tag).
    // Fail task will get a task and a punishment from punishment file

    // When the button is clicked, get a new random task and update the display
    //let awaitTaskPromise: Promise<boolean> | null = null;

    refreshBtn.addEventListener('click', () => {
      void (
        async () => {
          console.debug('Refresh button clicked');
          const result = await this.getRandomTask();
          if (!result) {
            new Notice('No tasks found in the specified folder!');
            return;
          }
          this.onDataUpdated();
        }
      )();
      
    });
  }

  private async getRandomTask(): Promise<boolean> {
    console.debug('Getting random task...');

    // Collect all entries from all groups
    const AllEntries: BasesEntry[] = [];
    
    const configuredFilePath = this.plugin.settings.TaskFolder;
    const filePath = configuredFilePath.length > 0 ? configuredFilePath : 'TaskList/';

    //console.log(configuredFilePath);

    //console.log(this.data);
    for (const group of this.data.groupedData) {
      //console.log(group);
      for (const entry of group.entries) {
        if (entry.file.path.startsWith(filePath)) {
          //console.log(entry);
          AllEntries.push(entry);
        }
      }
    }

    //console.debug(`Found ${AllEntries.length} tasks in folder "${filePath}"`);

    // If no entries, show a message
    if (AllEntries.length === 0) {
      return false;
    }

    // Select a random task
    const randomTask =
      AllEntries[Math.floor(Math.random() * AllEntries.length)]!;

    // Update the current task state
    this.currentTask = randomTask;
    this.plugin.taskState.currentTaskPath = randomTask.file.path;
    this.plugin.taskState.currentTaskName = randomTask.file.name;
    await this.plugin.saveState();

    return true;
  }
}
