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

// ---- Bytown -------------------------------------------------------------------

function Locks() {
  const courses = [110, 124, 138, 152, 166, 180, 194, 208, 222];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      <path d="M0 98 Q80 82 160 94 T320 90 V130 H0Z" fill="var(--art-teal-soft)" />
      <Pine x={28} y={116} h={40} />
      <Pine x={58} y={114} h={30} />
      <Pine x={292} y={160} h={46} />
      {/* upper reach on the left, lower reach on the right */}
      <rect y={120} width={100} height={120} fill="var(--art-water)" />
      <rect y={112} width={96} height={8} fill="var(--art-leaf)" />
      <rect x={222} y={170} width={98} height={70} fill="var(--art-water)" />
      <rect x={226} y={162} width={94} height={8} fill="var(--art-leaf)" />
      {/* the chamber: wet stone behind, then water and boat rising and falling together */}
      <rect x={104} y={96} width={114} height={144} fill="var(--art-stone-dark)" opacity={0.55} />
      <g className="art-lift">
        <rect x={104} y={122} width={114} height={150} fill="var(--art-water)" />
        <path d="M126 112 H196 L188 124 H134Z" fill="var(--art-maple)" />
        <rect x={146} y={100} width={28} height={12} rx={2} fill="var(--art-paper)" />
        <rect x={150} y={103} width={7} height={5} fill="var(--art-sky)" />
        <rect x={163} y={103} width={7} height={5} fill="var(--art-sky)" />
        <path d="M160 100 V86" stroke="var(--art-ink)" strokeWidth={1.5} />
        <path d="M160 86 h11 l-3 3.5 l3 3.5 h-11z" fill="var(--art-amber)" />
      </g>
      <rect x={92} y={96} width={12} height={144} fill="var(--art-stone)" />
      <rect x={218} y={96} width={12} height={144} fill="var(--art-stone)" />
      {courses.map((y) => (
        <path key={y} d={`M92 ${y} h12 M218 ${y} h12`} stroke="var(--art-stone-dark)" strokeWidth={1} opacity={0.6} />
      ))}
      {/* the wooden gates */}
      <rect x={100} y={100} width={8} height={100} fill="var(--art-wood)" />
      <rect x={214} y={100} width={8} height={100} fill="var(--art-wood)" />
      <path d="M100 100 L108 200 M214 100 L222 200" stroke="var(--art-wood-dark)" strokeWidth={2} />
      <path d="M84 96 L112 92 M210 92 L238 96" stroke="var(--art-wood-dark)" strokeWidth={4} strokeLinecap="round" />
    </>
  );
}

function Log({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y - 7} width={w} height={14} rx={7} fill="var(--art-wood)" />
      <path d={`M${x + 10} ${y - 2} h${w * 0.45}`} stroke="var(--art-wood-dark)" strokeWidth={1.5} opacity={0.5} />
      <circle cx={x + w - 7} cy={y} r={6} fill="var(--art-stone)" stroke="var(--art-wood-dark)" strokeWidth={2} />
    </g>
  );
}

function Logs() {
  const logs = [
    { x: 14, y: 172, w: 70, d: 0 },
    { x: 214, y: 204, w: 80, d: -2 },
    { x: 46, y: 218, w: 64, d: -4 },
    { x: 238, y: 166, w: 56, d: -1 },
  ];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-amber-soft)" />
      <circle cx={252} cy={50} r={22} fill="var(--art-paper)" opacity={0.85} />
      <path d="M0 118 Q90 94 170 110 T320 102 V150 H0Z" fill="var(--art-teal-soft)" />
      <Pine x={24} y={118} h={36} />
      <Pine x={300} y={110} h={40} />
      {/* the bridge from Hull to Bytown */}
      <rect y={110} width={320} height={7} fill="var(--art-wood-dark)" />
      {[10, 60, 110, 160, 210, 260].map((x) => (
        <path key={x} d={`M${x} 117 L${x + 16} 146 M${x + 32} 117 L${x + 16} 146`} stroke="var(--art-wood-dark)" strokeWidth={3} />
      ))}
      <rect y={146} width={320} height={94} fill="var(--art-water)" />
      {logs.map((l, i) => (
        <g key={i} className="art-float" style={delay(l.d)}>
          <Log x={l.x} y={l.y} w={l.w} />
        </g>
      ))}
      {/* the raftsman */}
      <g className="art-bob">
        <Log x={108} y={190} w={104} />
        <path d="M150 184 L146 160 M166 184 L170 160" stroke="var(--art-ink)" strokeWidth={6} strokeLinecap="round" />
        <path d="M144 134 L128 150 M172 134 L192 152" stroke="var(--art-skin)" strokeWidth={6} strokeLinecap="round" />
        <rect x={140} y={122} width={36} height={42} rx={10} fill="var(--art-maple)" />
        <path d="M140 136 H176 M140 150 H176 M152 122 V164 M164 122 V164" stroke="var(--art-ink)" strokeWidth={1.3} opacity={0.3} />
        <circle cx={158} cy={110} r={11} fill="var(--art-skin)" />
        <path d="M147 112 Q158 130 169 112Z" fill="var(--art-wood-dark)" />
        <path d="M147 106 Q148 94 158 94 Q168 94 169 106Z" fill="var(--art-ink)" />
        <path d="M184 84 L214 202" stroke="var(--art-wood)" strokeWidth={4} strokeLinecap="round" />
      </g>
      {[
        [30, 200, 0],
        [250, 224, -1.8],
      ].map(([x, y, d], i) => (
        <g key={i} className="art-ripple" style={delay(d)}>
          <path d={`M${x} ${y} h26`} stroke="var(--art-paper)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </>
  );
}

function Raft() {
  const canoes = [
    [196, 214, 0],
    [244, 226, -1],
    [150, 230, -2],
  ];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      {/* the Chaudière Falls */}
      <path d="M0 36 H62 L72 200 H0Z" fill="var(--art-stone-dark)" />
      {[10, 24, 38, 52].map((x, i) => (
        <path key={x} className="art-pour" d={`M${x} 42 V206`} stroke="var(--art-paper)" strokeWidth={5} strokeLinecap="round" opacity={0.85} style={delay(-i * 0.25)} />
      ))}
      <rect y={198} width={320} height={42} fill="var(--art-water)" />
      {/* the timber slide */}
      <path d="M56 56 L304 176 L304 192 L56 72Z" fill="var(--art-wood)" />
      {[80, 120, 160, 200, 240, 280].map((x) => {
        const y = 56 + (x - 56) * 0.484;
        return <path key={x} d={`M${x} ${y} v16`} stroke="var(--art-wood-dark)" strokeWidth={2} />;
      })}
      <path className="art-pour" d="M60 62 L300 178" stroke="var(--art-water)" strokeWidth={4} strokeLinecap="round" />
      {/* a crib of timber, with a prince in a top hat on board */}
      <g className="art-chute">
        <g transform="translate(62 46) rotate(25.8)">
          <rect width={46} height={10} rx={3} fill="var(--art-wood-dark)" />
          <path d="M11 0 V10 M23 0 V10 M35 0 V10" stroke="var(--art-wood)" strokeWidth={1.5} />
          <rect x={9} y={-16} width={9} height={16} rx={3} fill="var(--art-maple)" />
          <circle cx={13.5} cy={-20} r={4.5} fill="var(--art-skin)" />
          <rect x={9.5} y={-32} width={8} height={9} fill="var(--art-ink)" />
          <rect x={7} y={-24} width={13} height={2} fill="var(--art-ink)" />
          <rect x={27} y={-15} width={9} height={15} rx={3} fill="var(--art-teal)" />
          <circle cx={31.5} cy={-19} r={4.5} fill="var(--art-skin)" />
        </g>
      </g>
      <Sparkle x={300} y={190} r={9} fill="var(--art-paper)" />
      <Sparkle x={286} y={182} r={5} fill="var(--art-paper)" d={-0.9} />
      {canoes.map(([x, y, d], i) => (
        <g key={i} className="art-bob" style={delay(d)}>
          <path d={`M${x - 20} ${y} Q${x} ${y + 9} ${x + 20} ${y} Z`} fill="var(--art-wood-dark)" />
          <circle cx={x - 4} cy={y - 5} r={3.5} fill="var(--art-skin)" />
          <circle cx={x + 7} cy={y - 5} r={3.5} fill="var(--art-skin)" />
        </g>
      ))}
    </>
  );
}

// ---- Parliament Hill ----------------------------------------------------------

function Bell() {
  const embers = [
    [64, 0],
    [104, -1.6],
    [226, -0.7],
    [262, -2.4],
    [196, -3.3],
    [86, -4],
  ];
  return (
    <>
      {embers.map(([x, d], i) => (
        <g key={i} className="art-ember" style={delay(d)}>
          <circle cx={x} cy={224} r={3} fill={i % 2 ? "var(--art-amber)" : "var(--art-maple)"} />
        </g>
      ))}
      <rect x={104} y={12} width={112} height={9} rx={3} fill="var(--art-wood-dark)" />
      <g className="art-swing">
        <circle cx={160} cy={32} r={9} fill="none" stroke="var(--art-bronze-dark)" strokeWidth={5} />
        <path d="M124 62 Q124 42 160 42 Q196 42 196 62 L202 130 Q208 148 228 156 H92 Q112 148 118 130Z" fill="var(--art-bronze)" />
        <path d="M120 80 H200 M118 132 H202" stroke="var(--art-bronze-dark)" strokeWidth={3} opacity={0.45} />
        <path d="M138 58 Q134 100 128 140" stroke="var(--art-paper)" strokeWidth={5} opacity={0.25} strokeLinecap="round" fill="none" />
        <path d="M160 152 V162" stroke="var(--art-bronze-dark)" strokeWidth={4} />
        <circle cx={160} cy={168} r={9} fill="var(--art-bronze-dark)" />
      </g>
      {[
        [244, 0],
        [262, -0.5],
      ].map(([x, d], i) => (
        <g key={i}>
          <g className="art-twinkle" style={delay(d)}>
            <path d={`M${x} ${80 - i * 10} Q${x + 18 + i * 8} 110 ${x} ${140 + i * 10}`} stroke="var(--art-amber)" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
          <g className="art-twinkle" style={delay(d)}>
            <path d={`M${320 - x} ${80 - i * 10} Q${302 - x - i * 8} 110 ${320 - x} ${140 + i * 10}`} stroke="var(--art-amber)" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </>
  );
}

function Dino() {
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      {/* the museum: its stone tower came down in 1915, and a glass one stands there now */}
      {Array.from({ length: 10 }, (_, k) => (
        <rect key={k} x={150 + k * 15} y={84} width={9} height={10} fill="var(--art-stone)" />
      ))}
      <rect x={150} y={92} width={150} height={106} fill="var(--art-stone)" />
      <rect x={205} y={34} width={40} height={58} fill="var(--art-ice)" stroke="var(--art-stone-dark)" strokeWidth={2} />
      <path d="M218 34 V92 M232 34 V92 M205 53 H245 M205 72 H245" stroke="var(--art-stone-dark)" strokeWidth={1.2} opacity={0.6} />
      {[166, 186, 256, 276].map((x) => (
        <g key={x}>
          <rect x={x - 5} y={106} width={10} height={20} rx={5} fill="var(--art-stone-dark)" />
          <rect x={x - 5} y={146} width={10} height={20} rx={5} fill="var(--art-stone-dark)" />
        </g>
      ))}
      <path d="M213 198 V162 Q225 146 237 162 V198Z" fill="var(--art-ink)" opacity={0.7} />
      <rect y={196} width={320} height={44} fill="var(--art-leaf)" />
      {/* a dinosaur, out front */}
      <path d="M72 158 Q40 150 10 182 Q44 166 76 174Z" fill="var(--art-teal)" />
      <rect x={78} y={174} width={15} height={26} rx={6} fill="var(--art-teal-deep)" />
      <rect x={118} y={174} width={15} height={26} rx={6} fill="var(--art-teal-deep)" />
      <ellipse cx={106} cy={164} rx={44} ry={26} fill="var(--art-teal)" />
      <rect x={90} y={176} width={15} height={26} rx={6} fill="var(--art-teal)" />
      <rect x={128} y={176} width={15} height={26} rx={6} fill="var(--art-teal)" />
      <circle cx={92} cy={154} r={5} fill="var(--art-teal-soft)" opacity={0.5} />
      <circle cx={110} cy={148} r={4} fill="var(--art-teal-soft)" opacity={0.5} />
      <circle cx={104} cy={162} r={3.5} fill="var(--art-teal-soft)" opacity={0.5} />
      <g className="art-neck">
        <path d="M128 156 Q150 120 152 84" stroke="var(--art-teal)" strokeWidth={18} strokeLinecap="round" fill="none" />
        <ellipse cx={160} cy={78} rx={17} ry={11} fill="var(--art-teal)" />
        <circle cx={164} cy={74} r={2.4} fill="var(--art-ink)" />
        <path d="M168 82 q4 2 7 -1" stroke="var(--art-ink)" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </g>
    </>
  );
}

function Cat() {
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      {/* the Peace Tower, far off */}
      <g opacity={0.6}>
        <rect x={266} y={52} width={20} height={110} fill="var(--art-paper)" />
        <path d="M262 52 L276 20 L290 52Z" fill="var(--art-paper)" />
      </g>
      <path d="M0 182 Q160 168 320 184 V240 H0Z" fill="var(--art-leaf)" />
      {/* a cat house like the ones the volunteers built */}
      <rect x={48} y={130} width={88} height={60} fill="var(--art-wood)" />
      <path d="M48 146 H136 M48 162 H136 M48 178 H136" stroke="var(--art-wood-dark)" strokeWidth={1.2} opacity={0.4} />
      <path d="M40 134 L92 96 L144 134Z" fill="var(--art-maple)" />
      <path d="M77 190 V162 Q92 146 107 162 V190Z" fill="var(--art-ink)" opacity={0.85} />
      <g className="art-blink" style={delay(-2)}>
        <circle cx={87} cy={170} r={2.6} fill="var(--art-amber)" />
        <circle cx={97} cy={170} r={2.6} fill="var(--art-amber)" />
      </g>
      {/* and a cat */}
      <g className="art-tail">
        <path d="M232 196 Q270 196 262 160 Q258 146 268 140" stroke="var(--art-amber)" strokeWidth={10} strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx={212} cy={172} rx={28} ry={30} fill="var(--art-amber)" />
      <ellipse cx={212} cy={182} rx={14} ry={18} fill="var(--art-amber-soft)" />
      <ellipse cx={200} cy={200} rx={8} ry={5} fill="var(--art-amber-soft)" />
      <ellipse cx={224} cy={200} rx={8} ry={5} fill="var(--art-amber-soft)" />
      <path d="M194 116 L192 94 L208 108Z M230 116 L232 94 L216 108Z" fill="var(--art-amber)" />
      <circle cx={212} cy={126} r={22} fill="var(--art-amber)" />
      <path d="M197 110 L196 101 L203 107Z M227 110 L228 101 L221 107Z" fill="var(--art-pink)" />
      <path d="M206 106 v6 M212 104 v7 M218 106 v6" stroke="var(--art-wood)" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      <g className="art-blink">
        <ellipse cx={204} cy={124} rx={2.6} ry={3.6} fill="var(--art-ink)" />
        <ellipse cx={220} cy={124} rx={2.6} ry={3.6} fill="var(--art-ink)" />
      </g>
      <path d="M209 132 h6 l-3 3.5z" fill="var(--art-pink)" />
      <path d="M200 134 h-16 M200 138 l-14 4 M224 134 h16 M224 138 l14 4" stroke="var(--art-ink)" strokeWidth={1} opacity={0.5} />
    </>
  );
}

function Flag() {
  const coats = ["var(--art-teal)", "var(--art-amber)", "var(--art-maple)", "var(--art-pine)"];
  return (
    <>
      <path d="M90 214 H306" stroke="var(--art-stone-dark)" strokeWidth={2} strokeLinecap="round" />
      <path d="M62 24 V214" stroke="var(--art-ink)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={62} cy={22} r={5} fill="var(--art-amber)" />
      <g transform="translate(64 30)">
        <g className="art-flag">
          <rect width={150} height={84} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
          <rect width={38} height={84} fill="var(--art-maple)" />
          <rect x={112} width={38} height={84} fill="var(--art-maple)" />
          <Leaf x={75} y={44} size={50} fill="var(--art-maple)" />
        </g>
      </g>
      {/* the queue for one */}
      {Array.from({ length: 7 }, (_, k) => {
        const x = 120 + k * 27;
        return (
          <g key={k} className="art-bob" style={delay(-k * 0.35)}>
            <circle cx={x} cy={184} r={6.5} fill="var(--art-skin)" />
            {k === 0 ? <path d={`M${x - 6.5} 183 Q${x} 172 ${x + 6.5} 183`} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1} /> : null}
            <rect x={x - 7.5} y={192} width={15} height={22} rx={6} fill={coats[k % coats.length]} />
            {k === 0 ? <path d={`M${x - 11} 196 V214`} stroke="var(--art-wood-dark)" strokeWidth={2.5} strokeLinecap="round" /> : null}
          </g>
        );
      })}
    </>
  );
}

// ---- Spies, stars and visitors ----------------------------------------------------

function Camera() {
  return (
    <>
      <path d="M160 150 L118 226 M160 150 L160 228 M160 150 L202 226" stroke="var(--art-wood-dark)" strokeWidth={5} strokeLinecap="round" />
      <rect x={146} y={144} width={28} height={10} rx={3} fill="var(--art-wood-dark)" />
      <path d="M176 94 L228 104 L228 136 L176 146Z" fill="var(--art-stone-dark)" />
      <path d="M190 97 V143 M204 99 V141 M216 101 V139" stroke="var(--art-ink)" strokeWidth={1.2} opacity={0.3} />
      <rect x={226} y={104} width={14} height={32} rx={3} fill="var(--art-ink)" />
      <circle cx={244} cy={120} r={13} fill="var(--art-ink)" />
      <circle cx={244} cy={120} r={7} fill="var(--art-ice)" />
      <circle cx={241} cy={117} r={2} fill="var(--art-paper)" />
      <rect x={96} y={82} width={82} height={70} rx={8} fill="var(--art-ink)" />
      <rect x={104} y={90} width={66} height={54} rx={4} fill="var(--art-wood)" />
      <path d="M112 100 H162 M112 112 H162 M112 124 H162 M112 136 H162" stroke="var(--art-wood-dark)" strokeWidth={1} opacity={0.4} />
      {/* the flash */}
      <path d="M114 82 V58" stroke="var(--art-ink)" strokeWidth={3} />
      <path d="M96 42 Q114 64 132 42Z" fill="var(--art-silver)" stroke="var(--art-silver-dark)" strokeWidth={1.5} />
      <circle cx={114} cy={48} r={5} fill="var(--art-paper)" />
      <g className="art-flash">
        <circle cx={114} cy={46} r={30} fill="var(--art-amber-soft)" opacity={0.9} />
        <path d="M114 6 Q114 46 154 46 Q114 46 114 86 Q114 46 74 46 Q114 46 114 6Z" fill="var(--art-amber)" />
      </g>
      {/* the cigar, taken away */}
      <g transform="rotate(-14 62 200)">
        <rect x={28} y={194} width={58} height={11} rx={5.5} fill="var(--art-wood)" />
        <rect x={68} y={194} width={7} height={11} fill="var(--art-maple)" />
        <g className="art-twinkle">
          <circle cx={86} cy={199.5} r={4.5} fill="var(--art-amber)" />
        </g>
      </g>
      {[0, -1.1, -2.2].map((d, i) => (
        <g key={i} className="art-smoke" style={delay(d)}>
          <path d={`M${88 + i * 5} 184 q-8 -10 0 -20 q8 -10 0 -20`} stroke="var(--art-stone-dark)" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </>
  );
}

function Secret() {
  return (
    <>
      <circle cx={268} cy={48} r={18} fill="var(--art-amber-soft)" />
      <Sparkle x={40} y={50} r={7} fill="var(--art-amber)" />
      <Sparkle x={290} y={110} r={5} fill="var(--art-amber)" d={-1.2} />
      <path d="M56 66 H128 L142 80 H262 V200 H56Z" fill="var(--art-stone-dark)" />
      <g className="art-peek">
        <rect x={84} y={52} width={148} height={130} rx={3} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
        <rect x={98} y={40} width={136} height={130} rx={3} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
        <path d="M112 58 H210 M112 70 H220 M112 82 H190" stroke="var(--art-stone-dark)" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      </g>
      <path d="M48 98 H272 L262 204 H58Z" fill="var(--art-amber-soft)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
      <g transform="rotate(-12 160 150)">
        <rect x={102} y={130} width={116} height={38} rx={4} fill="none" stroke="var(--art-maple)" strokeWidth={4} />
        <text x={160} y={157} textAnchor="middle" fontSize={23} fontWeight={800} letterSpacing={4} fill="var(--art-maple)" fontFamily="inherit">
          SECRET
        </text>
      </g>
    </>
  );
}

function Bunker() {
  const floors = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4];
  return (
    <>
      <rect width={320} height={86} fill="var(--art-sky)" />
      <rect y={80} width={320} height={160} fill="var(--art-soil)" />
      <path d="M0 120 Q80 112 160 122 T320 118 M0 170 Q90 162 170 172 T320 166 M0 214 Q100 206 190 216 T320 210" stroke="var(--art-wood-dark)" strokeWidth={1.5} fill="none" opacity={0.25} />
      <rect y={76} width={320} height={9} fill="var(--art-leaf)" />
      <Pine x={300} y={78} h={34} />
      <Pine x={16} y={78} h={26} />
      {/* the way in: a small shed on the surface */}
      <rect x={40} y={54} width={38} height={24} fill="var(--art-stone)" />
      <path d="M36 56 L59 42 L82 56Z" fill="var(--art-wood-dark)" />
      <rect x={53} y={62} width={12} height={16} fill="var(--art-ink)" opacity={0.7} />
      <path d="M59 86 V132 H110" stroke="var(--art-concrete)" strokeWidth={10} fill="none" />
      <path d="M258 76 V42" stroke="var(--art-ink)" strokeWidth={2.5} />
      <g className="art-twinkle">
        <path d="M248 40 Q258 30 268 40 M242 34 Q258 18 274 34" stroke="var(--art-teal)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
      {/* four floors underground */}
      <rect x={110} y={106} width={170} height={118} rx={4} fill="var(--art-concrete)" />
      <path d="M110 135 H280 M110 164 H280 M110 193 H280" stroke="var(--art-stone-dark)" strokeWidth={2} />
      {floors.flatMap((f) =>
        cols.map((c) => (
          <g key={`${f}-${c}`} className="art-flicker" style={delay(-((f * 5 + c) * 0.73) % 4)}>
            <rect x={122 + c * 26} y={114 + f * 29} width={15} height={11} rx={2} fill="var(--art-amber)" />
          </g>
        )),
      )}
      <rect x={258} y={110} width={14} height={110} fill="var(--art-ink)" opacity={0.2} />
      <g className="art-elevator">
        <rect x={259} y={112} width={12} height={18} rx={2} fill="var(--art-maple)" />
      </g>
    </>
  );
}

function Tree() {
  const crown: [number, number, number, string][] = [
    [96, 118, 34, "var(--art-pine)"],
    [68, 132, 24, "var(--art-pine)"],
    [124, 132, 24, "var(--art-pine)"],
    [96, 94, 22, "var(--art-leaf)"],
    [78, 112, 14, "var(--art-leaf)"],
  ];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      {/* Rideau Hall */}
      <rect x={150} y={84} width={164} height={62} fill="var(--art-stone)" />
      <path d="M206 84 L232 66 L258 84Z" fill="var(--art-stone-dark)" />
      <rect x={210} y={84} width={44} height={62} fill="var(--art-paper)" />
      <path d="M216 90 V146 M226 90 V146 M238 90 V146 M248 90 V146" stroke="var(--art-stone-dark)" strokeWidth={2} />
      {[160, 176, 192, 268, 284, 300].map((x) => (
        <g key={x}>
          <rect x={x} y={96} width={8} height={12} fill="var(--art-stone-dark)" />
          <rect x={x} y={120} width={8} height={12} fill="var(--art-stone-dark)" />
        </g>
      ))}
      <path d="M0 150 Q160 136 320 152 V240 H0Z" fill="var(--art-leaf)" />
      <g className="art-sway">
        <path d="M95 210 Q92 170 97 130" stroke="var(--art-wood)" strokeWidth={10} strokeLinecap="round" fill="none" />
        {crown.map(([cx, cy, r, f], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={f} />
        ))}
      </g>
      <path d="M58 212 Q96 190 134 212Z" fill="var(--art-soil)" />
      <g transform="rotate(28 172 190)">
        <rect x={168} y={118} width={6} height={72} rx={3} fill="var(--art-wood)" />
        <rect x={162} y={114} width={18} height={6} rx={3} fill="var(--art-wood-dark)" />
        <path d="M161 188 H181 V204 Q171 218 161 204Z" fill="var(--art-silver-dark)" />
      </g>
      {[
        [150, 200, 0],
        [158, 194, -0.6],
        [144, 190, -1.3],
      ].map(([x, y, d], i) => (
        <g key={i} className="art-hop" style={delay(d)}>
          <circle cx={x} cy={y} r={3.5} fill="var(--art-soil)" />
        </g>
      ))}
    </>
  );
}

function Castle() {
  const rows = [118, 140, 162];
  const cols = [84, 103, 122, 141, 179, 198, 217, 236];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-amber-soft)" />
      <circle cx={58} cy={44} r={18} fill="var(--art-paper)" />
      <Sparkle x={110} y={28} r={4} fill="var(--art-paper)" />
      <Sparkle x={290} y={36} r={5} fill="var(--art-paper)" d={-1.4} />
      <path d="M66 104 L86 62 H234 L254 104Z" fill="var(--art-copper)" />
      {[106, 136, 166, 196].map((x) => (
        <g key={x}>
          <path d={`M${x} 92 L${x + 9} 76 L${x + 18} 92Z`} fill="var(--art-stone)" />
          <rect x={x + 6} y={84} width={6} height={7} fill="var(--art-amber)" />
        </g>
      ))}
      <path d="M160 62 V40" stroke="var(--art-ink)" strokeWidth={1.5} />
      <rect x={70} y={104} width={180} height={80} fill="var(--art-stone)" />
      <rect x={50} y={92} width={30} height={92} fill="var(--art-stone)" />
      <path d="M46 92 L65 36 L84 92Z" fill="var(--art-copper)" />
      <rect x={240} y={92} width={30} height={92} fill="var(--art-stone)" />
      <path d="M236 92 L255 36 L274 92Z" fill="var(--art-copper)" />
      {rows.flatMap((y, r) =>
        cols.map((x, c) => (
          <g key={`${r}-${c}`} className="art-flicker" style={delay(-((r * 8 + c) * 0.61) % 4)}>
            <rect x={x} y={y} width={9} height={12} rx={1} fill="var(--art-amber)" />
          </g>
        )),
      )}
      <rect x={60} y={112} width={10} height={14} fill="var(--art-amber)" />
      <rect x={250} y={112} width={10} height={14} fill="var(--art-amber)" />
      <path d="M150 184 V164 Q160 152 170 164 V184Z" fill="var(--art-ink)" opacity={0.7} />
      <rect y={184} width={320} height={56} fill="var(--art-water)" />
      <path d="M84 196 h10 M122 202 h10 M198 196 h10 M236 204 h10" stroke="var(--art-amber)" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      {[
        [40, 212, 0],
        [170, 226, -1.5],
        [270, 216, -2.6],
      ].map(([x, y, d], i) => (
        <g key={i} className="art-ripple" style={delay(d)}>
          <path d={`M${x} ${y} h26`} stroke="var(--art-paper)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </>
  );
}

// ---- food, money and oddities -------------------------------------------------------

function Pastry() {
  // texture and sugar, kept inside the oval
  const inside = (x: number, y: number, k: number) => ((x - 160) / 96) ** 2 + ((y - 140) / 34) ** 2 < k;
  const marks: [number, number][] = [];
  for (let x = 76; x <= 244; x += 16) for (let y = 112; y <= 168; y += 12) if (inside(x, y, 0.72)) marks.push([x + ((y / 12) % 2) * 8, y]);
  const sugar: [number, number][] = [];
  for (let x = 82; x <= 240; x += 11) for (let y = 116; y <= 166; y += 9) if (inside(x, y, 0.8) && (x * 7 + y * 3) % 5 < 2) sugar.push([x, y]);
  return (
    <>
      <ellipse cx={160} cy={178} rx={124} ry={26} fill="var(--art-paper)" stroke="var(--art-stone-dark)" strokeWidth={1.5} />
      <g transform="rotate(-10 160 140)">
        <path d="M60 140 Q60 104 150 102 Q252 100 262 140 Q252 180 150 178 Q60 176 60 140Z" fill="var(--art-dough)" />
        <path d="M70 140 Q72 112 150 110 Q242 108 252 140" stroke="var(--art-paper)" strokeWidth={4} opacity={0.25} fill="none" strokeLinecap="round" />
        {marks.map(([x, y]) => (
          <path key={`m${x}-${y}`} d={`M${x - 4} ${y - 3} l8 6 M${x + 4} ${y - 3} l-8 6`} stroke="var(--art-wood)" strokeWidth={1.4} opacity={0.55} strokeLinecap="round" />
        ))}
        {sugar.map(([x, y]) => (
          <circle key={`s${x}-${y}`} cx={x} cy={y} r={1.6} fill="var(--art-wood-dark)" opacity={0.7} />
        ))}
        <path d="M222 112 Q244 110 250 126 Z" fill="var(--art-lemon)" stroke="var(--art-amber)" strokeWidth={1.5} />
      </g>
      {[120, 160, 200].map((x, i) => (
        <g key={x} className="art-smoke" style={delay(-i * 1.05)}>
          <path d={`M${x} 92 q-8 -10 0 -20 q8 -10 0 -20`} stroke="var(--art-stone-dark)" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </>
  );
}

function Coin() {
  const rungs = [0.12, 0.3, 0.48, 0.66, 0.84];
  return (
    <>
      <ellipse cx={142} cy={214} rx={74} ry={8} fill="var(--art-ink)" opacity={0.1} />
      <g className="art-spin-y">
        <circle cx={142} cy={118} r={88} fill="var(--art-gold-dark)" />
        <circle cx={142} cy={118} r={80} fill="var(--art-gold)" />
        <circle cx={142} cy={118} r={68} fill="none" stroke="var(--art-gold-dark)" strokeWidth={2} strokeDasharray="2 5" />
        <Leaf x={142} y={116} size={84} fill="var(--art-gold-dark)" />
        <path d="M90 68 Q112 48 142 46" stroke="var(--art-paper)" strokeWidth={6} opacity={0.4} fill="none" strokeLinecap="round" />
      </g>
      {/* the thieves' ladder */}
      <path d="M250 64 L272 216 M282 60 L304 212" stroke="var(--art-silver-dark)" strokeWidth={4} strokeLinecap="round" />
      {rungs.map((t) => (
        <path key={t} d={`M${250 + 22 * t} ${64 + 152 * t} L${282 + 22 * t} ${60 + 152 * t}`} stroke="var(--art-silver-dark)" strokeWidth={3} strokeLinecap="round" />
      ))}
      <Sparkle x={50} y={40} r={9} fill="var(--art-amber)" />
      <Sparkle x={236} y={30} r={6} fill="var(--art-amber)" d={-0.8} />
      <Sparkle x={36} y={170} r={6} fill="var(--art-amber)" d={-1.5} />
    </>
  );
}

function Spider() {
  // [knee x, knee y, foot x] for the left legs; the right ones mirror them
  const legs = [
    [116, 28, 66],
    [98, 50, 28],
    [92, 82, 104],
    [116, 100, 140],
  ];
  const leg = (kx: number, ky: number, fx: number) => `M160 80 Q${(160 + kx) / 2} ${ky - 26} ${kx} ${ky} Q${kx + (fx - kx) * 0.2} ${(ky + 214) / 2} ${fx} 214`;
  return (
    <>
      <path d="M8 214 H312" stroke="var(--art-stone-dark)" strokeWidth={2} strokeLinecap="round" />
      {legs.map(([kx, ky, fx], i) => (
        <g key={i}>
          <path d={leg(kx, ky, fx)} stroke="var(--art-bronze-dark)" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={leg(320 - kx, ky, 320 - fx)} stroke="var(--art-bronze-dark)" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={160} cy={76} rx={22} ry={15} fill="var(--art-bronze-dark)" />
      <ellipse cx={160} cy={102} rx={13} ry={13} fill="var(--art-bronze)" />
      <circle cx={155} cy={99} r={3.2} fill="var(--art-paper)" />
      <circle cx={164} cy={102} r={3.2} fill="var(--art-paper)" />
      <circle cx={158} cy={108} r={3.2} fill="var(--art-paper)" />
      {/* a small one on a thread, and a visitor for scale */}
      <g className="art-dangle">
        <path d="M262 -80 V62" stroke="var(--art-stone-dark)" strokeWidth={1} />
        <circle cx={262} cy={66} r={5} fill="var(--art-ink)" />
        <path d="M255 62 l-4 -3 M255 67 l-5 0 M255 71 l-4 3 M269 62 l4 -3 M269 67 l5 0 M269 71 l4 3" stroke="var(--art-ink)" strokeWidth={1.4} strokeLinecap="round" />
      </g>
      <g className="art-walk">
        <circle cx={160} cy={186} r={5.5} fill="var(--art-skin)" />
        <rect x={154} y={192} width={12} height={14} rx={5} fill="var(--art-teal)" />
        <path d="M157 205 L155 214 M163 205 L165 214" stroke="var(--art-ink)" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </>
  );
}

function Cow() {
  const towers: [number, number, number][] = [
    [196, 50, 26],
    [226, 30, 22],
    [252, 62, 28],
    [284, 40, 24],
  ];
  return (
    <>
      <rect width={320} height={240} fill="var(--art-sky)" />
      {/* the city, right behind the farm */}
      {towers.map(([x, y, w]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={150 - y} fill="var(--art-paper)" opacity={0.75} />
          {Array.from({ length: Math.floor((140 - y) / 16) }, (_, k) => (
            <rect key={k} x={x + 5} y={y + 8 + k * 16} width={w - 10} height={5} fill="var(--art-sky)" />
          ))}
        </g>
      ))}
      <path d="M0 140 Q160 128 320 142 V240 H0Z" fill="var(--art-leaf)" />
      <path d="M0 158 H320 M0 172 H320" stroke="var(--art-wood)" strokeWidth={3} />
      {Array.from({ length: 11 }, (_, k) => (
        <rect key={k} x={4 + k * 32} y={150} width={5} height={30} fill="var(--art-wood-dark)" />
      ))}
      {/* the barn */}
      <rect x={22} y={98} width={80} height={74} fill="var(--art-maple)" />
      <path d="M16 102 L62 64 L108 102Z" fill="var(--art-wood-dark)" />
      <rect x={46} y={130} width={32} height={42} fill="var(--art-maple)" stroke="var(--art-paper)" strokeWidth={2.5} />
      <path d="M46 130 L78 172 M78 130 L46 172" stroke="var(--art-paper)" strokeWidth={2.5} />
      <rect x={54} y={106} width={16} height={14} fill="var(--art-paper)" />
      {/* the cow */}
      <g className="art-tail">
        <path d="M244 150 Q258 170 250 196" stroke="var(--art-ink)" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
      {[160, 178, 214, 230].map((x) => (
        <g key={x}>
          <rect x={x} y={180} width={11} height={30} rx={3} fill="var(--art-paper)" stroke="var(--art-ink)" strokeWidth={1.5} />
          <rect x={x} y={204} width={11} height={7} rx={2} fill="var(--art-ink)" />
        </g>
      ))}
      <rect x={150} y={138} width={96} height={50} rx={22} fill="var(--art-paper)" stroke="var(--art-ink)" strokeWidth={2} />
      <path d="M170 140 Q186 150 178 168 Q166 172 162 156Z M210 146 Q230 140 236 158 Q222 170 208 160Z" fill="var(--art-ink)" />
      <ellipse cx={204} cy={190} rx={9} ry={5} fill="var(--art-pink)" />
      <g className="art-graze">
        <path d="M134 150 l-6 -8 M156 150 l6 -8" stroke="var(--art-stone-dark)" strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={128} cy={156} rx={8} ry={4} fill="var(--art-ink)" />
        <ellipse cx={164} cy={156} rx={8} ry={4} fill="var(--art-ink)" />
        <ellipse cx={146} cy={166} rx={18} ry={16} fill="var(--art-paper)" stroke="var(--art-ink)" strokeWidth={2} />
        <ellipse cx={144} cy={178} rx={13} ry={8} fill="var(--art-pink)" />
        <circle cx={139} cy={178} r={1.6} fill="var(--art-ink)" />
        <circle cx={149} cy={178} r={1.6} fill="var(--art-ink)" />
        <circle cx={139} cy={162} r={2.2} fill="var(--art-ink)" />
        <circle cx={153} cy={162} r={2.2} fill="var(--art-ink)" />
      </g>
    </>
  );
}

// ---- winter -----------------------------------------------------------------------

function Trophy() {
  const flakes = Array.from({ length: 8 }, (_, i) => ({ x: 20 + i * 40, d: -i * 1.1 }));
  return (
    <>
      {flakes.map((f, i) => (
        <g key={i} className="art-snow" style={delay(f.d, 9)}>
          <circle cx={f.x} cy={-6} r={2} fill="var(--art-sky)" />
        </g>
      ))}
      <ellipse cx={160} cy={212} rx={140} ry={14} fill="var(--art-ice)" stroke="var(--art-sky)" strokeWidth={2} />
      <g className="art-slide">
        <ellipse cx={70} cy={210} rx={12} ry={4} fill="var(--art-ink)" />
      </g>
      <g className="art-bob">
        <path d="M110 40 H210 Q208 88 160 96 Q112 88 110 40Z" fill="var(--art-silver)" />
        <ellipse cx={160} cy={40} rx={50} ry={9} fill="var(--art-silver-dark)" />
        <ellipse cx={160} cy={39} rx={44} ry={6} fill="var(--art-paper)" opacity={0.7} />
        <rect x={146} y={94} width={28} height={14} fill="var(--art-silver-dark)" />
        <rect x={128} y={108} width={64} height={22} rx={2} fill="var(--art-silver)" />
        <rect x={120} y={130} width={80} height={22} rx={2} fill="var(--art-silver-dark)" />
        <rect x={114} y={152} width={92} height={22} rx={2} fill="var(--art-silver)" />
        <rect x={106} y={174} width={108} height={24} rx={2} fill="var(--art-silver-dark)" />
        <path d="M136 119 h48 M128 141 h64 M122 163 h76 M114 186 h92" stroke="var(--art-paper)" strokeWidth={1.5} strokeDasharray="3 4" opacity={0.7} />
        <path d="M124 52 Q128 76 146 86" stroke="var(--art-paper)" strokeWidth={5} opacity={0.5} fill="none" strokeLinecap="round" />
      </g>
      <Sparkle x={74} y={70} r={9} fill="var(--art-amber)" />
      <Sparkle x={252} y={60} r={7} fill="var(--art-amber)" d={-0.9} />
      <Sparkle x={240} y={150} r={6} fill="var(--art-amber)" d={-1.6} />
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
  locks: { draw: Locks, scene: true },
  logs: { draw: Logs, scene: true },
  raft: { draw: Raft, scene: true },
  bell: { draw: Bell, scene: false },
  dino: { draw: Dino, scene: true },
  cat: { draw: Cat, scene: true },
  flag: { draw: Flag, scene: false },
  camera: { draw: Camera, scene: false },
  secret: { draw: Secret, scene: false },
  bunker: { draw: Bunker, scene: true },
  tree: { draw: Tree, scene: true },
  castle: { draw: Castle, scene: true },
  pastry: { draw: Pastry, scene: false },
  coin: { draw: Coin, scene: false },
  spider: { draw: Spider, scene: false },
  cow: { draw: Cow, scene: true },
  trophy: { draw: Trophy, scene: false },
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
