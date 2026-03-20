import { Plugin, BasesView, QueryController, 
	HoverParent, HoverPopover, Keymap,
  BasesEntry, 
  Notice,
  MarkdownRenderer,
  TFile,
  Component} from 'obsidian';
import {DEFAULT_SETTINGS, RandomTaskerSettings, RandomTaskerSettingsTab} from "./settings";

//save states
import { RandomTaskerState } from "./taskState";

export const randomTaskerView = 'random-tasker-view';

// Remember to rename these classes and interfaces!


export default class RandomTasker extends Plugin {
	settings: RandomTaskerSettings;
  taskState: RandomTaskerState;

	async onload() {
		// Tell Obsidian about the new view type that this plugin provides.
    await this.loadSettings();
    await this.loadState();
    this.addSettingTab(new RandomTaskerSettingsTab(this.app, this));

		this.registerBasesView(randomTaskerView, {
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
        currentTaskPath: null,
        savedRewards: [],
        savedPunishments: [],
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

	readonly type = randomTaskerView;
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
    //const order = this.config.getOrder();

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

    //display reward
    const rewardsEl = dashboardEl.createDiv('reward-display');
    if (this.plugin.taskState.savedRewards && this.plugin.taskState.savedRewards.length > 0) {
      //structure into a table
      const tableEl = rewardsEl.createEl('table', { cls: 'reward-table' });
      const tbodyEl = tableEl.createEl('tbody');
      //each row has one reward and a button to remove the reward from the list
      //removal is on reward fulfilled or when user clicks the button to remove it
      this.plugin.taskState.savedRewards.forEach((reward) => {
        const rowEl = tbodyEl.createEl('tr');
        rowEl.createEl('td', { text: reward, cls: 'reward-cell' });
        rowEl.createEl('td').createEl('button', { text: 'Remove', cls: 'remove-reward-btn' }).addEventListener('click', async () => {
          this.plugin.taskState.savedRewards = this.plugin.taskState.savedRewards?.filter((r) => r !== reward);
          void (
              async () => {
                await this.plugin.saveSettings();
              } 
          )
          this.displayDashboard();
        });
      });
    } else {
      rewardsEl.createEl('span', { text: 'No rewards yet. Complete a task to earn rewards!', cls: 'reward-text' });
    }

    // Properties display section
    const propertiesEl = dashboardEl.createDiv('dashboard-properties');

    //TODO: get the task file and extract the property value from the file's frontmatter or content based on the property type and name
    const component = new Component();
    const taskFile = this.plugin.app.vault.getAbstractFileByPath(this.plugin.taskState.currentTaskPath ?? '');

    //console.debug('Task file:', taskFile);

    if (taskFile instanceof TFile) {
      void this.plugin.app.vault.cachedRead(taskFile).then((fileText) => {
        console.debug('Task file contents:', fileText);
        //propertiesEl.createEl('pre', { text: fileText });
        void MarkdownRenderer.render(this.app, fileText, propertiesEl,taskFile.path, component);
      });
    }
    //const value = this.currentTask?.getValue(propertyName);

    // Refresh button
    const buttonContainer = dashboardEl.createDiv('dashboard-actions');

    // Complete task will get a task and a reward from reward file, and mark the current task as completed (e.g. by moving it to a "Completed" folder or adding a "completed" tag).
    // Fail task will get a task and a punishment from punishment file

    // When the button is clicked, get a new random task and update the display
    //let awaitTaskPromise: Promise<boolean> | null = null;

    let refreshBtn;
    let failBtn;
    let CompleteBtn;
    if (!fileName) {
      refreshBtn = buttonContainer.createEl('button', { text: 'Next task', cls: 'neutral-event' });

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
    }else {
      
      failBtn = buttonContainer.createEl('button', { text: 'Fail task', cls: 'bad-event' });
      CompleteBtn = buttonContainer.createEl('button', { text: 'Complete task', cls: 'good-event' });

      CompleteBtn.addEventListener('click', () => {
        void (
          async () => {
            console.debug('Complete button clicked');
            const result = await this.getRandomTask();
            if (!result) {
              new Notice('No tasks found in the specified folder!');
              return;
            }
            const rewardResult = await this.rollReward();
            if (!rewardResult) {
              // If rolling a reward failed, we can choose to either stop here or continue to get a new task. For now, let's just show a notice and continue.
              //new Notice('Failed to roll a reward. Please check your rewards file and settings.');
              return;
            }
            this.onDataUpdated();
          }
        )();
      
      });

      failBtn.addEventListener('click', () => {
        void (
          async () => {
            console.debug('Fail button clicked');
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

  private async rollReward(){
    /*
    Input; None
    Output: Promise if a reward is able to be rolled

    Steps:
    1. Get the list of rewards from the rewards file specified in settings (if the file or list doesn't exist, return false)
    2. Randomly select a reward from the list
    3. add reward to state for display in the dashboard (this.taskState.savedRewards)
    */

    // get file path from settings
    const configuredFilePath = this.plugin.settings.rewardsFile;
    const filePath = configuredFilePath && configuredFilePath.length > 0 ? configuredFilePath : 'Rewards.md';

    // add file extension if not present
    const finalFilePath = filePath.endsWith('.md') ? filePath : `${filePath}.md`;

    // get the rewards file
    const rewardsFile = this.plugin.app.vault.getAbstractFileByPath(finalFilePath);

    // if the file doesn't exist or isn't a TFile, return false
    if (!(rewardsFile instanceof TFile)) {
      new Notice('Rewards file not found! Please check your settings.');
      return false;
    }

    // read file
    const fileText = await this.plugin.app.vault.cachedRead(rewardsFile);

    //extrac rewards from file (for simplicity, assume each reward is a line in the file)
    const rewards = fileText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // edge case: no rewards in file
    if (rewards.length === 0) {
      new Notice('No rewards found in file! Please check your rewards file.');
      return false;
    }

    // randomly select a reward
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    // save reward to state for display
    this.plugin.taskState.savedRewards?.push(randomReward ?? '');
    await this.plugin.saveState();

    //call roll task to get a new task after rolling a reward
    // call this in event handler instead

    //return true once completed
    return true;

  }
}
