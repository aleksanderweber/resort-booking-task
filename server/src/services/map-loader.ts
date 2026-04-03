import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadMapFile(mapPath: string): string[] {
  const resolvedPath = resolve(mapPath);

  let fileContent: string;

  try {
    fileContent = readFileSync(resolvedPath, 'utf-8');
  } catch {
    throw new Error(`Could not read map file: ${resolvedPath}`);
  }

  const lines = fileContent
    .split(/\r?\n/)
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error(`Map file is empty: ${resolvedPath}`);
  }

  return lines;
}