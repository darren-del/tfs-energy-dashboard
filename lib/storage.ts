import { supabase } from './supabase'
import { Job } from './types'

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('data')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map((r: { data: Job }) => r.data)
}

export async function getJob(id: string): Promise<Job | undefined> {
  const { data, error } = await supabase
    .from('jobs')
    .select('data')
    .eq('id', id)
    .single()
  if (error) return undefined
  return data?.data as Job
}

export async function saveJob(job: Job): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .upsert({ id: job.id, data: job, created_at: job.createdAt }, { onConflict: 'id' })
  if (error) console.error(error)
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) console.error(error)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
