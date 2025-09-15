import { createClient } from '@supabase/supabase-js';

// Shared MVP Supabase Project - Hardcoded for hackathon demo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// TypeScript interface for form submissions
export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message?: string;
  phone?: string;
  company?: string;
  created_at?: string;
}

// Helper function to submit contact form
export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'created_at'>) {
  try {
    const { data: result, error } = await supabase
      .from('contacts')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to submit form. Please try again.');
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Form submission error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
