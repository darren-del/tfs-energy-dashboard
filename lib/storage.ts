import { Job } from './types'

const STORAGE_KEY = 'tfs_energy_jobs'

export function getJobs(): Job[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveJob(job: Job): void {
  const jobs = getJobs()
  const idx = jobs.findIndex(j => j.id === job.id)
  if (idx >= 0) {
    jobs[idx] = job
  } else {
    jobs.unshift(job)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

export function getJob(id: string): Job | undefined {
  return getJobs().find(j => j.id === id)
}

export function deleteJob(id: string): void {
  const jobs = getJobs().filter(j => j.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
