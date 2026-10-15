import type { CSSProperties, ReactNode } from "react";
import type { ArtName } from "@/lib/lesson-types";
import { cn } from "@/lib/utils";

// The illustration library for slides. Every drawing is inline SVG on a 320×240 canvas,
// coloured from the --art-* variables in globals.css and animated by the .art-* classes
// there (all of which switch off under prefers-reduced-motion). To add one: draw it
// here, add its name to ART_NAMES in lesson-types.ts, and list it in formats.md.
//
// Animated groups never carry a transform attribute: CSS transforms replace it. Position
// with an outer <g transform>, animate an inner <g className>.

const delay = (s: number, dur?: number): CSSProperties => ({ animationDelay: `${s}s`, ...(dur ? { animationDuration: `${dur}s` } : {}) });

const LEAF =
  "M50 5 L56 20 L63 16 L60 38 L72 26 L75 33 L88 30 L84 44 L92 48 L72 64 L75 72 L54 69 L55 92 L45 92 L46 69 L25 72 L28 64 L8 48 L16 44 L12 30 L25 33 L28 26 L40 38 L37 16 L44 20 Z";

/** A maple leaf centred on (x, y), `size` wide. */
function Leaf({ x, y, size, fill, veins }: { x: number; y: number; size: number; fill: string; veins?: boolean }) {
  const s = size / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -50)`}>
      <path d={LEAF} fill={fill} />
      {veins ? <path d="M50 90 L50 28 M50 64 L27 41 M50 64 L73 41 M50 50 L38 26 M50 50 L62 26" stroke="var(--art-paper)" strokeWidth={1.6} strokeLinecap="round" opacity={0.55} fill="none" /> : null}
    </g>
  );
}

/** A four-pointed sparkle centred on (x, y). */
function Sparkle({ x, y, r, fill, d = 0 }: { x: number; y: number; r: number; fill: string; d?: number }) {
  return (
    <g className="art-twinkle" style={delay(d)}>
      <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={fill} />
    </g>
  );
}

function Pine({ x, y, h, snow }: { x: number; y: number; h: number; snow?: boolean }) {
  const w = h * 0.55;
  return (
    <g>
      <rect x={x - 2} y={y - h * 0.12} width={4} height={h * 0.14} fill="var(--art-stone-dark)" />
      <path d={`M${x} ${y - h} L${x + w * 0.5} ${y - h * 0.45} L${x - w * 0.5} ${y - h * 0.45}Z M${x} ${y - h * 0.72} L${x + w * 0.65} ${y - h * 0.1} L${x - w * 0.65} ${y - h * 0.1}Z`} fill="var(--art-pine)" />
      {snow ? <path d={`M${x} ${y - h} L${x + w * 0.2} ${y - h * 0.78} L${x - w * 0.2} ${y - h * 0.78}Z`} fill="var(--art-paper)" /> : null}
    </g>
  );
}

// ---- drawings -----------------------------------------------------------------

function Maple() {
  const falling = [
    { x: 28, s: 22, c: "var(--art-amber)", d: -1, t: 11 },
    { x: 78, s: 16, c: "var(--art-maple)", d: -6, t: 9 },
    { x: 250, s: 20, c: "var(--art-amber-soft)", d: -3, t: 12 },
    { x: 292, s: 15, c: "var(--art-amber)", d: -8, t: 10 },
    { x: 120, s: 13, c: "var(--art-amber-soft)", d: -4.5, t: 13 },
    { x: 205, s: 17, c: "var(--art-maple)", d: -10, t: 11 },
  ];
  return (
    <>
      <circle cx={160} cy={122} r={96} fill="var(--art-paper)" opacity={0.09} />
      <circle cx={160} cy={122} r={70} fill="var(--art-paper)" opacity={0.07} />
      <g className="art-sway-slow">
        <Leaf x={160} y={120} size={150} fill="var(--art-maple)" veins />
      </g>
      {falling.map((l, i) => (
        <g key={i} className="art-fall" style={delay(l.d, l.t)}>
          <Leaf x={l.x} y={-14} size={l.s} fill={l.c} />
        </g>
      ))}
    </>
  );
}

function Parliament() {
  const windows = [88, 102, 116, 130, 190, 204, 218, 232];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      <circle cx={256} cy={56} r={26} fill="var(--art-amber-soft)" />
      <path d="M0 150 Q60 122 120 140 T240 134 T320 140 V240 H0Z" fill="var(--art-teal-soft)" />
      <path d="M22 178 L56 150 H264 L298 178Z" fill="var(--art-leaf)" />
      <circle cx={50} cy={160} r={12} fill="var(--art-pine)" opacity={0.85} />
      <circle cx={272} cy={160} r={13} fill="var(--art-pine)" opacity={0.85} />
      {/* Centre Block */}
      <rect x={78} y={118} width={164} height={34} fill="var(--art-stone)" />
      <rect x={74} y={112} width={172} height={8} fill="var(--art-copper)" />
      <path d="M74 112 L84 94 L94 112Z M226 112 L236 94 L246 112Z" fill="var(--art-copper)" />
      {windows.map((x) => (
        <rect key={x} x={x} y={126} width={6} height={12} rx={3} fill="var(--art-stone-dark)" />
      ))}
      {/* Peace Tower */}
      <rect x={146} y={62} width={28} height={90} fill="var(--art-stone)" />
      <rect x={146} y={62} width={4} height={90} fill="var(--art-stone-dark)" opacity={0.5} />
      <circle cx={160} cy={80} r={7} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
      <path d="M160 80 V75.5 M160 80 H163.5" stroke="var(--art-ink)" strokeWidth={1.2} strokeLinecap="round" />
      <rect x={152} y={94} width={5} height={15} rx={2.5} fill="var(--art-stone-dark)" />
      <rect x={163} y={94} width={5} height={15} rx={2.5} fill="var(--art-stone-dark)" />
      <rect x={156} y={130} width={8} height={22} rx={4} fill="var(--art-stone-dark)" />
      <path d="M142 62 L160 24 L178 62Z" fill="var(--art-copper)" />
      <path d="M160 24 V8" stroke="var(--art-ink)" strokeWidth={1.5} />
      <g transform="translate(160 8)">
        <g className="art-flag">
          <rect width={18} height={10} fill="var(--art-maple)" />
          <rect x={5} width={8} height={10} fill="var(--art-paper)" />
          <circle cx={9} cy={5} r={2} fill="var(--art-maple)" />
        </g>
      </g>
      {/* The Ottawa River */}
      <rect y={176} width={320} height={64} fill="var(--art-water)" />
      {[
        [40, 192, 0],
        [130, 206, -1.3],
        [220, 196, -2.6],
        [280, 218, -0.6],
        [80, 224, -2],
      ].map(([x, y, d], i) => (
        <g key={i} className="art-ripple" style={delay(d)}>
          <path d={`M${x} ${y} h26`} stroke="var(--art-paper)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </>
  );
}

function Canal() {
  const flakes = Array.from({ length: 16 }, (_, i) => ({ x: (i * 47 + 13) % 320, r: 1.4 + (i % 3) * 0.8, d: -((i * 1.7) % 9), t: 7 + (i % 4) * 1.5 }));
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      <path d="M0 118 Q80 102 160 112 T320 106 V156 H0Z" fill="var(--art-paper)" />
      <Pine x={28} y={124} h={46} snow />
      <Pine x={58} y={120} h={34} snow />
      <Pine x={300} y={118} h={42} snow />
      {/* a BeaverTails hut on the bank */}
      <rect x={236} y={98} width={34} height={20} fill="var(--art-amber)" />
      <path d="M232 99 L253 86 L274 99Z" fill="var(--art-maple)" />
      <rect x={246} y={104} width={14} height={8} fill="var(--art-paper)" opacity={0.8} />
      {/* the ice */}
      <rect y={150} width={320} height={90} fill="var(--art-ice)" />
      <path d="M20 170 h60 M120 186 h90 M240 166 h50 M60 206 h70 M200 214 h80" stroke="var(--art-paper)" strokeWidth={2} strokeLinecap="round" />
      <path d="M0 224 Q160 208 320 226 V240 H0Z" fill="var(--art-paper)" />
      {/* the skater */}
      <g className="art-skate">
        <g className="art-bob">
          <ellipse cx={165} cy={187} rx={20} ry={3} fill="var(--art-ink)" opacity={0.12} />
          <path d="M158 158 L149 182 M165 158 L178 177" stroke="var(--art-ink)" strokeWidth={4.5} strokeLinecap="round" />
          <path d="M141 184 H158 M172 180 L188 183" stroke="var(--art-ink)" strokeWidth={2} strokeLinecap="round" />
          <path d="M156 141 L144 152 M167 140 L180 133" stroke="var(--art-teal-deep)" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={162} cy={146} rx={10} ry={16} transform="rotate(12 162 146)" fill="var(--art-teal)" />
          <path d="M156 131 Q146 133 138 141" stroke="var(--art-maple)" strokeWidth={4} strokeLinecap="round" fill="none" />
          <rect x={155} y={128} width={14} height={5} rx={2.5} fill="var(--art-maple)" />
          <circle cx={164} cy={121} r={7} fill="var(--art-skin)" />
          <path d="M156.5 120 Q157 110 164 110 Q171 110 171.5 120Z" fill="var(--art-maple)" />
          <rect x={156} y={118} width={16} height={3.5} rx={1.5} fill="var(--art-paper)" />
          <circle cx={164} cy={108} r={3.2} fill="var(--art-paper)" />
        </g>
      </g>
      {flakes.map((f, i) => (
        <g key={i} className="art-snow" style={delay(f.d, f.t)}>
          <circle cx={f.x} cy={-6} r={f.r} fill="var(--art-paper)" />
        </g>
      ))}
    </>
  );
}

function Tulips() {
  const heads = ["var(--art-maple)", "var(--art-amber)", "var(--art-pink)", "var(--art-maple)", "var(--art-pink)", "var(--art-amber)"];
  const xs = [48, 94, 140, 186, 232, 276];
  const hs = [92, 118, 104, 126, 98, 112];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-amber-soft)" />
      <circle cx={70} cy={58} r={24} fill="var(--art-paper)" opacity={0.85} />
      {/* a windmill, far away: the tulips are a Dutch thank-you */}
      <g opacity={0.5}>
        <path d="M262 112 L268 66 H276 L282 112Z" fill="var(--art-stone-dark)" />
        <g transform="translate(272 66)">
          <g className="art-spin">
            <path d="M0 0 L-3 -30 H3Z M0 0 L30 -3 V3Z M0 0 L3 30 H-3Z M0 0 L-30 3 V-3Z" fill="var(--art-stone-dark)" />
          </g>
        </g>
      </g>
      <path d="M0 196 Q160 182 320 198 V240 H0Z" fill="var(--art-leaf)" />
      {xs.map((x, i) => {
        const top = 214 - hs[i];
        return (
          <g key={x} className="art-sway" style={delay(-i * 0.7)}>
            <path d={`M${x} 214 Q${x - 5} ${214 - hs[i] / 2} ${x} ${top}`} stroke="var(--art-pine)" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <path d={`M${x} 210 Q${x - 24} 192 ${x - 15} 168 Q${x - 6} 194 ${x} 204Z`} fill="var(--art-pine)" opacity={0.8} />
            <path
              d={`M${x - 13} ${top - 20} Q${x - 14} ${top + 3} ${x} ${top + 3} Q${x + 14} ${top + 3} ${x + 13} ${top - 20} L${x + 6} ${top - 11} L${x} ${top - 22} L${x - 6} ${top - 11}Z`}
              fill={heads[i]}
            />
            <path d={`M${x - 6} ${top - 11} L${x} ${top - 22} L${x + 6} ${top - 11} Q${x} ${top - 2} ${x - 6} ${top - 11}Z`} fill="var(--art-paper)" opacity={0.25} />
          </g>
        );
      })}
    </>
  );
}

function Lakes() {
  return (
    <>
      <rect width={320} height={240} fill="var(--art-amber-soft)" />
      <circle cx={232} cy={128} r={32} fill="var(--art-amber)" opacity={0.85} />
      <Sparkle x={60} y={40} r={5} fill="var(--art-paper)" />
      <Sparkle x={120} y={26} r={3.5} fill="var(--art-paper)" d={-1.2} />
      <path d="M0 130 L14 104 L22 116 L34 92 L46 118 L60 98 L74 124 L90 108 L104 130Z" fill="var(--art-pine)" />
      <path d="M190 130 L204 112 L214 122 L232 100 L246 122 L262 106 L280 126 L300 104 L320 120 V130Z" fill="var(--art-pine)" />
      <rect y={128} width={320} height={112} fill="var(--art-water)" />
      <path d="M210 146 h44 M218 158 h28 M224 170 h16" stroke="var(--art-amber)" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      {[
        [30, 200, 0],
        [250, 214, -1.6],
        [150, 226, -3],
      ].map(([x, y, d], i) => (
        <g key={i} className="art-ripple" style={delay(d)}>
          <path d={`M${x} ${y} h30`} stroke="var(--art-paper)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
      {/* a loon */}
      <g className="art-drift">
        <g className="art-bob">
          <path d="M66 184 h-22 M70 190 h-14" stroke="var(--art-paper)" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <path d="M80 182 Q86 164 116 166 Q142 168 150 180 Q120 190 80 182Z" fill="var(--art-ink)" />
          <path d="M138 172 Q144 160 146 150" stroke="var(--art-ink)" strokeWidth={9} strokeLinecap="round" fill="none" />
          <circle cx={147} cy={148} r={8} fill="var(--art-ink)" />
          <path d="M153 146 L168 150 L153 152Z" fill="var(--art-ink)" />
          <circle cx={149.5} cy={146} r={1.7} fill="var(--art-maple)" />
          <path d="M140 160 l5 -1 M139 164 l5 -1" stroke="var(--art-paper)" strokeWidth={1.3} strokeLinecap="round" />
          {[
            [96, 174],
            [104, 172],
            [112, 172],
            [120, 173],
            [128, 175],
            [100, 179],
            [108, 178],
            [116, 178],
            [124, 179],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.4} fill="var(--art-paper)" />
          ))}
        </g>
      </g>
    </>
  );
}

function Chat() {
  return (
    <>
      <g className="art-bob">
        <path d="M58 38 H176 Q196 38 196 58 V102 Q196 122 176 122 H98 L72 144 L78 122 H58 Q38 122 38 102 V58 Q38 38 58 38Z" fill="var(--art-teal)" />
        {[92, 117, 142].map((cx, i) => (
          <g key={cx} className="art-dot" style={delay(i * 0.2)}>
            <circle cx={cx} cy={80} r={7} fill="var(--art-paper)" />
          </g>
        ))}
      </g>
      <g className="art-bob" style={delay(-1.6)}>
        <path d="M146 112 H262 Q282 112 282 132 V170 Q282 190 262 190 H250 L256 214 L226 190 H146 Q126 190 126 170 V132 Q126 112 146 112Z" fill="var(--art-maple)" />
        <text x={204} y={163} textAnchor="middle" fontSize={34} fontWeight={700} fill="var(--art-paper)" fontFamily="inherit">
          eh?
        </text>
      </g>
      <Sparkle x={262} y={56} r={9} fill="var(--art-amber)" d={-0.4} />
      <Sparkle x={290} y={86} r={5} fill="var(--art-amber)" d={-1.1} />
      <Sparkle x={36} y={176} r={6} fill="var(--art-amber)" d={-0.8} />
    </>
  );
}

function Quiz() {
  return (
    <>
      <g transform="rotate(-13 160 124)">
        <rect x={105} y={54} width={110} height={140} rx={16} fill="var(--art-teal-soft)" />
      </g>
      <g transform="rotate(10 160 124)">
        <rect x={105} y={54} width={110} height={140} rx={16} fill="var(--art-amber-soft)" />
      </g>
      <g className="art-bob">
        <rect x={105} y={50} width={110} height={140} rx={16} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={2} />
        <text x={160} y={150} textAnchor="middle" fontSize={92} fontWeight={700} fill="var(--art-teal)" fontFamily="inherit">
          ?
        </text>
        <Leaf x={124} y={68} size={18} fill="var(--art-maple)" />
        <Leaf x={196} y={172} size={18} fill="var(--art-maple)" />
      </g>
      <Sparkle x={64} y={70} r={10} fill="var(--art-amber)" />
      <Sparkle x={258} y={60} r={7} fill="var(--art-amber)" d={-0.7} />
      <Sparkle x={250} y={190} r={9} fill="var(--art-amber)" d={-1.3} />
      <Sparkle x={74} y={182} r={5} fill="var(--art-amber)" d={-0.3} />
    </>
  );
}

const ART: Record<ArtName, { draw: () => ReactNode; scene: boolean }> = {
  maple: { draw: Maple, scene: false },
  parliament: { draw: Parliament, scene: true },
  canal: { draw: Canal, scene: true },
  tulips: { draw: Tulips, scene: true },
  lakes: { draw: Lakes, scene: true },
  chat: { draw: Chat, scene: false },
  quiz: { draw: Quiz, scene: false },
};

/** Scenes come framed in a rounded window; the others float on the slide. */
export function SlideArt({ name, className }: { name: ArtName; className?: string }) {
  const art = ART[name];
  if (!art) return null;
  return (
    <div className={cn("art", art.scene && "overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_-24px_rgba(31,29,26,0.45)]", className)} aria-hidden>
      <svg viewBox="0 0 320 240" className="block h-auto w-full">
        {art.draw()}
      </svg>
    </div>
  );
}
