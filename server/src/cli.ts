export interface CliOptions {
  mapPath: string;
  bookingsPath: string;
}

export function parseCliArgs(args: string[]): CliOptions {
  const mapIndex = args.indexOf('--map');
  const bookingsIndex = args.indexOf('--bookings');

  const mapPath = mapIndex >= 0 ? args[mapIndex + 1] : undefined;
  const bookingsPath = bookingsIndex >= 0 ? args[bookingsIndex + 1] : undefined;

  if (!mapPath) {
    throw new Error('Missing required argument: --map <path>');
  }

  if (!bookingsPath) {
    throw new Error('Missing required argument: --bookings <path>');
  }

  return {
    mapPath,
    bookingsPath,
  };
}