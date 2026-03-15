interface CharacterSheetDisplayProps {
  characterSheetUrl: string;
  childName: string;
}

export function CharacterSheetDisplay({
  characterSheetUrl,
  childName,
}: CharacterSheetDisplayProps) {
  return (
    <div className="mt-12">
      <h2 className="mb-4 font-display text-xl font-medium">Character Sheet</h2>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-warm/20">
        <img
          src={characterSheetUrl}
          alt={`${childName}'s character sheet`}
          className="w-full object-contain"
        />
      </div>
    </div>
  );
}
