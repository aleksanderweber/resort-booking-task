import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ResortMap, ResortTile } from './models/resort-map.model';

type PathVariant = 'straight' | 'corner' | 'crossing' | 'split' | 'end';

@Component({
  selector: 'app-resort-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resort-map.component.html',
  styleUrl: './resort-map.component.scss',
})
export class ResortMapComponent {
  @Input({ required: true }) map!: ResortMap;
  @Input() selectedCabanaId: string | null = null;

  @Output() cabanaSelected = new EventEmitter<ResortTile>();

  getGridTemplateColumns(): string {
    return `repeat(${this.map.cols}, 40px)`;
  }

  trackByRowIndex(index: number): number {
    return index;
  }

  trackByTile(_index: number, tile: ResortTile): string {
    return `${tile.position.row}-${tile.position.col}`;
  }

  onTileClick(tile: ResortTile): void {
    if (tile.type !== 'cabana') {
      return;
    }

    this.cabanaSelected.emit(tile);
  }

  isSelected(tile: ResortTile): boolean {
    return tile.type === 'cabana' && tile.id === this.selectedCabanaId;
  }

  getPathVariant(tile: ResortTile): PathVariant | null {
    if (tile.type !== 'path') {
      return null;
    }

    const { row, col } = tile.position;

    const top = this.isPathAt(row - 1, col);
    const right = this.isPathAt(row, col + 1);
    const bottom = this.isPathAt(row + 1, col);
    const left = this.isPathAt(row, col - 1);

    const connections = [top, right, bottom, left].filter(Boolean).length;

    if (connections === 4) {
      return 'crossing';
    }

    if (connections === 3) {
      return 'split';
    }

    if (connections === 2) {
      if ((top && bottom) || (left && right)) {
        return 'straight';
      }

      return 'corner';
    }

    if (connections === 1) {
      return 'end';
    }

    return 'end';
  }

  getPathRotation(tile: ResortTile): number {
    if (tile.type !== 'path') {
      return 0;
    }

    const { row, col } = tile.position;

    const top = this.isPathAt(row - 1, col);
    const right = this.isPathAt(row, col + 1);
    const bottom = this.isPathAt(row + 1, col);
    const left = this.isPathAt(row, col - 1);

    const variant = this.getPathVariant(tile);

    switch (variant) {
      case 'straight':
        return left && right ? 90 : 0;

      case 'corner':
        if (top && right) return 0;
        if (right && bottom) return 90;
        if (bottom && left) return 180;
        if (left && top) return 270;
        return 0;

      case 'split':
        if (!top) return 90;
        if (!right) return 180;
        if (!bottom) return 270;
        if (!left) return 0;
        return 0;

      case 'end':
        if (top) return 180;
        if (right) return 270;
        if (bottom) return 0;
        if (left) return 90;
        return 0;

      case 'crossing':
      default:
        return 0;
    }
  }

  private isPathAt(row: number, col: number): boolean {
    const tile = this.map.tiles[row]?.[col];
    return tile?.type === 'path';
  }
}