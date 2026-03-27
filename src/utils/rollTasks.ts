import { Plugin, BasesView, QueryController, 
	HoverParent, HoverPopover, Keymap,
  BasesEntry, 
  Notice,
  MarkdownRenderer,
  TFile,
  normalizePath,
  Component} from 'obsidian';

export getRandomTask(TaskFilesPath: String): Promise<BasesEntry | false> {
     /*
    Input; None
    Output: BasesEntry object representing the randomly selected task, or false if no tasks are found

    Steps:
    1. Get the list of task from the rewards file specified in settings
    2. Randomly select a reward from the list
    3. add reward to state for display in the dashboard (this.taskState.savedRewards)
    */

    //console.debug('Getting random task...');

    // Collect all entries from all groups
    const AllEntries: BasesEntry[] = [];
    
    const configuredFilePath = normalizePath(this.plugin.settings.TaskFolder);
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
    await this.plugin.saveState();

    return randomTask;
  }
