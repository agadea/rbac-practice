import { z } from "zod";

// Zod schema used only to infer the PassengerByFlightDate type
export const PassengerByFlightDateSchema = z.object({
  _id: z.string(),
  flight_number: z.string().optional(),
  flight_date: z.string().optional(),
  passengers: z.unknown().optional(),
});

export type PassengerByFlightDate = z.infer<typeof PassengerByFlightDateSchema>;

export type PassengerRow = {
  id: string;
  flightNumber: string;
  flightDate: string;
  passengerName?: string | null;
  seat?: string | null;
  locator?: string | null;
  ticketNumber?: string | null;
  doc?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

export default PassengerByFlightDateSchema;
