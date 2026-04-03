import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GuestRecord } from '../models.js';

function isGuestRecord(value: unknown): value is GuestRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate['room'] === 'string' &&
    typeof candidate['guestName'] === 'string'
  );
}

export function loadBookingsFile(bookingsPath: string): GuestRecord[] {
  const resolvedPath = resolve(bookingsPath);

  let fileContent: string;

  try {
    fileContent = readFileSync(resolvedPath, 'utf-8');
  } catch {
    throw new Error(`Could not read bookings file: ${resolvedPath}`);
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(fileContent);
  } catch {
    throw new Error(`Bookings file is not valid JSON: ${resolvedPath}`);
  }

  if (!Array.isArray(parsedJson)) {
    throw new Error(`Bookings file must contain an array: ${resolvedPath}`);
  }

  const invalidRecord = parsedJson.find((item) => !isGuestRecord(item));

  if (invalidRecord) {
    throw new Error(
      `Bookings file contains an invalid record: ${resolvedPath}`
    );
  }

  return parsedJson;
}