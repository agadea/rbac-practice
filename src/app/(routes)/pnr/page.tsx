import PnrDataTable from "./components/data-table";
import { fetchAndTransformPnrs } from "./actions";

export default async function PnrPage() {
  const items = await fetchAndTransformPnrs()
    .catch((err) => {
      // en caso de error, devolvemos lista vacía y logueamos en servidor
      // (Next.js server console)
      // eslint-disable-next-line no-console
      console.error("Failed fetching PNRs", err);
      return [];
    })
    // //! for testing, limit to 10 items, remove later
    // .then((data) => data.slice(0, 10)) // limit to 10 items for performance
    .finally(() => {
      // eslint-disable-next-line no-console
      console.log("fetch pnrs completed");
    });

  return (
    <>
      <h2 className="text-3xl font-semibold text-center w-full">PNRS</h2>

      <div className="mt-6 w-full max-w-4xl mx-auto">
        {/* DataTable es un Client Component que recibe items del Server Component */}
        <PnrDataTable data={items} />
      </div>
    </>
  );
}
