import { z } from "zod";

// Zod schema used only to infer the Pnr type
export const PnrSchema = z.object({
  _id: z.string(),
  record_locator: z.string().optional(),
  version: z.string().optional(),
  pnr_data: z.unknown().optional(),
});

export type Pnr = z.infer<typeof PnrSchema>;

export type PnrListItem = {
  id: string;
  locator: string;
  passenger?: string | null;
  createdAt?: string | null;
  // campos extra solicitados
  record_locator?: string | null;
  point_of_sale?: Record<string, unknown> | null;
  passengers_information?: Record<string, unknown> | null;
  travel_document_information?: Record<string, unknown> | null;
  contacts_list?: unknown[] | null;
};

export default PnrSchema;
