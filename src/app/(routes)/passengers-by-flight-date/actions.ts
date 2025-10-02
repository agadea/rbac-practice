import { z } from "zod";
import PassengerByFlightDateSchema, { PassengerByFlightDate, PassengerRow } from "./types";

const ResponseSchema = z.object({
  data: z.array(PassengerByFlightDateSchema),
  total: z.number().optional(),
});

// Dummy fetch that simulates an API call. For now returns hardcoded data.
export async function fetchPassengersByFlightDate(): Promise<PassengerByFlightDate[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 50));

  const dummy: PassengerByFlightDate[] = [
    {
      _id: "p1",
      flight_number: "LA123",
      flight_date: "2025-10-02",
      passengers: {
        pax1: { name: "Juan", surname: "Pérez", seat: "12A", ticket: "001-2345678901", doc: "X1234567", email: "juan@example.com", phone: "+34123456789", status: "OK" },
        pax2: { name: "María", surname: "Gómez", seat: "12B", ticket: "001-2345678902", doc: "Y9876543", email: "maria@example.com", phone: "+34987654321", status: "OK" },
      },
    },
    {
      _id: "p2",
      flight_number: "LA123",
      flight_date: "2025-10-02",
      passengers: {
        pax1: { name: "Ana", surname: "López", seat: "14C", ticket: "001-2345678903", doc: "Z1928374", email: "ana@example.com", phone: null, status: "CHECK" },
      },
    },
  ];

  const normalized = { data: dummy };
  const parsed = ResponseSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Passengers response validation failed: ${parsed.error.message}`);
  }

  return parsed.data.data as PassengerByFlightDate[];
}

export default fetchPassengersByFlightDate;

export async function fetchAndTransformPassengers(): Promise<PassengerRow[]> {
  const list = await fetchPassengersByFlightDate();

  const rows: PassengerRow[] = [];
  for (const entry of list) {
    const flightNumber = entry.flight_number ?? "unknown";
    const flightDate = entry.flight_date ?? "unknown";
    type PassengerRaw = {
      name?: string | null;
      surname?: string | null;
      seat?: string | null;
      ticket?: string | null;
      doc?: string | null;
      email?: string | null;
      phone?: string | null;
      status?: string | null;
    };

    const passengers = (entry.passengers as Record<string, PassengerRaw> | undefined) ?? {};

    for (const key of Object.keys(passengers)) {
      const pax: PassengerRaw = passengers[key] || {};
      const name = `${pax.name ?? ""} ${pax.surname ?? ""}`.trim() || null;
      const row: PassengerRow = {
        id: `${entry._id}-${key}`,
        flightNumber,
        flightDate,
        passengerName: name,
        seat: pax.seat ?? null,
        locator: entry._id ?? null,
        ticketNumber: pax.ticket ?? null,
        doc: pax.doc ?? null,
        email: pax.email ?? null,
        phone: pax.phone ?? null,
        status: pax.status ?? null,
      };
      rows.push(row);
    }
  }

  return rows;
}

