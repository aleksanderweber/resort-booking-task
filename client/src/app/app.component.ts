import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  BookingRequest,
  ResortMap,
  ResortTile,
} from './models/resort-map.model';
import { ResortApiService } from './resort-api.service';
import { ResortMapComponent } from './resort-map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ResortMapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly resortApi = inject(ResortApiService);

  map: ResortMap | null = null;
  selectedCabana: ResortTile | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  bookingForm: BookingRequest = {
    room: '',
    guestName: '',
  };

  ngOnInit(): void {
    this.loadMap();
  }

  onCabanaSelected(tile: ResortTile): void {
    this.selectedCabana = tile;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookingForm = {
      room: '',
      guestName: '',
    };
  }

  onSubmitBooking(): void {
    if (!this.selectedCabana?.id || this.selectedCabana.type !== 'cabana') {
      return;
    }

    const room = this.bookingForm.room.trim();
    const guestName = this.bookingForm.guestName.trim();

    if (!room || !guestName) {
      this.errorMessage = 'Room number and guest name are required.';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.resortApi
      .bookCabana(this.selectedCabana.id, {
        room,
        guestName,
      })
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.selectedCabana = null;
          this.bookingForm = { room: '', guestName: '' };
          this.isSubmitting = false;
          this.loadMap();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message ?? 'Booking failed. Please try again.';
          this.successMessage = '';
          this.isSubmitting = false;
        },
      });
  }

  private loadMap(): void {
    this.isLoading = true;

    this.resortApi.getMap().subscribe({
      next: (map) => {
        this.map = map;
        this.isLoading = false;

        if (this.selectedCabana?.id) {
          const updatedSelection =
            map.tiles
              .flat()
              .find(
                (tile) =>
                  tile.type === 'cabana' && tile.id === this.selectedCabana?.id
              ) ?? null;

          this.selectedCabana = updatedSelection;
        }
      },
      error: () => {
        this.errorMessage = 'Could not load resort map.';
        this.isLoading = false;
      },
    });
  }
}