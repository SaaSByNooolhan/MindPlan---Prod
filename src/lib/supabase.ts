import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  monthly_budget?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  due_date?: string
  estimated_time?: number // in minutes
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  category: string
  color: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  is_recurring?: boolean
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrence_interval?: number
  next_occurrence?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  duration: number
  completed: boolean
  task_id?: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'trial_ending'
  start_date: string
  end_date?: string
  trial_end?: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  spent: number
  period: 'monthly' | 'weekly' | 'yearly'
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  recurrence_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrence_interval: number
  next_occurrence: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
