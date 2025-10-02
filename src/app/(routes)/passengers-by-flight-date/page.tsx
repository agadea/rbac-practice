import { fetchAndTransformPassengers } from "./actions";
import PassengersDataTable from "./components/data-table";
import type { PassengerRow } from "./types";

export default async function PassengersByFlightDatePage() {
  const rows: PassengerRow[] = await fetchAndTransformPassengers().catch(
    (err) => {
      console.error("Failed fetching passengers by flight date", err);
      return [] as PassengerRow[];
    }
  );

  // map rows to include the fields expected by the client table columns
  const clientRows = rows.map((r) => ({
    id: r.id,
    passengerName: r.passengerName ?? null,
    locator: r.locator ?? r.id,
    ticketNumber: r.ticketNumber ?? null,
    doc: r.doc ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    status: r.status ?? null,
  }));

  return (
    <>
      <h2 className="text-3xl font-semibold text-center w-full">
        Passengers by Flight Date
      </h2>
      <div className="mt-6 w-full max-w-4xl mx-auto">
        {/* DataTable es un Client Component que recibe items del Server Component */}
        {/* @ts-expect-error Server -> Client prop serialization */}
        <PassengersDataTable data={clientRows} />
      </div>
    </>
  );
}
