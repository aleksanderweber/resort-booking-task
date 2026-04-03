import type { GuestRecord } from '../models.js';

export class CabanaBookingService {
  private readonly validGuestKeys: Set<string>;
  private readonly validCabanaIds: Set<string>;
  private readonly bookedCabanaIds = new Set<string>();

  constructor(guests: GuestRecord[], cabanaIds: string[]) {
    this.validGuestKeys = new Set(
      guests.map((guest) => this.createGuestKey(guest.room, guest.guestName))
    );

    this.validCabanaIds = new Set(cabanaIds);
  }

  hasCabana(cabanaId: string): boolean {
    return this.validCabanaIds.has(cabanaId);
  }

  isCabanaBooked(cabanaId: string): boolean {
    return this.bookedCabanaIds.has(cabanaId);
  }

  getBookedCabanaIds(): Set<string> {
    return new Set(this.bookedCabanaIds);
  }

  isValidGuest(room: string, guestName: string): boolean {
    return this.validGuestKeys.has(this.createGuestKey(room, guestName));
  }

  bookCabana(cabanaId: string): void {
    this.bookedCabanaIds.add(cabanaId);
  }

  private createGuestKey(room: string, guestName: string): string {
    return `${room.trim()}::${guestName.trim().toLowerCase()}`;
  }
}