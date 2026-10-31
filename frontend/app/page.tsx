import Link from "next/link";
import { ArrowRight, Bell, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="aether-ambient min-h-dvh bg-bg">

      {/* ── Header ── */}
      <header className="aether-entrance flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 max-w-7xl mx-auto">
        <Link href="/" className="group flex items-center gap-3" aria-label="AetherSense home">
          <span className="neo-surface-soft grid size-8 place-items-center rounded-lg bg-brand text-surface shadow-sm transition-transform group-hover:-rotate-3">
            <Shield className="size-4" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold tracking-[0.12em]">AETHERSENSE</span>
            <span className="block text-[9px] tracking-[0.18em] text-muted">SPATIAL DISASTER INTELLIGENCE</span>
          </span>
        </Link>

        <span className="hidden sm:flex items-center gap-2 rounded-full border border-edge/70 bg-surface/55 px-3 py-1.5 text-[11px] text-muted backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-moderate" />
          Waiting for satellite observations
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto grid min-h-[calc(100dvh-80px)] max-w-7xl items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:px-16">
        <div className="aether-decoration pointer-events-none absolute inset-0" aria-hidden="true">
          <span className="aether-sprinkle left-[12%] top-[18%]" />
          <span className="aether-sprinkle left-[42%] top-[12%]" />
          <span className="aether-sprinkle left-[7%] top-[68%]" />
          <span className="aether-sprinkle right-[8%] top-[24%]" />
          <span className="aether-sprinkle right-[44%] bottom-[14%]" />
          <span className="aether-coordinate right-0 top-[8%] hidden sm:block">20.5937° N / 78.9629° E</span>
        </div>

        {/* Left: copy */}
        <div className="aether-entrance aether-entrance-delay max-w-xl">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-brand">
            <span className="h-px w-7 bg-brand/70" />
            DISASTER RESPONSE WORKSPACE
          </p>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[52px]">
            See the event.
            <br />
            <span className="text-brand">Understand the risk.</span>
            <br />
            Act with context.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-secondary">
            AetherSense brings live satellite observations, impact geography,
            historical disaster memory, and response decisions into one calm workspace.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="neo-button group inline-flex items-center gap-2.5 rounded-xl bg-brand px-5 py-3 text-[13px] font-semibold text-surface hover:bg-brand-hover focus-visible:outline focus-visible:outline-brand"
            >
              Open command center
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/citizen"
              className="neo-surface-soft inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[13px] text-secondary hover:bg-surface2 hover:text-ink transition-colors focus-visible:outline focus-visible:outline-brand"
            >
              <Bell className="size-3.5" strokeWidth={1.75} />
              View citizen alert
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-2.5" aria-label="Platform capabilities">
            {[
              { value: "06", label: "signal layers", tone: "text-brand" },
              { value: "24/7", label: "observation watch", tone: "text-moderate" },
              { value: "01", label: "calm workspace", tone: "text-secondary" },
            ].map((metric) => (
              <div key={metric.label} className="neo-metric rounded-xl px-3 py-3">
                <p className={`font-mono text-[16px] font-medium ${metric.tone}`}>{metric.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: calm map preview */}
        <div className="neo-surface aether-entrance aether-entrance-delay aether-map-frame relative overflow-hidden rounded-2xl min-h-[320px] sm:min-h-[420px]">
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-center justify-between text-[9px] font-medium tracking-[0.18em] text-muted/80">
            <span>LIVE ORBITAL VIEW</span>
            <span>NO ACTIVE EVENT</span>
          </div>
          {/* SVG map illustration — calm, editorial, explicitly a placeholder */}
          <svg
            viewBox="0 0 680 420"
            className="h-full w-full"
            fill="none"
            role="img"
            aria-label="AetherSense impact geography preview"
          >
            <defs>
              <pattern id="map-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#8FAF87" strokeOpacity="0.13" strokeWidth="0.7" />
              </pattern>
              <linearGradient id="map-vignette" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8FAF87" stopOpacity="0.1" />
                <stop offset="0.55" stopColor="#1E2922" stopOpacity="0" />
                <stop offset="1" stopColor="#0E1711" stopOpacity="0.28" />
              </linearGradient>
              <filter id="marker-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sea background */}
            <rect width="680" height="420" fill="#1E2922" />
            <rect width="680" height="420" fill="url(#map-grid)" />
            <rect width="680" height="420" fill="url(#map-vignette)" />
            <rect className="map-scanline" x="0" y="0" width="680" height="2" fill="#D0AD69" />

            {/* Coordinate guides */}
            {[112, 224, 336, 448, 560].map((x) => (
              <g key={`longitude-${x}`}>
                <line x1={x} y1="0" x2={x} y2="420" stroke="#8FAF87" strokeOpacity="0.18" strokeWidth="0.7" strokeDasharray="2 7" />
                <text x={x + 4} y="407" fill="#8E9B8B" fontSize="7" fontFamily="monospace">{`${Math.round(68 + x / 14)}°E`}</text>
              </g>
            ))}
            {[84, 168, 252, 336].map((y) => (
              <g key={`latitude-${y}`}>
                <line x1="0" y1={y} x2="680" y2={y} stroke="#8FAF87" strokeOpacity="0.18" strokeWidth="0.7" strokeDasharray="2 7" />
                <text x="654" y={y - 4} fill="#8E9B8B" fontSize="7" fontFamily="monospace">{`${Math.round(35 - y / 12)}°N`}</text>
              </g>
            ))}

            {/* India landmass — soft warm neutral */}
            <path
              d="M270 28 325 55 352 98 378 142 362 198 405 255 372 310 318 342 275 398 240 370 218 315 190 278 205 218 180 165 215 102Z"
              fill="#394B3D" fillOpacity="0.82" stroke="#8FAF87" strokeOpacity="0.58" strokeWidth="1.5"
            />
            <path
              d="M270 28 325 55 352 98 378 142 362 198 405 255 372 310 318 342 275 398 240 370 218 315 190 278 205 218 180 165 215 102Z"
              fill="none" stroke="#C1C9B9" strokeOpacity="0.22" strokeWidth="0.7" strokeDasharray="3 5"
            />
            <path d="M225 116 C255 145 290 168 350 192" fill="none" stroke="#8FAF87" strokeOpacity="0.22" strokeWidth="0.8" />
            <path d="M205 218 C252 232 310 245 375 260" fill="none" stroke="#8FAF87" strokeOpacity="0.2" strokeWidth="0.8" />
            {/* State boundaries and labels */}
            <g stroke="#C1C9B9" strokeOpacity="0.28" strokeWidth="0.75" strokeDasharray="2 3">
              <path d="M266 62 292 88 286 122 313 151 299 184 270 205" />
              <path d="M292 88 333 101 350 133 332 163 350 194 330 225" />
              <path d="M333 101 368 120 390 154 375 184 394 214" />
              <path d="M270 205 299 184 330 225 315 258 334 292" />
              <path d="M205 218 245 230 270 260 263 294 285 321" />
              <path d="M263 294 300 278 334 292 350 325" />
              <path d="M350 194 375 184 405 207 382 242 360 270" />
              <path d="M350 325 374 297 405 270" />
            </g>
            {[
              { x: 278, y: 74, label: "J&K" },
              { x: 312, y: 106, label: "RJ" },
              { x: 341, y: 139, label: "UP" },
              { x: 370, y: 169, label: "BR" },
              { x: 245, y: 214, label: "GJ" },
              { x: 282, y: 228, label: "MP" },
              { x: 224, y: 274, label: "MH" },
              { x: 317, y: 249, label: "TS" },
              { x: 374, y: 216, label: "WB" },
              { x: 282, y: 306, label: "KA" },
              { x: 335, y: 310, label: "TN" },
            ].map((state) => (
              <text
                key={state.label}
                x={state.x}
                y={state.y}
                fill="#C1C9B9"
                fillOpacity="0.48"
                fontSize="6"
                fontFamily="monospace"
                letterSpacing="0.5"
              >
                {state.label}
              </text>
            ))}

            {/* Major city markers */}
            {[
              { x: 295, y: 112, label: "New Delhi", dx: 8, dy: -6 },
              { x: 253, y: 244, label: "Mumbai", dx: -38, dy: 15 },
              { x: 314, y: 267, label: "Hyderabad", dx: 8, dy: 14 },
              { x: 291, y: 326, label: "Bengaluru", dx: -44, dy: 14 },
              { x: 333, y: 323, label: "Chennai", dx: 8, dy: 14 },
              { x: 384, y: 184, label: "Kolkata", dx: 8, dy: -6 },
              { x: 359, y: 157, label: "Patna", dx: 8, dy: -6 },
              { x: 245, y: 197, label: "Ahmedabad", dx: -46, dy: -6 },
            ].map((city) => (
              <g key={city.label}>
                <circle cx={city.x} cy={city.y} r="2.5" fill="#ECE9DD" stroke="#8FAF87" strokeWidth="1" />
                <text
                  x={city.x + city.dx}
                  y={city.y + city.dy}
                  fill="#ECE9DD"
                  fillOpacity="0.92"
                  stroke="#1E2922"
                  strokeOpacity="0.9"
                  strokeWidth="3"
                  paintOrder="stroke"
                  fontSize="6.5"
                  fontFamily="system-ui"
                >
                  {city.label}
                </text>
              </g>
            ))}

            {/* Uncertainty cone — soft blue-grey */}
            <path
              d="M610 68 C555 98 505 135 460 172 430 195 400 226 370 262 350 285 330 312 310 342 L290 320 310 295 332 268 362 232 393 198 424 165 468 130 512 96 558 62Z"
              fill="rgba(83,105,85,0.18)" stroke="rgba(143,175,135,0.36)" strokeWidth="1" strokeDasharray="4 4"
            />

            {/* Risk zone — restrained amber */}
            <path
              d="M200 220 262 200 330 215 380 250 360 305 295 325 228 295Z"
              fill="rgba(208,173,105,0.09)" stroke="rgba(201,130,74,0.58)" strokeWidth="1" strokeDasharray="5 3"
            />

            {/* Historical track — muted grey */}
            <path
              d="M610 68 C565 95 518 128 472 160 L430 188"
              stroke="#D0AD69" strokeWidth="1.25" strokeOpacity="0.72"
            />

            {/* Forecast track — teal dashed */}
            <path
              d="M430 188 C466 193 500 211 522 232 S530 274 498 304"
              stroke="#8FAF87" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.66"
            />

            {/* Flood zones — soft blues */}
            <ellipse cx="305" cy="305" rx="28" ry="18" fill="rgba(83,105,85,0.38)" />
            <ellipse cx="278" cy="290" rx="20" ry="14" fill="rgba(143,175,135,0.24)" />

            {/* Cyclone position — calm ring */}
            <circle cx="430" cy="188" r="12" fill="rgba(143,175,135,0.14)" stroke="#8FAF87" strokeWidth="1.5" />
            <circle cx="430" cy="188" r="4" fill="#8FAF87" />
            <circle cx="430" cy="188" r="17" fill="none" stroke="#8FAF87" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2 4" filter="url(#marker-glow)" />
            <rect x="463" y="145" width="79" height="29" rx="5" fill="#1E2922" fillOpacity="0.86" stroke="#536955" strokeOpacity="0.7" />
            <text x="470" y="157" fill="#8FAF87" fontSize="8" fontFamily="monospace">OBS-01</text>
            <text x="470" y="168" fill="#8E9B8B" fontSize="7" fontFamily="monospace">20.6N / 79.0E</text>

            {/* Forecast time markers */}
            {[
              { cx: 500, cy: 214, label: "+6h" },
              { cx: 520, cy: 266, label: "+12h" },
            ].map((m) => (
              <g key={m.label}>
                <circle cx={m.cx} cy={m.cy} r="3.5" fill="#1E2922" stroke="#8FAF87" strokeWidth="1.25" />
                <rect x={m.cx + 7} y={m.cy - 8} width={30} height={14} rx="3" fill="#1E2922" fillOpacity="0.92" stroke="#536955" strokeOpacity="0.55" />
                <text x={m.cx + 12} y={m.cy + 2} fill="#C1C9B9" fontSize="7.5" fontFamily="system-ui">{m.label}</text>
              </g>
            ))}

            {/* Shelter — green dot */}
            <circle cx="318" cy="334" r="5" fill="#1E2922" stroke="#8FAF87" strokeWidth="1.5" />

            {/* Blocked route — red dashes */}
            <line x1="340" y1="275" x2="310" y2="310" stroke="#C94F4F" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />

            {/* Observation points and evacuation route */}
            <path d="M318 334 C342 316 353 294 365 271" fill="none" stroke="#8FAF87" strokeOpacity="0.42" strokeWidth="1.25" strokeDasharray="3 5" />
            {[
              { cx: 248, cy: 188, label: "A" },
              { cx: 292, cy: 244, label: "B" },
              { cx: 346, cy: 302, label: "C" },
            ].map((point) => (
              <g key={point.label}>
                <circle cx={point.cx} cy={point.cy} r="2.5" fill="#D0AD69" stroke="#1E2922" strokeWidth="1" />
                <text x={point.cx + 6} y={point.cy + 3} fill="#D0AD69" fontSize="6.5" fontFamily="monospace">{point.label}</text>
              </g>
            ))}

            {/* Map controls */}
            <g transform="translate(612 74)">
              <rect width="42" height="76" rx="8" fill="#27352C" fillOpacity="0.94" stroke="#536955" strokeOpacity="0.8" />
              <line x1="0" y1="38" x2="42" y2="38" stroke="#536955" />
              <text x="21" y="24" textAnchor="middle" fill="#C1C9B9" fontSize="16" fontFamily="system-ui">+</text>
              <text x="21" y="62" textAnchor="middle" fill="#C1C9B9" fontSize="18" fontFamily="system-ui">−</text>
            </g>
            <g transform="translate(548 18)">
              <rect width="108" height="34" rx="7" fill="#27352C" fillOpacity="0.94" stroke="#536955" strokeOpacity="0.8" />
              <circle cx="13" cy="13" r="3" fill="#8FAF87" />
              <text x="22" y="16" fill="#C1C9B9" fontSize="8" fontFamily="system-ui">SENSOR READY</text>
              <text x="12" y="27" fill="#8E9B8B" fontSize="7" fontFamily="monospace">LATENCY 1.8s</text>
            </g>
            <g transform="translate(28 78)">
              <circle cx="18" cy="18" r="16" fill="#27352C" fillOpacity="0.92" stroke="#536955" strokeOpacity="0.8" />
              <path d="M18 5 22 18 18 31 14 18Z" fill="#D0AD69" />
              <text x="18" y="43" textAnchor="middle" fill="#8E9B8B" fontSize="7" fontFamily="monospace">N</text>
            </g>

            {/* Compact legend */}
            <g transform="translate(18 362)">
              <rect width="178" height="34" rx="7" fill="#27352C" fillOpacity="0.9" stroke="#536955" strokeOpacity="0.7" />
              <circle cx="14" cy="13" r="3" fill="#8FAF87" />
              <text x="22" y="16" fill="#C1C9B9" fontSize="8" fontFamily="system-ui">ACTIVE TRACK</text>
              <circle cx="101" cy="13" r="3" fill="#D0AD69" />
              <text x="109" y="16" fill="#C1C9B9" fontSize="8" fontFamily="system-ui">MEMORY</text>
              <line x1="11" y1="25" x2="31" y2="25" stroke="#8FAF87" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="38" y="28" fill="#8E9B8B" fontSize="8" fontFamily="system-ui">ROUTE</text>
              <line x1="91" y1="25" x2="111" y2="25" stroke="#C9824A" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="118" y="28" fill="#8E9B8B" fontSize="8" fontFamily="system-ui">RISK</text>
            </g>

            {/* Labels */}
            <text x="18" y="32" fill="#8E9B8B" fontSize="10" fontFamily="system-ui" letterSpacing="1">IMPACT GEOGRAPHY</text>
            <text x="18" y="46" fill="#8E9B8B" fontSize="9" fontFamily="system-ui">Awaiting connected observation feed</text>
            <text x="432" y="56" fill="#8FAF87" fontSize="9" fontFamily="system-ui" fontWeight="500">TRACK</text>
            <text x="208" y="268" fill="#C9824A" fontSize="9" fontFamily="system-ui" fontWeight="500">RISK AREA</text>
            <text x="320" y="356" fill="#8FAF87" fontSize="9" fontFamily="system-ui">SHELTER</text>
          </svg>

          {/* Status overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="neo-inset flex items-start gap-3 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="mt-0.5 size-1.5 rounded-full bg-moderate shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-moderate">Waiting for satellite observations</p>
                <p className="mt-0.5 text-[11px] text-muted leading-relaxed">
                  No active event is available. The map will populate when observations arrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
