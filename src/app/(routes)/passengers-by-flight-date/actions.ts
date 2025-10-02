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
    const passengers = (entry.passengers as Record<string, unknown> | undefined) ?? {};

    function getFirstString(obj: Record<string, unknown>, keys: string[]): string | null {
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string") return v;
      }
      return null;
    }

    for (const key of Object.keys(passengers)) {
      const pax = (passengers[key] as Record<string, unknown>) || {};
      const nm = getFirstString(pax, ["name"]) ?? null;
      const surname = getFirstString(pax, ["surname"]) ?? null;
      const name = [nm, surname].filter(Boolean).join(" ") || null;

      // intentar extraer ticket/doc con diferentes keys para mayor robustez
      const ticketVal = getFirstString(pax, ["ticket", "ticketNumber", "ticket_number", "tkt"]);
      const docVal = getFirstString(pax, ["doc", "document", "document_number", "id_document"]);

      const row: PassengerRow = {
        id: `${entry._id}-${key}`,
        flightNumber,
        flightDate,
        passengerName: name,
        seat: (typeof pax["seat"] === "string" ? (pax["seat"] as string) : null),
        locator: entry._id ?? null,
        ticketNumber: ticketVal,
        doc: docVal,
        email: getFirstString(pax, ["email"]) ?? null,
        phone: getFirstString(pax, ["phone", "telephone", "tel"]) ?? null,
        status: getFirstString(pax, ["status", "state"]) ?? null,
      };
      rows.push(row);
    }
  }

  return rows;
}

