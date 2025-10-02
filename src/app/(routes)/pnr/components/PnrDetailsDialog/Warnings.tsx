export default function Warnings({ transformed }: any) {
  return (
    <div className="max-h-[56vh] overflow-auto space-y-2">
      <h4 className="text-sm font-medium">Warnings</h4>
      {(transformed?.warnings ?? []).length === 0 && (
        <div className="text-sm text-muted-foreground">Sin advertencias.</div>
      )}
      <ul className="list-disc list-inside">
        {(transformed?.warnings ?? []).map((w: any, i: number) => (
          <li key={i} className="text-sm">
            {w.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
