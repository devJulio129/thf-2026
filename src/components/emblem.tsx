import { ICONS, PATTERNS, PLATES, type EmblemSpec } from "@/lib/emblem";

/**
 * Render del emblema: placa de fondo, patron recortado a la placa, y simbolo
 * escalado encima. Es el mismo armado del prototipo, en JSX.
 */
export function Emblem({ spec, className }: { spec: EmblemSpec; className?: string }) {
  const plate = PLATES.find((candidate) => candidate.id === spec.plate) ?? PLATES[0];
  const pattern = PATTERNS.find((candidate) => candidate.id === spec.pattern) ?? PATTERNS[0];
  const icon = ICONS.find((candidate) => candidate.id === spec.icon) ?? ICONS[0];

  // El clipPath necesita un id unico por combinacion; si se repitiera entre dos
  // emblemas en la misma pagina, el segundo heredaria el recorte del primero.
  const clipId = `emblem-clip-${plate.id}-${spec.patternRotation}`;

  const scale = (spec.iconScale || 70) / 100;
  const offset = 50 - 50 * scale;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ display: "block", width: "100%", aspectRatio: "1 / 1" }}
      role="img"
      aria-label="Emblema del equipo"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={plate.d} />
        </clipPath>
      </defs>

      <path d={plate.d} fill={spec.colorPlate} />

      <g clipPath={`url(#${clipId})`} transform={`rotate(${spec.patternRotation} 50 50)`}>
        {pattern.ds.map((d, index) => (
          <path key={index} d={d} fill={spec.colorPattern} fillRule="evenodd" />
        ))}
      </g>

      <g transform={`translate(${offset} ${offset}) scale(${scale})`}>
        {icon.ds.map((d, index) => (
          <path key={index} d={d} fill={spec.colorIcon} fillRule="evenodd" />
        ))}
      </g>
    </svg>
  );
}
