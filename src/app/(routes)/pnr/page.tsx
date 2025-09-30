import { PnrList } from "./list";
import { fetchAndTransformPnrs } from "./actions";

export default async function PnrPage() {
  const items = await fetchAndTransformPnrs().catch((err) => {
    // en caso de error, devolvemos lista vacía y logueamos en servidor
    // (Next.js server console)
    // eslint-disable-next-line no-console
    console.error("Failed fetching PNRs", err);
    return [];
  });

  return (
    <>
      <h2 className="text-3xl font-semibold text-center w-full">PNRS</h2>

      <div className="mt-6 w-full max-w-4xl mx-auto">
        <PnrList items={items} />
      </div>
    </>
  );
}
