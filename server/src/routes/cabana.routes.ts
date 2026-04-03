import { Router } from 'express';
import type { BookingRequest, BookingResponse } from '../models.js';
import { CabanaBookingService } from '../services/cabana-booking.service.js';

interface CreateCabanaRouterOptions {
  bookingService: CabanaBookingService;
}

export function createCabanaRouter(
  options: CreateCabanaRouterOptions
): Router {
  const router = Router();
  const { bookingService } = options;

  router.post('/:cabanaId/book', (request, response) => {
    const { cabanaId } = request.params;
    const payload = request.body as Partial<BookingRequest>;

    const room = payload.room?.trim() ?? '';
    const guestName = payload.guestName?.trim() ?? '';

    if (!bookingService.hasCabana(cabanaId)) {
      response.status(404).json({
        message: 'Cabana not found.',
      });
      return;
    }

    if (bookingService.isCabanaBooked(cabanaId)) {
      response.status(409).json({
        message: 'This cabana is no longer available.',
      });
      return;
    }

    if (!room || !guestName) {
      response.status(400).json({
        message: 'Room number and guest name are required.',
      });
      return;
    }

    if (!bookingService.isValidGuest(room, guestName)) {
      response.status(422).json({
        message: 'Room number and guest name do not match our records.',
      });
      return;
    }

    bookingService.bookCabana(cabanaId);

    const responseBody: BookingResponse = {
      success: true,
      cabanaId,
      message: 'Cabana booked successfully.',
    };

    response.status(200).json(responseBody);
  });

  return router;
}