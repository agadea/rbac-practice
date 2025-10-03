import {
  fetchAndTransformPassengers,
  searchPassengersServerAction,
} from "./actions";
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

  // datos de prueba para ver las columnas si no hay datos reales
  const sampleRows: PassengerRow[] = [
    {
      id: "sample-1",
      flightNumber: "LA123",
      flightDate: "2025-10-02",
      passengerName: "Carlos Ruiz",
      seat: "12A",
      locator: "ABC123",
      ticketNumber: "001-1111111111",
      doc: "X111222",
      email: "carlos.ruiz@example.com",
      phone: "+34123456789",
      status: "CHECKED-IN",
    },
    {
      id: "sample-2",
      flightNumber: "LA123",
      flightDate: "2025-10-02",
      passengerName: "Lucía Fernández",
      seat: "12B",
      locator: "DEF456",
      ticketNumber: "001-2222222222",
      doc: "Y333444",
      email: "lucia.f@example.com",
      phone: "+34987654321",
      status: "BOOKED",
    },
    {
      id: "sample-3",
      flightNumber: "LA124",
      flightDate: "2025-10-03",
      passengerName: "Miguel Soto",
      seat: "14C",
      locator: "GHI789",
      ticketNumber: "001-3333333333",
      doc: "Z555666",
      email: "miguel.soto@example.com",
      phone: null,
      status: "PENDING",
    },
  ];

  const displayRows = clientRows.length > 0 ? clientRows : sampleRows;

  return (
    <>
      <h2 className="text-3xl font-semibold text-center w-full">
        Passengers by Flight Date
      </h2>
      <div className="mt-6 w-full max-w-4xl mx-auto">
        {/* DataTable es un Client Component que recibe items del Server Component */}
        {/* @ts-expect-error Server -> Client prop serialization */}
        <PassengersDataTable
          data={displayRows}
          searchAction={searchPassengersServerAction}
        />
      </div>
    </>
  );
}
