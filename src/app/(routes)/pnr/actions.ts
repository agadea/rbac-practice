import { z } from "zod";
import { Pnr, PnrListItem, default as PnrSchema } from "./types";

const LatestResponseSchema = z.object({
  data: z.array(PnrSchema),
  total: z.number().optional(),
});

/**
 * Consulta http://localhost:3050/pnr/latest y devuelve el arreglo de PNRs.
 * Realiza validación mínima con zod y lanza un Error en caso de fallo.
 */
export async function fetchLatestPnrs(): Promise<Pnr[]> {
  const url = "http://localhost:3050/pnr/latest";

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    throw new Error(`Network error fetching PNRs: ${String(err)}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status} ${res.statusText} - ${body}`);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`Invalid JSON response from ${url}: ${String(err)}`);
  }

  // Algunos endpoints (según README) devuelven { data: [...], total }
  // Otros pueden devolver directamente un array. Normalizamos ambos casos.
  const normalized = Array.isArray(json) ? { data: json } : json;

  const parsed = LatestResponseSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`PNR response validation failed: ${parsed.error.message}`);
  }

  return parsed.data.data;
}

export default fetchLatestPnrs;

// Forma que espera PnrList en list.tsx
// PnrListItem is imported from ./types

/**
 * Fetch + transforma la respuesta para pasar a PnrList.
 * Se ejecuta en server (SSR) desde la page y devuelve items listos.
 */
export async function fetchAndTransformPnrs(): Promise<PnrListItem[]> {
  const pnrs = await fetchLatestPnrs();

  return pnrs.map((p) => {
    const id = p._id;
    const locator = p.record_locator ?? (p.pnr_data && (p.pnr_data as any).record_locator_information?.record_locator) ?? id;

    // tratar de extraer un pasajero principal (nombre completo) si existe
    let passenger: string | null = null;
    try {
      const passengers = (p.pnr_data as any)?.passengers_information;
      if (passengers && typeof passengers === 'object') {
        const first = Object.values(passengers)[0] as any;
        if (first) {
          const name = first.name ?? '';
          const surname = first.surname ?? '';
          passenger = `${name} ${surname}`.trim() || null;
        }
      }
    } catch (e) {
      passenger = null;
    }

    const createdAt = (p as any).createdAt ?? (p as any).updatedAt ?? null;

    const point_of_sale = (p.pnr_data as any)?.record_locator_information?.transaction_detail?.point_of_sale ?? null;
    const passengers_information = (p.pnr_data as any)?.passengers_information ?? null;
    const travel_document_information = passengers_information
      ? Object.values(passengers_information).reduce((acc: Record<string, unknown>, cur: any) => {
        if (cur && cur.travel_document_information) {
          acc[cur.passenger_reference_key ?? 'unknown'] = cur.travel_document_information;
        }
        return acc;
      }, {})
      : null;
    const contacts_list = (p.pnr_data as any)?.contacts_list ?? null;

    return {
      id,
      locator,
      passenger,
      createdAt,
      record_locator: p.record_locator ?? null,
      point_of_sale,
      passengers_information,
      travel_document_information,
      contacts_list,
    } as PnrListItem;
  });
}
