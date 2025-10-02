export default function RawView({ raw, item, showRaw }: any) {
  return (
    <div className="max-h-[56vh] overflow-auto">
      {showRaw ? (
        <div className="p-3 bg-black/[.03] dark:bg-white/[.03] rounded-md">
          <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto">
            {JSON.stringify(raw ?? item, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Carga JSON al abrir la pestaña.
        </div>
      )}
    </div>
  );
}
