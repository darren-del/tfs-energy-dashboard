'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { saveJob, generateId } from '@/lib/storage'
import { Job } from '@/lib/types'
import { CheckCircle2, ChevronRight, ChevronLeft, User, Settings2, ClipboardList, Zap } from 'lucide-react'

const steps = [
  { id: 1, label: 'Client Details',     icon: User },
  { id: 2, label: 'Financial Settings', icon: Settings2 },
  { id: 3, label: 'Review & Create',    icon: ClipboardList },
]

const today = new Date().toISOString().split('T')[0]
const defaultForm = {
  clientName: '', contactPerson: '', siteAddress: '', date: today,
  vatNumber: '', contactNumber: '', email: '',
  costPerKwh: 2.5, eskomIncrease: 12, defaultBallastWatt: 10,
  installPerFitting: 150, disposalPerFitting: 50,
}

const inputCls = "w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-[#1a1c4e] placeholder-slate-300 focus:border-[#252768] focus:ring-4 focus:ring-[#252768]/8 transition-all text-sm outline-none font-medium"

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#252768] mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
        {label} {required && <span className="text-[#F2C519] ml-0.5">*</span>}
        {hint && <span className="text-slate-400 ml-1 normal-case font-normal tracking-normal text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function NewJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(key: keyof typeof defaultForm, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.clientName.trim()) e.clientName = 'Required'
    if (!form.contactPerson.trim()) e.contactPerson = 'Required'
    if (!form.siteAddress.trim()) e.siteAddress = 'Required'
    if (!form.date) e.date = 'Required'
    return e
  }

  function next() {
    const e = step === 1 ? validateStep1() : {}
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setStep(s => s + 1)
  }

  async function create() {
    const job: Job = {
      id: generateId(),
      ...form,
      rooms: [],
      createdAt: new Date().toISOString(),
      status: 'draft',
    }
    await saveJob(job)
    router.push(`/jobs/${job.id}`)
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8]">
      <NavBar />

      {/* Header */}
      <div className="bg-[#252768] relative overflow-hidden">
        <div className="absolute -right-10 top-0 w-40 h-40 rounded-full border-[30px] border-[#F2C519]/10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center gap-2 text-[#F2C519]/70 text-xs font-bold uppercase tracking-widest mb-2">
            <Zap size={12} /> New Audit
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Create Lighting Audit</h1>
          <p className="text-white/50 text-sm mt-1 font-medium">Set up a new client site audit in 3 quick steps</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon
            const done   = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                    done   ? 'bg-[#252768] text-white shadow-[#252768]/20' :
                    active ? 'bg-[#F2C519] text-[#252768] shadow-[#F2C519]/30' :
                             'bg-white text-slate-300 border-2 border-slate-200'
                  }`}>
                    {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
                    active ? 'text-[#252768]' : done ? 'text-[#252768]/60' : 'text-slate-300'
                  }`} style={{ fontSize: '10px' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-10 sm:w-16 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                    done ? 'bg-[#252768]' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-[#252768]/3 to-transparent">
            <div className="w-9 h-9 rounded-lg bg-[#252768] flex items-center justify-center flex-shrink-0">
              {(() => { const Icon = steps[step-1].icon; return <Icon size={16} className="text-[#F2C519]" /> })()}
            </div>
            <div>
              <h2 className="font-display font-bold text-[#252768] text-xl">{steps[step-1].label}</h2>
              <p className="text-xs text-slate-400 font-medium">Step {step} of 3</p>
            </div>
          </div>

          <div className="px-6 py-6">

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Company / Client Name" required>
                    <input className={inputCls} placeholder="e.g. Virgin Active Vodaworld"
                      value={form.clientName} onChange={e => set('clientName', e.target.value)} />
                    {errors.clientName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.clientName}</p>}
                  </Field>
                  <Field label="Contact Person" required>
                    <input className={inputCls} placeholder="e.g. John Smith"
                      value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
                    {errors.contactPerson && <p className="text-red-500 text-xs mt-1 font-medium">{errors.contactPerson}</p>}
                  </Field>
                </div>
                <Field label="Site Address" required>
                  <input className={inputCls} placeholder="e.g. Vodaworld Shopping Centre, Midrand"
                    value={form.siteAddress} onChange={e => set('siteAddress', e.target.value)} />
                  {errors.siteAddress && <p className="text-red-500 text-xs mt-1 font-medium">{errors.siteAddress}</p>}
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Audit Date" required>
                    <input type="date" className={inputCls}
                      value={form.date} onChange={e => set('date', e.target.value)} />
                  </Field>
                  <Field label="VAT Number">
                    <input className={inputCls} placeholder="Optional"
                      value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Contact Number">
                    <input className={inputCls} placeholder="e.g. 011 555 1234"
                      value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" className={inputCls} placeholder="e.g. john@company.co.za"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-[#F2C519]/10 border border-[#F2C519]/30 rounded-xl p-4 flex items-start gap-3">
                  <Zap size={15} className="text-[#d4a900] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#7a6000] font-medium leading-relaxed">
                    These settings drive all energy and savings calculations. You can update them later in Job Settings.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Cost per kWh (R)" required>
                    <input type="number" step="0.01" className={inputCls} placeholder="2.50"
                      value={form.costPerKwh} onChange={e => set('costPerKwh', parseFloat(e.target.value) || 0)} />
                  </Field>
                  <Field label="Projected Eskom Increase" hint="(% per year)">
                    <input type="number" step="1" className={inputCls} placeholder="12"
                      value={form.eskomIncrease} onChange={e => set('eskomIncrease', parseFloat(e.target.value) || 0)} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Default Ballast Watt">
                    <input type="number" className={inputCls} placeholder="10"
                      value={form.defaultBallastWatt} onChange={e => set('defaultBallastWatt', parseFloat(e.target.value) || 0)} />
                  </Field>
                  <Field label="Install Cost / Fitting (R)">
                    <input type="number" className={inputCls} placeholder="150"
                      value={form.installPerFitting} onChange={e => set('installPerFitting', parseFloat(e.target.value) || 0)} />
                  </Field>
                  <Field label="Disposal Cost / Fitting (R)">
                    <input type="number" className={inputCls} placeholder="50"
                      value={form.disposalPerFitting} onChange={e => set('disposalPerFitting', parseFloat(e.target.value) || 0)} />
                  </Field>
                </div>
              </div>
            )}

            {/* ─── STEP 3 — Review ─── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">Review your details before creating the audit job.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Client',           value: form.clientName },
                    { label: 'Contact Person',   value: form.contactPerson },
                    { label: 'Site Address',     value: form.siteAddress },
                    { label: 'Date',             value: form.date },
                    { label: 'VAT Number',       value: form.vatNumber || '—' },
                    { label: 'Contact Number',   value: form.contactNumber || '—' },
                    { label: 'Email',            value: form.email || '—' },
                    { label: 'Cost per kWh',     value: `R ${form.costPerKwh}` },
                    { label: 'Eskom Increase',   value: `${form.eskomIncrease}%` },
                    { label: 'Install/Fitting',  value: `R ${form.installPerFitting}` },
                  ].map(item => (
                    <div key={item.label} className="bg-[#252768]/4 border border-[#252768]/8 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-[#252768]/50 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-bold text-[#1a1c4e] mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
              >
                <ChevronLeft size={15} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 bg-[#252768] hover:bg-[#1a1c4e] text-white font-bold px-6 py-2.5 rounded-xl shadow-sm shadow-[#252768]/20 transition-all text-sm"
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={create}
                className="flex items-center gap-2 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] font-bold px-6 py-2.5 rounded-xl shadow-sm shadow-[#F2C519]/30 transition-all text-sm"
              >
                <CheckCircle2 size={15} /> Create Job & Start Audit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
