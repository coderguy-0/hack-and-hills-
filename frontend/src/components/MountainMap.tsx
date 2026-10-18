import { motion } from 'framer-motion'
import { Checkpoint } from '../lib/api'

type Props = {
  checkpoints: Checkpoint[]
  onSelect?: (cp: Checkpoint) => void
  activeId?: string
}

const statusColor: Record<string, string> = {
  passed: '#10B981',
  failed: '#EF4444',
  running: '#F59E0B',
  pending: '#334155',
  blocked: '#64748B'
}
const statusGlow: Record<string, string> = {
  passed: '0 0 16px rgba(16,185,129,0.6)',
  failed: '0 0 16px rgba(239,68,68,0.6)',
  running: '0 0 16px rgba(245,158,11,0.7)',
  pending: 'none',
  blocked: 'none'
}

export function MountainMap({ checkpoints, onSelect, activeId }: Props) {
  const reds = checkpoints.filter(c => c.route === 'red')
  const blues = checkpoints.filter(c => c.route === 'blue')

  // generate mountain path positions along a zig-zag ascent
  const nodes = checkpoints.map((cp, i) => {
    // alternate red/blue positioning along the mountain
    const t = i / Math.max(1, checkpoints.length - 1) // 0..1 up mountain
    // mountain silhouette: bottom wide, top narrow
    const baseY = 380
    const topY = 40
    const y = baseY - t * (baseY - topY) + (Math.sin(i * 0.9) * 10)
    // left/right zigzag: red on left slope, blue on right slope
    const centerX = 400
    const widthAtHeight = 260 * (1 - t * 0.55) // narrows toward top
    const side = cp.route === 'red' ? -1 : 1
    const x = centerX + side * (widthAtHeight * 0.55) + Math.cos(i * 1.2) * 12
    return { cp, x, y, t }
  })

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-900 via-[#0B1222] to-[#060A14] border border-white/10">
      {/* summit glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-gradient-to-b from-amber-500/15 via-orange-500/8 to-transparent blur-[40px] rounded-full" />
        <div className="absolute inset-0 grid-pattern opacity-[0.35]" />
      </div>

      {/* legend */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-white text-black font-semibold">THE ASCENT</span>
          <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 backdrop-blur">Click checkpoints for evidence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-300"><span className="w-2 h-2 rounded-full bg-red-500" /> Red route</span>
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-300"><span className="w-2 h-2 rounded-full bg-sky-400" /> Blue route</span>
        </div>
      </div>

      <svg viewBox="0 0 800 440" className="w-full h-[440px] mountain-svg relative z-0">
        <defs>
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#0F172A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glowRed"><feGaussianBlur stdDeviation="6" result="c" /><feMerge><feMergeNode in="c" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* mountain silhouette */}
        <path
          d="M 40 400 L 180 220 L 260 160 L 340 90 L 400 42 L 460 90 L 540 160 L 620 220 L 760 400 Z"
          fill="url(#mountainGrad)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
        {/* snow cap */}
        <path
          d="M 330 102 L 400 42 L 470 102 L 444 118 L 400 88 L 356 118 Z"
          fill="url(#snowGrad)"
          opacity="0.9"
        />
        {/* contour lines */}
        <path d="M 120 340 Q 400 310 680 340" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
        <path d="M 180 280 Q 400 250 620 280" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" strokeDasharray="6 8" />
        <path d="M 240 210 Q 400 190 560 210" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />

        {/* routes: connect nodes in order */}
        {(() => {
          const mkPath = (list: typeof nodes) => {
            if (list.length < 2) return ''
            return list.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
          }
          const redNodes = nodes.filter(n => n.cp.route === 'red')
          const blueNodes = nodes.filter(n => n.cp.route === 'blue')
          return (
            <>
              <path d={mkPath(redNodes)} fill="none" stroke="#EF4444" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 6" />
              <path d={mkPath(blueNodes)} fill="none" stroke="#38BDF8" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 6" />
              {/* completed solid overlay up to last passed */}
              <path d={mkPath(redNodes.filter(n => n.cp.status !== 'pending'))} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
              <path d={mkPath(blueNodes.filter(n => n.cp.status !== 'pending'))} fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
            </>
          )
        })()}

        {/* base camp & summit markers */}
        <g>
          <circle cx="400" cy="400" r="22" fill="#0F172A" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <text x="400" y="404" textAnchor="middle" fontSize="11" fill="white">⛺</text>
          <text x="400" y="424" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="Space Grotesk">BASE CAMP</text>
        </g>
        <g>
          <circle cx="400" cy="42" r="18" fill="#F59E0B" />
          <circle cx="400" cy="42" r="26" fill="none" stroke="#F59E0B" strokeOpacity="0.25" strokeWidth="2" />
          <text x="400" y="46" textAnchor="middle" fontSize="12">◆</text>
          <text x="400" y="24" textAnchor="middle" fontSize="9" fill="#FDE68A" fontWeight="700" letterSpacing="0.08em">SUMMIT</text>
        </g>

        {/* checkpoint nodes */}
        {nodes.map(({ cp, x, y }) => (
          <g key={cp.id} onClick={() => onSelect?.(cp)} style={{ cursor: 'pointer' }}>
            {/* halo for active/running */}
            {(cp.status === 'running' || activeId === cp.id) && (
              <circle cx={x} cy={y} r="22" fill="none" stroke={statusColor[cp.status] || '#334155'} strokeOpacity="0.35" strokeWidth="2">
                <animate attributeName="r" values="16;22;16" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={x} cy={y} r={cp.status === 'running' ? 11 : 10}
              fill={cp.status === 'pending' ? '#1E293B' : statusColor[cp.status]}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="2"
              style={{ filter: `drop-shadow(${statusGlow[cp.status]})` }}
            />
            {/* inner icon */}
            <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
              {cp.status === 'passed' ? '✓' : cp.status === 'failed' ? '✕' : cp.status === 'running' ? '◐' : '•'}
            </text>
            {/* label */}
            <g>
              <rect x={cp.route === 'red' ? x - 108 : x + 14} y={y - 10} width="94" height="20" rx="8" fill="rgba(11,18,34,0.85)" stroke="rgba(255,255,255,0.12)" />
              <text x={cp.route === 'red' ? x - 61 : x + 61} y={y + 3} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.9)" fontWeight="600">
                {cp.name.length > 22 ? cp.name.slice(0, 22) + '…' : cp.name}
              </text>
            </g>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
