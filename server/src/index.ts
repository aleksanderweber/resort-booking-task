import { parseCliArgs } from './cli.js';
import { createApp } from './app.js';
import { loadMapFile } from './services/map-loader.js';
import { loadBookingsFile } from './services/bookings-loader.js';
import { buildResortMap, getCabanaIds } from './services/resort-map.service.js';
import { CabanaBookingService } from './services/cabana-booking.service.js';

const PORT = 3000;

function bootstrap(): void {
  try {
    const options = parseCliArgs(process.argv);

    const mapLines = loadMapFile(options.mapPath);
    const guestRecords = loadBookingsFile(options.bookingsPath);
    const cabanaIds = getCabanaIds(mapLines);

    const bookingService = new CabanaBookingService(guestRecords, cabanaIds);

    const getResortMap = () =>
      buildResortMap(mapLines, bookingService.getBookedCabanaIds());

    const app = createApp({
      bookingService,
      getResortMap,
    });

    const initialMap = getResortMap();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Map endpoint: http://localhost:${PORT}/api/map`);
      console.log(`Loaded guest records: ${guestRecords.length}`);
      console.log(`Loaded cabanas: ${cabanaIds.length}`);
      console.log(`Loaded map: ${initialMap.rows} rows x ${initialMap.cols} cols`);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown startup error';

    console.error(message);
    process.exit(1);
  }
}

bootstrap();