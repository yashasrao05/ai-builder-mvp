'use client';

import React, { useState } from 'react';
import type { JSX } from 'react';
import { ComponentData } from '@/lib/types';
import { getComponentDefinition } from '@/lib/components';

interface ComponentContentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export default function ComponentContent({
  component,
  isPreview = false,
}: ComponentContentProps) {
  const definition = getComponentDefinition(component.type);
  if (!definition) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
        Unknown component type: {component.type}
      </div>
    );
  }

  const { props, style } = component;

  // Helper to coerce unknown into string
  const getString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : fallback;

  // Helper to coerce unknown into boolean
  const getBoolean = (value: unknown): boolean =>
    typeof value === 'boolean' ? value : false;

  // Render based on component type
  switch (component.type) {
    case 'text': {
      const Tag = getString(props.tag, 'p') as keyof JSX.IntrinsicElements;
      return (
        <Tag
          className={style.className}
          style={{
            fontSize: style.fontSize,
            color: style.textColor,
          }}
        >
          {getString(props.text)}
        </Tag>
      );
    }

    case 'button':
      return (
        <button
          className={style.className}
          onClick={isPreview ? undefined : (e) => e.preventDefault()}
        >
          {getString(props.text)}
        </button>
      );

    case 'input':
      return (
        <input
          type={getString(props.type, 'text')}
          placeholder={getString(props.placeholder)}
          required={getBoolean(props.required)}
          className={style.className}
          onChange={isPreview ? undefined : () => {}}
        />
      );

    case 'container':
      return (
        <div
          className={`${style.className} flex ${
            getString(props.direction, 'column') === 'row' ? 'flex-row' : 'flex-col'
          }`}
          style={{ gap: getString(props.gap, '0') }}
        >
          {/* Container placeholder */}
          {isPreview
            ? component.children?.map((child) => (
                <ComponentContent
                  key={child.id}
                  component={child}
                  isPreview={isPreview}
                />
              ))
            : <div className="w-full h-full flex items-center justify-center text-gray-400">Drop elements here</div>}
        </div>
      );

    case 'image': {
      const objectFitValue = getString(props.fit, 'cover') as
        | 'fill'
        | 'contain'
        | 'cover'
        | 'none'
        | 'scale-down';

      return (
        <img
          src={getString(props.src)}
          alt={getString(props.alt)}
          className={style.className}
          style={{ objectFit: objectFitValue }}
        />
      );
    }

    case 'hero': {
      const title = getString(props.title);
      const subtitle = getString(props.subtitle);
      const buttonText = getString(props.buttonText);
      const backgroundImage = getString(props.backgroundImage);
      return (
        <div
          className={style.className}
          style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        >
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl mb-6 opacity-90">{subtitle}</p>
          {buttonText && (
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {buttonText}
            </button>
          )}
        </div>
      );
    }

    case 'card': {
      const title = getString(props.title);
      const description = getString(props.description);
      const imageUrl = getString(props.imageUrl);
      const buttonText = getString(props.buttonText);
      return (
        <div className={style.className}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
          )}
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          {buttonText && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              {buttonText}
            </button>
          )}
        </div>
      );
    }

    case 'header': {
      const logo = getString(props.logo);
      const navigation = Array.isArray(props.navigation)
        ? (props.navigation as unknown[]).map((item) => getString(item))
        : [];
      const ctaText = getString(props.ctaText);
      return (
        <header className={style.className}>
          <div className="flex items-center justify-between">
            <div className="font-bold text-xl">{logo}</div>
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item, index) => (
                <a key={index} href="#" className="text-gray-600 hover:text-gray-900">
                  {item}
                </a>
              ))}
            </nav>
            {ctaText && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                {ctaText}
              </button>
            )}
          </div>
        </header>
      );
    }

    case 'form': {
      const title = getString(props.title);
      const description = getString(props.description);
      const submitButtonText = getString(props.submitButtonText);
      const successMessage = getString(props.successMessage);
      const includePhone = getBoolean(props.includePhone);
      const includeCompany = getBoolean(props.includeCompany);

      // FIXED: Working form component for canvas preview
      return <LiveFormPreview 
        title={title}
        description={description}
        submitButtonText={submitButtonText}
        successMessage={successMessage}
        includePhone={includePhone}
        includeCompany={includeCompany}
        className={style.className}
        isPreview={isPreview}
      />;
    }

    default:
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 text-gray-500 text-center">
          {definition.icon} {definition.label}
        </div>
      );
  }
}

// FIXED: Separate component for live form preview that actually works
// FIXED: Working form component for canvas preview
// FIXED: Make it clear this is preview only
function LiveFormPreview({
  title,
  description,
  submitButtonText,
  successMessage,
  includePhone,
  includeCompany,
  className,
  isPreview
}: {
  title: string;
  description: string;
  submitButtonText: string;
  successMessage: string;
  includePhone: boolean;
  includeCompany: boolean;
  className?: string;
  isPreview: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    phone: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if fields are empty
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);

    // CANVAS PREVIEW - Simulate submission (no real database)
    console.log('🎯 CANVAS PREVIEW - Simulated submission:', formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        message: '',
        phone: '',
        company: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={className}>
      {/* PREVIEW BANNER */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">👁️</span>
          <span className="text-sm text-blue-800 font-medium">
            Canvas Preview - Generate code for real database integration
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                {successMessage}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ⚡ Canvas Preview Only - Click `&quot;`Generate Code`&quot;` for real Supabase integration
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        {includePhone && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your phone number"
            />
          </div>
        )}

        {includeCompany && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your company"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your message..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              👁️ {submitButtonText} (Preview)
            </span>
          )}
        </button>
      </form>
    </div>
  );
}


