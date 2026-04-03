export interface GuestRecord {
  room: string;
  guestName: string;
}

export type TileType = 'empty' | 'path' | 'pool' | 'chalet' | 'cabana';

export interface Position {
  row: number;
  col: number;
}

export interface ResortTile {
  type: TileType;
  position: Position;
  id?: string;
  isAvailable?: boolean;
}

export interface ResortMap {
  rows: number;
  cols: number;
  tiles: ResortTile[][];
}

export interface BookingRequest {
  room: string;
  guestName: string;
}

export interface BookingResponse {
  success: true;
  cabanaId: string;
  message: string;
}
