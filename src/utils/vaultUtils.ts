import { Vault, TFolder, TFile, normalizePath } from 'obsidian';

const collectFilesRecursively = (folder: TFolder, accumulator: TFile[]): void => {
  for (const child of folder.children) {
    if (child instanceof TFile) {
      accumulator.push(child);
    } else if (child instanceof TFolder) {
      collectFilesRecursively(child, accumulator);
    }
  }
};

export function getRandomFileInFolder(vault: Vault, folderPath: string): TFile | null {
  const normalizedPath = normalizePath(folderPath);
  const trimmedPath = normalizedPath.replace(/\/+$/, '');

  let targetFolder: TFolder | null = null;
  if (trimmedPath.length > 0) {
    const resolved = vault.getAbstractFileByPath(trimmedPath);
    if (resolved instanceof TFolder) {
      targetFolder = resolved;
    }
  } else {
    targetFolder = vault.getRoot();
  }

  const candidates: TFile[] = [];

  if (targetFolder) {
    collectFilesRecursively(targetFolder, candidates);
  } else {
    for (const file of vault.getFiles()) {
      if (trimmedPath.length === 0 || file.path.startsWith(trimmedPath)) {
        candidates.push(file);
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const candidate = candidates[Math.floor(Math.random() * candidates.length)] ?? null;

  return candidate;
}
