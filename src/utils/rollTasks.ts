import {
    Vault,
    normalizePath,
    TFolder,
    TFile
} from 'obsidian';

const collectFilesRecursively = (folder: TFolder, accumulator: TFile[]): void => {
  for (const child of folder.children) {
    if (child instanceof TFile) {
      accumulator.push(child);
    } else if (child instanceof TFolder) {
      collectFilesRecursively(child, accumulator);
    }
  }
};

export async function getRandomTask(
    vault: Vault,
    TaskFolder: string
): Promise<TFile | false> {
     /*
    Input:
    - Vault object to access the files in the vault
    - TaskFolder: string representing the folder path to look for tasks in, relative to the vault root. If empty, search the entire vault.
    Output: TFile object representing the randomly selected task, or false if no tasks are found

    Steps:
    1. Get the list of task from the rewards file specified in settings
    2. Randomly select a reward from the list
    3. add reward to state for display in the dashboard (this.taskState.savedRewards)
    */

    //console.debug('Getting random task...');

    // Collect all entries from all groups
    //const AllEntries: BasesEntry[] = [];
    
    const configuredFilePath = normalizePath(TaskFolder);
    const filePath = configuredFilePath.length > 0 ? configuredFilePath : 'TaskList/';

    //console.log(configuredFilePath);
    //get TFolder object for the specified path
    let targetFolder: TFolder | null = null;
    if (filePath.length > 0) {
        const resolved = vault.getAbstractFileByPath(filePath);
        if (resolved instanceof TFolder) {
            targetFolder = resolved;
        }
    } else {
        targetFolder = vault.getRoot();
    }

    //console.log(this.data);
    //TODO: rewrite this to use the vault API to get all files in the folder, then filter the entries based on that list of files. This is because the current implementation relies on the structure of the data object, which may change in future versions of Obsidian or may not be consistent across different users' vaults.
    const candidates: TFile[] = [];
    
    if (targetFolder) {
        collectFilesRecursively(targetFolder, candidates);
    } else {
    for (const file of vault.getFiles()) {
            if (filePath.length === 0 || file.path.startsWith(filePath)) {
            candidates.push(file);
            }
        }
    }
    

    //console.debug(`Found ${AllEntries.length} tasks in folder "${filePath}"`);

    //TODO: Properly handle return cases
    // If no entries, show a message
    if (candidates.length === 0) {
      return false;
    }

    // Select a random task
    const randomTask =
      candidates[Math.floor(Math.random() * candidates.length)]!;

    //TODO: Figure out how to handle return cases
    return randomTask;
}