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
  return transformPassengersList(list);
}

export function transformPassengersList(list: PassengerByFlightDate[]): PassengerRow[] {
  const rows: PassengerRow[] = [];

  function getFirstString(obj: Record<string, unknown>, keys: string[]): string | null {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string") return v;
    }
    return null;
  }

  for (const entry of list) {
    const flightNumber = entry.flight_number ?? "unknown";
    const flightDate = entry.flight_date ?? "unknown";
    const passengers = (entry.passengers as Record<string, unknown> | undefined) ?? {};

    for (const key of Object.keys(passengers)) {
      const pax = (passengers[key] as Record<string, unknown>) || {};
      const nm = getFirstString(pax, ["name"]) ?? null;
      const surname = getFirstString(pax, ["surname"]) ?? null;
      const name = [nm, surname].filter(Boolean).join(" ") || null;

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

/**
 * Envía un POST al backend externo para obtener pasajeros por número de vuelo y fecha.
 * Acepta dos formatos de respuesta: un array directo o { data: [...] }.
 */
export async function postPassengersByFlightDate(flightNumber: number, flightDate: string): Promise<PassengerRow[]> {
  const res = await fetch("http://localhost:3050/pnr/passengers/by-flight-date", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flightNumber, flightDate }),
  });

  console.log("res", res);

  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }

  const json = await res.json();
  let payload: unknown = json;

  if (json && typeof json === "object" && Array.isArray((json as any).data)) {
    payload = (json as any).data;
  }

  if (!Array.isArray(payload)) {
    throw new Error("Unexpected response format from backend");
  }

  const parsed = z.array(PassengerByFlightDateSchema).safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Response validation failed: ${parsed.error.message}`);
  }

  return transformPassengersList(parsed.data);
}

// Server Action wrapper: permite pasar esta función a un Client Component
// y ejecutarla en el servidor sin necesidad de un endpoint proxy.
export async function searchPassengersServerAction(flightNumber: number, flightDate: string): Promise<PassengerRow[]> {
  "use server";
  return postPassengersByFlightDate(flightNumber, flightDate);
}

