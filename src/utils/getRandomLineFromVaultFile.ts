import { Vault, normalizePath, TFile } from 'obsidian';

export async function getRandomLineFromVaultFile(
  vault: Vault,
  filePath: string
): Promise<string | null> {
  /*
    Input:
    - Vault object to access the files in the vault
    - filePath: string representing the path to the file to read from, relative to the vault root. If empty, search the entire vault for a file with the specified name.
    Output: Promise resolving to a randomly selected line from the file, or null if the file is empty or not found.

    Steps:
    1. Get the list of rewards from the rewards file specified in settings (if the file or list doesn't exist, return false)
    2. Randomly select a reward from the list
    3. add reward to state for display in the dashboard (this.taskState.savedRewards)
    */
  console.debug("RUNNING")
  // Must include the file type
  // TODO: Edge case, add if missing
  filePath = filePath + ".md"
  const normalizedPath = normalizePath(filePath);

  //console.debug(`Reading from file: ${normalizedPath}`);
  const entry = vault.getAbstractFileByPath(normalizedPath);
  if (!(entry instanceof TFile)) {
    //console.warn(entry)
    return null;
  }

  //console.debug(`File content: ${await vault.cachedRead(entry)}`);

  const content = await vault.cachedRead(entry);
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) {
    return null;
  }

  const selectedLine = lines[Math.floor(Math.random() * lines.length)] ?? null;

  return selectedLine;
}
