import { Plugin,
  BasesEntry, 
  normalizePath} from 'obsidian';

export function getRandomTask(TaskFolder: string): Promise<BasesEntry | false> {
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
    
    const configuredFilePath = normalizePath(TaskFolder);
    const filePath = configuredFilePath.length > 0 ? configuredFilePath : 'TaskList/';

    //console.log(configuredFilePath);

    //console.log(this.data);
    //TODO: rewrite this to use the vault API to get all files in the folder, then filter the entries based on that list of files. This is because the current implementation relies on the structure of the data object, which may change in future versions of Obsidian or may not be consistent across different users' vaults.
    

    //console.debug(`Found ${AllEntries.length} tasks in folder "${filePath}"`);

    //TODO: Properly handle return cases
    // If no entries, show a message
    if (AllEntries.length === 0) {
      return false;
    }

    // Select a random task
    const randomTask =
      AllEntries[Math.floor(Math.random() * AllEntries.length)]!;

    //TODO: Figure out how to handle return cases
    return randomTask;
  }
