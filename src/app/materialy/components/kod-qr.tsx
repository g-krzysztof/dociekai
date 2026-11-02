import QRCode from 'qrcode';

/**
 * Kod QR jako jedna ścieżka SVG — synchronicznie (QRCode.create), więc działa
 * w komponencie serwerowym i klienckim, a w PDF zostaje wektorem.
 */
export function KodQr({ url, etykieta }: { url: string; etykieta: string }) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (modules.get(x, y)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
    }
  }
  return (
    <svg viewBox={`0 0 ${n + 4} ${n + 4}`} role="img" aria-label={etykieta} shapeRendering="crispEdges">
      <rect width={n + 4} height={n + 4} fill="var(--papier, #fff)" />
      <path d={d} fill="var(--druk, #000)" />
    </svg>
  );
}
