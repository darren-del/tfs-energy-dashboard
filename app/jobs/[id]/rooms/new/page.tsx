'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import FittingSelect from '@/components/FittingSelect'
import SavingsPreview from '@/components/SavingsPreview'
import { getJob, saveJob, generateId } from '@/lib/storage'
import { getAutoProposedFitting, PROPOSED_FITTINGS } from '@/lib/fittings'
import { Job, Room } from '@/lib/types'
import { ChevronLeft, Save, Lightbulb, CheckCircle2 } from 'lucide-react'

const inputCls = "w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-[#1a1c4e] placeholder-slate-300 focus:border-[#252768] focus:ring-4 focus:ring-[#252768]/8 transition-all text-sm outline-none font-medium"

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label className="block mb-1.5">
      <span className="text-[10px] font-bold text-[#252768]/70 uppercase tracking-widest">
        {children}
        {required && <span className="text-[#F2C519] ml-1">*</span>}
      </span>
      {hint && <span className="text-slate-400 text-xs ml-1.5 font-normal normal-case tracking-normal">{hint}</span>}
    </label>
  )
}

export default function NewRoomPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)

  const [areaDescription, setAreaDescription] = useState('')
  const [floor, setFloor] = useState('')
  const [currentFittingCode, setCurrentFittingCode] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [sufficientLighting, setSufficientLighting] = useState(true)
  const [ballastWattOverride, setBallastWattOverride] = useState('')
  const [proposedFittingCode, setProposedFittingCode] = useState('')
  const [comments, setComments] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    getJob(id).then(j => {
      if (!j) { router.push('/'); return }
      setJob(j)
    })
  }, [id])

  useEffect(() => {
    if (currentFittingCode) setProposedFittingCode(getAutoProposedFitting(currentFittingCode))
  }, [currentFittingCode])

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f0f2f8]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#252768] border-t-[#F2C519] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const partialRoom: Partial<Room> = {
    currentFittingCode,
    proposedFittingCode,
    quantity,
    hoursPerDay,
    ballastWattOverride: ballastWattOverride ? parseFloat(ballastWattOverride) : undefined,
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!areaDescription.trim()) e.areaDescription = 'Required'
    if (!currentFittingCode)     e.currentFittingCode = 'Required'
    if (!quantity || quantity < 1) e.quantity = 'At least 1'
    if (!proposedFittingCode)    e.proposedFittingCode = 'Required'
    return e
  }

  function buildRoom(): Room {
    return {
      id: generateId(),
      areaDescription: areaDescription.trim(),
      floor: floor.trim(),
      currentFittingCode,
      quantity,
      hoursPerDay,
      sufficientLighting,
      ballastWattOverride: ballastWattOverride ? parseFloat(ballastWattOverride) : undefined,
      proposedFittingCode,
      comments: comments.trim(),
    }
  }

  async function save() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const updated = { ...job!, rooms: [...job!.rooms, buildRoom()] }
    await saveJob(updated)
    router.push(`/jobs/${id}`)
  }

  async function saveAndAddAnother() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const updated = { ...job!, rooms: [...job!.rooms, buildRoom()] }
    await saveJob(updated); setJob(updated)
    const savedFloor = floor
    setAreaDescription(''); setCurrentFittingCode(''); setQuantity(1)
    setHoursPerDay(8); setSufficientLighting(true); setBallastWattOverride('')
    setProposedFittingCode(''); setComments(''); setErrors({})
    setFloor(savedFloor)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] pb-32">
      <NavBar />

      {/* Header */}
      <div className="bg-[#252768] relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-[30px] border-[#F2C519]/10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-bold uppercase tracking-wider mb-3 transition-colors"
          >
            <ChevronLeft size={14} /> {job.clientName}
          </button>
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-[#F2C519]" />
            <h1 className="font-display font-bold text-3xl text-white">Add Room / Area</h1>
          </div>
          <p className="text-white/50 text-sm mt-1 font-medium">
            {job.rooms.length} room{job.rooms.length !== 1 ? 's' : ''} recorded so far
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Section: Room Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent">
            <div className="w-7 h-7 rounded-lg bg-[#252768] flex items-center justify-center">
              <Lightbulb size={13} className="text-[#F2C519]" />
            </div>
            <span className="font-display font-bold text-[#252768] text-base">Room Details</span>
          </div>
          <div className="px-5 py-5 space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label required>Area Description</Label>
                <input
                  className={inputCls}
                  placeholder="e.g. Reception, Gym Floor, Changerooms"
                  value={areaDescription}
                  onChange={e => { setAreaDescription(e.target.value); setErrors(err => { const n={...err}; delete n.areaDescription; return n }) }}
                />
                {errors.areaDescription && <p className="text-red-400 text-xs mt-1 font-medium">{errors.areaDescription}</p>}
              </div>
              <div>
                <Label>Floor / Level</Label>
                <input className={inputCls} placeholder="e.g. Ground Floor, Level 2" value={floor} onChange={e => setFloor(e.target.value)} />
              </div>
            </div>

            <div>
              <Label required>Current Fitting Type</Label>
              <FittingSelect
                value={currentFittingCode}
                onChange={v => { setCurrentFittingCode(v); setErrors(err => { const n={...err}; delete n.currentFittingCode; return n }) }}
              />
              {errors.currentFittingCode && <p className="text-red-400 text-xs mt-1 font-medium">{errors.currentFittingCode}</p>}
            </div>

            {/* Quantity — large for mobile */}
            <div>
              <Label required>Number of Fittings</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-[#252768] hover:text-white text-slate-600 font-bold text-xl transition-all flex items-center justify-center flex-shrink-0"
                >−</button>
                <input
                  type="number" min="1"
                  className="flex-1 text-center px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-[#252768] font-display font-bold text-2xl outline-none focus:border-[#252768] transition-all"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 rounded-xl bg-[#252768] hover:bg-[#1a1c4e] text-white font-bold text-xl transition-all flex items-center justify-center flex-shrink-0"
                >+</button>
              </div>
              {errors.quantity && <p className="text-red-400 text-xs mt-1 font-medium">{errors.quantity}</p>}
            </div>

            {/* Hours per day */}
            <div>
              <Label>Hours On Per Day</Label>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400 font-bold w-3">1</span>
                <input
                  type="range" min="1" max="24" value={hoursPerDay}
                  onChange={e => setHoursPerDay(parseInt(e.target.value))}
                  className="flex-1 accent-[#252768]"
                />
                <span className="text-xs text-slate-400 font-bold w-4">24</span>
                <div className="flex items-center gap-1 bg-[#252768] text-white rounded-xl px-3 py-2 min-w-[60px] justify-center">
                  <input
                    type="number" min="1" max="24" value={hoursPerDay}
                    onChange={e => setHoursPerDay(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-8 bg-transparent text-center text-sm font-bold outline-none text-white"
                  />
                  <span className="text-xs text-white/60">h</span>
                </div>
              </div>
            </div>

            {/* Sufficient lighting toggle */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-bold text-[#1a1c4e]">Sufficient Lighting?</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Are current light levels adequate for this area?</p>
              </div>
              <button
                type="button"
                onClick={() => setSufficientLighting(!sufficientLighting)}
                className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${sufficientLighting ? 'bg-[#252768]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${sufficientLighting ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Ballast override */}
            <div>
              <Label hint={`(default: ${job.defaultBallastWatt}W)`}>Override Ballast Wattage</Label>
              <input
                type="number"
                className={inputCls}
                placeholder={`Leave blank to use default (${job.defaultBallastWatt}W)`}
                value={ballastWattOverride}
                onChange={e => setBallastWattOverride(e.target.value)}
              />
            </div>

            {/* Comments */}
            <div>
              <Label>Comments</Label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                placeholder="Notes about this room, condition of fittings, access issues..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section: Proposed fitting */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent">
            <p className="font-display font-bold text-[#252768] text-base">Proposed LED Replacement</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Auto-selected based on current fitting — override if needed</p>
          </div>
          <div className="px-5 py-4">
            <select
              className={inputCls}
              value={proposedFittingCode}
              onChange={e => { setProposedFittingCode(e.target.value); setErrors(err => { const n={...err}; delete n.proposedFittingCode; return n }) }}
            >
              <option value="">Select proposed LED fitting...</option>
              {PROPOSED_FITTINGS.map(f => (
                <option key={f.code} value={f.code}>
                  {f.label} — {f.watts}W — R {f.unitCost.toLocaleString('en-ZA')}
                </option>
              ))}
            </select>
            {errors.proposedFittingCode && <p className="text-red-400 text-xs mt-1 font-medium">{errors.proposedFittingCode}</p>}
          </div>
        </div>

        {/* Live savings preview */}
        <SavingsPreview room={partialRoom} job={job} />

        {/* Save buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={saveAndAddAnother}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-[#252768] text-[#252768] hover:bg-[#252768] hover:text-white font-bold px-5 py-4 rounded-xl transition-all text-sm"
          >
            <Save size={15} /> Save & Add Another Room
          </button>
          <button
            onClick={save}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] font-bold px-5 py-4 rounded-xl shadow-lg shadow-[#F2C519]/20 transition-all text-sm"
          >
            <CheckCircle2 size={15} /> Save Room
          </button>
        </div>
      </div>
    </div>
  )
}
