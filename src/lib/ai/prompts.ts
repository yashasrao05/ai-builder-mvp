import { ComponentData, GenerationOptions } from './types';

export const SYSTEM_PROMPTS = {
  CODE_GENERATOR: `You are an expert React/Next.js developer generating production-ready code.

CRITICAL OUTPUT FORMAT:
Respond with ONLY valid JSON in this exact structure:
{
  "files": [
    {
      "path": "src/components/ContactForm.tsx",
      "content": "COMPLETE_TYPESCRIPT_CODE_HERE",
      "type": "component",
      "language": "typescript"
    }
  ]
}`,

  WORKING_FORM_TEMPLATE: `
// WORKING FORM TEMPLATE - This actually saves to Supabase
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    phone: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      console.log('🚀 Submitting to Supabase:', formData);
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim() || null,
          phone: formData.phone?.trim() || null,
          company: formData.company?.trim() || null
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(\`Database error: \${error.message}\`);
      }

      console.log('✅ Successfully saved to Supabase:', data);

      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your message has been saved to the database.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        phone: '',
        company: ''
      });

    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: \`Error: \${error.message || 'Failed to save. Please check your Supabase setup.'}\`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Us</h2>
          
          {submitStatus.type && (
            <div className={\`p-4 rounded-md mb-6 \${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }\`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {submitStatus.type === 'success' ? '✅' : '❌'}
                </div>
                <div className="ml-3">
                  <div className="text-sm">
                    {submitStatus.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving to Database...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Data will be saved to your Supabase database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`
};

export const buildCodeGenerationPrompt = (request: { components: ComponentData[]; options: GenerationOptions; target: string }) => {
  const { components, options, target } = request;
  
  // Check for form components
  const formComponents = components.filter(comp => comp.type === 'form');
  const hasFormComponent = formComponents.length > 0;
  
  if (hasFormComponent) {
    // Generate form-specific code
    return `${SYSTEM_PROMPTS.CODE_GENERATOR}

GENERATE WORKING SUPABASE FORM:

Use this EXACT template structure:
${SYSTEM_PROMPTS.WORKING_FORM_TEMPLATE}

REQUIREMENTS:
1. Use the exact code structure above
2. Include console.log statements for debugging
3. Show detailed error messages
4. Handle Supabase connection errors
5. Reset form after successful submission
6. Include loading states

COMPONENT DATA:
${JSON.stringify(formComponents[0], null, 2)}

Generate the complete ContactForm.tsx component that ACTUALLY saves to Supabase database.`;
  }

  // Standard component generation (no forms)
  return `${SYSTEM_PROMPTS.CODE_GENERATOR}

Generate clean React components for the provided design.

COMPONENT DATA:
${JSON.stringify(components, null, 2)}

Generate appropriate React components with Tailwind styling.`;
};
