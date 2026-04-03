import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { ResortApiService } from './resort-api.service';
import type {
  BookingRequest,
  BookingResponse,
  ResortMap,
} from './models/resort-map.model';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let resortApiSpy: jasmine.SpyObj<ResortApiService>;

  const initialMap: ResortMap = {
    rows: 3,
    cols: 3,
    tiles: [
      [
        { type: 'empty', position: { row: 0, col: 0 } },
        { type: 'path', position: { row: 0, col: 1 } },
        { type: 'empty', position: { row: 0, col: 2 } },
      ],
      [
        {
          type: 'cabana',
          id: 'r1-c0',
          isAvailable: true,
          position: { row: 1, col: 0 },
        },
        { type: 'pool', position: { row: 1, col: 1 } },
        {
          type: 'cabana',
          id: 'r1-c2',
          isAvailable: false,
          position: { row: 1, col: 2 },
        },
      ],
      [
        { type: 'chalet', position: { row: 2, col: 0 } },
        { type: 'path', position: { row: 2, col: 1 } },
        { type: 'empty', position: { row: 2, col: 2 } },
      ],
    ],
  };

  const updatedMapAfterBooking: ResortMap = {
    rows: 3,
    cols: 3,
    tiles: [
      [
        { type: 'empty', position: { row: 0, col: 0 } },
        { type: 'path', position: { row: 0, col: 1 } },
        { type: 'empty', position: { row: 0, col: 2 } },
      ],
      [
        {
          type: 'cabana',
          id: 'r1-c0',
          isAvailable: false,
          position: { row: 1, col: 0 },
        },
        { type: 'pool', position: { row: 1, col: 1 } },
        {
          type: 'cabana',
          id: 'r1-c2',
          isAvailable: false,
          position: { row: 1, col: 2 },
        },
      ],
      [
        { type: 'chalet', position: { row: 2, col: 0 } },
        { type: 'path', position: { row: 2, col: 1 } },
        { type: 'empty', position: { row: 2, col: 2 } },
      ],
    ],
  };

  beforeEach(async () => {
    resortApiSpy = jasmine.createSpyObj<ResortApiService>('ResortApiService', [
      'getMap',
      'bookCabana',
    ]);

    resortApiSpy.getMap.and.returnValue(of(initialMap));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ResortApiService, useValue: resortApiSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and displays the resort map', () => {
    expect(resortApiSpy.getMap).toHaveBeenCalled();
    expect(component.map).toEqual(initialMap);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Resort Map');
  });

  it('shows booking form for an available cabana after selection', () => {
    const availableCabana = initialMap.tiles[1][0];

    component.onCabanaSelected(availableCabana);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Selected cabana');
    expect(compiled.textContent).toContain('Available');
    expect(compiled.textContent).toContain('Room number');
    expect(compiled.textContent).toContain('Guest name');
  });

  it('shows unavailable message for a booked cabana after selection', () => {
    const bookedCabana = initialMap.tiles[1][2];

    component.onCabanaSelected(bookedCabana);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Booked');
    expect(compiled.textContent).toContain('This cabana is not available.');
  });

  it('shows validation error when booking form is submitted empty', () => {
    const availableCabana = initialMap.tiles[1][0];

    component.onCabanaSelected(availableCabana);
    component.bookingForm = {
      room: '',
      guestName: '',
    };

    component.onSubmitBooking();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Room number and guest name are required.');
    expect(resortApiSpy.bookCabana).not.toHaveBeenCalled();
  });

  it('books a cabana and reloads the map after success', () => {
    const availableCabana = initialMap.tiles[1][0];
    const bookingResponse: BookingResponse = {
      success: true,
      cabanaId: 'r1-c0',
      message: 'Cabana booked successfully.',
    };

    resortApiSpy.bookCabana.and.returnValue(of(bookingResponse));

    resortApiSpy.getMap.calls.reset();
    resortApiSpy.getMap.and.returnValues(of(initialMap), of(updatedMapAfterBooking));

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onCabanaSelected(availableCabana);
    component.bookingForm = {
      room: '203',
      guestName: 'Wendy Scott',
    };

    component.onSubmitBooking();
    fixture.detectChanges();

    expect(resortApiSpy.bookCabana).toHaveBeenCalledWith('r1-c0', {
      room: '203',
      guestName: 'Wendy Scott',
    } as BookingRequest);

    expect(component.successMessage).toBe('Cabana booked successfully.');
    expect(component.selectedCabana).toBeNull();
    expect(component.bookingForm).toEqual({ room: '', guestName: '' });
    expect(resortApiSpy.getMap).toHaveBeenCalledTimes(2);
  });

  it('shows API error when booking fails', () => {
    const availableCabana = initialMap.tiles[1][0];

    resortApiSpy.bookCabana.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Room number and guest name do not match our records.',
        },
      }))
    );

    component.onCabanaSelected(availableCabana);
    component.bookingForm = {
      room: '203',
      guestName: 'Wrong Name',
    };

    component.onSubmitBooking();
    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Room number and guest name do not match our records.'
    );
  });
});