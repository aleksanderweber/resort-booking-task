import { describe, expect, it } from 'vitest';
import { CabanaBookingService } from './cabana-booking.service.js';

describe('CabanaBookingService', () => {
  const guests = [
    { room: '101', guestName: 'Alice Smith' },
    { room: '203', guestName: 'Wendy Scott' },
  ];

  const cabanaIds = ['r1-c1', 'r1-c2'];

  it('recognizes an existing cabana', () => {
    const service = new CabanaBookingService(guests, cabanaIds);

    expect(service.hasCabana('r1-c1')).toBe(true);
    expect(service.hasCabana('r9-c9')).toBe(false);
  });

  it('validates guest room and name', () => {
    const service = new CabanaBookingService(guests, cabanaIds);

    expect(service.isValidGuest('101', 'Alice Smith')).toBe(true);
    expect(service.isValidGuest('203', 'wendy scott')).toBe(true);
    expect(service.isValidGuest('203', 'Wrong Name')).toBe(false);
    expect(service.isValidGuest('999', 'Alice Smith')).toBe(false);
  });

  it('marks a cabana as booked', () => {
    const service = new CabanaBookingService(guests, cabanaIds);

    expect(service.isCabanaBooked('r1-c1')).toBe(false);

    service.bookCabana('r1-c1');

    expect(service.isCabanaBooked('r1-c1')).toBe(true);
  });

  it('returns booked cabana ids', () => {
    const service = new CabanaBookingService(guests, cabanaIds);

    service.bookCabana('r1-c1');

    expect(service.getBookedCabanaIds()).toEqual(new Set(['r1-c1']));
  });
});