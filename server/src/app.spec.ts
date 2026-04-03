import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { buildResortMap, getCabanaIds } from './services/resort-map.service.js';
import { CabanaBookingService } from './services/cabana-booking.service.js';

function createTestApp() {
  const mapLines = [
    '.....',
    '.W#W.',
    '.#p#.',
    '.c#..',
  ];

  const guests = [
    { room: '101', guestName: 'Alice Smith' },
    { room: '203', guestName: 'Wendy Scott' },
  ];

  const cabanaIds = getCabanaIds(mapLines);
  const bookingService = new CabanaBookingService(guests, cabanaIds);

  const app = createApp({
    bookingService,
    getResortMap: () => buildResortMap(mapLines, bookingService.getBookedCabanaIds()),
  });

  return { app };
}

describe('app API', () => {
  it('returns the resort map', async () => {
    const { app } = createTestApp();

    const response = await request(app).get('/api/map');

    expect(response.status).toBe(200);
    expect(response.body.rows).toBe(4);
    expect(response.body.cols).toBe(5);

    const cabanas = response.body.tiles.flat().filter((tile: any) => tile.type === 'cabana');
    expect(cabanas).toHaveLength(2);
    expect(cabanas[0].isAvailable).toBe(true);
  });

  it('books an available cabana for a valid guest', async () => {
    const { app } = createTestApp();

    const bookingResponse = await request(app)
      .post('/api/cabanas/r1-c1/book')
      .send({
        room: '203',
        guestName: 'Wendy Scott',
      });

    expect(bookingResponse.status).toBe(200);
    expect(bookingResponse.body.success).toBe(true);
    expect(bookingResponse.body.cabanaId).toBe('r1-c1');

    const mapResponse = await request(app).get('/api/map');
    const bookedCabana = mapResponse.body.tiles
      .flat()
      .find((tile: any) => tile.id === 'r1-c1');

    expect(bookedCabana.isAvailable).toBe(false);
  });

  it('rejects booking when guest data does not match records', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/cabanas/r1-c1/book')
      .send({
        room: '203',
        guestName: 'Wrong Name',
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toContain('do not match');
  });

  it('rejects booking of a missing cabana', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/cabanas/r9-c9/book')
      .send({
        room: '203',
        guestName: 'Wendy Scott',
      });

    expect(response.status).toBe(404);
  });

  it('rejects booking of an already booked cabana', async () => {
    const { app } = createTestApp();

    await request(app)
      .post('/api/cabanas/r1-c1/book')
      .send({
        room: '203',
        guestName: 'Wendy Scott',
      });

    const secondResponse = await request(app)
      .post('/api/cabanas/r1-c1/book')
      .send({
        room: '101',
        guestName: 'Alice Smith',
      });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toContain('no longer available');
  });

  it('rejects missing room or guest name', async () => {
    const { app } = createTestApp();

    const response = await request(app)
      .post('/api/cabanas/r1-c1/book')
      .send({
        room: '',
        guestName: '',
      });

    expect(response.status).toBe(400);
  });
});