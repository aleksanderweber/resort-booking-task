import type { ResortMap, ResortTile, TileType } from '../models.js';

function mapSymbolToTileType(symbol: string): TileType {
  switch (symbol) {
    case '.':
      return 'empty';
    case '#':
      return 'path';
    case 'p':
      return 'pool';
    case 'c':
      return 'chalet';
    case 'W':
      return 'cabana';
    default:
      throw new Error(`Unsupported map symbol: "${symbol}"`);
  }
}

function createCabanaId(row: number, col: number): string {
  return `r${row}-c${col}`;
}

export function buildResortMap(
  mapLines: string[],
  bookedCabanaIds: Set<string> = new Set()
): ResortMap {
  const rows = mapLines.length;
  const cols = mapLines[0]?.length ?? 0;

  if (rows === 0 || cols === 0) {
    throw new Error('Map must contain at least one row and one column.');
  }

  const hasInconsistentRowLength = mapLines.some((line) => line.length !== cols);

  if (hasInconsistentRowLength) {
    throw new Error('All map rows must have the same length.');
  }

  const tiles: ResortTile[][] = mapLines.map((line, row) =>
    [...line].map((symbol, col) => {
      const type = mapSymbolToTileType(symbol);

      const tile: ResortTile = {
        type,
        position: { row, col },
      };

      if (type === 'cabana') {
        const cabanaId = createCabanaId(row, col);

        tile.id = cabanaId;
        tile.isAvailable = !bookedCabanaIds.has(cabanaId);
      }

      return tile;
    })
  );

  return {
    rows,
    cols,
    tiles,
  };
}

export function getCabanaIds(mapLines: string[]): string[] {
  const cabanaIds: string[] = [];

  mapLines.forEach((line, row) => {
    [...line].forEach((symbol, col) => {
      if (symbol === 'W') {
        cabanaIds.push(createCabanaId(row, col));
      }
    });
  });

  return cabanaIds;
}