import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  BookingRequest,
  BookingResponse,
  ResortMap,
} from './models/resort-map.model';

@Injectable({
  providedIn: 'root',
})
export class ResortApiService {
  private readonly http = inject(HttpClient);

  getMap(): Observable<ResortMap> {
    return this.http.get<ResortMap>('/api/map');
  }

  bookCabana(
    cabanaId: string,
    payload: BookingRequest
  ): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(
      `/api/cabanas/${cabanaId}/book`,
      payload
    );
  }
}