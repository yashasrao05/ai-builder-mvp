'use client';

import React from 'react';
import type { JSX } from 'react';
import { ComponentData } from '@/lib/types';
import { getComponentDefinition } from '@/lib/components';

interface ComponentContentProps {
  component: ComponentData;
  isPreview?: boolean;
}

export default function ComponentContent({ component, isPreview = false }: ComponentContentProps) {
  const definition = getComponentDefinition(component.type);
  
  if (!definition) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 border border-red-300 bg-red-50 text-red-600 text-xs rounded">
        Unknown: {component.type}
      </div>
    );
  }

  const baseClassName = `
    w-full h-full
    ${component.style.className || definition.defaultStyle.className || ''}
  `.trim();

  const renderComponent = () => {
    switch (component.type) {
      case 'text': {
        const Tag = (component.props.tag as keyof JSX.IntrinsicElements) || 'p';
        return (
          <Tag className={`${baseClassName} flex items-center justify-start p-2 overflow-hidden`}>
            {(component.props.text as string) || 'Sample text'}
          </Tag>
        );
      }

      case 'button': {
        const variant = component.props.variant as string || 'primary';
        const size = component.props.size as string || 'medium';
        
        const variantClasses = {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          secondary: 'bg-gray-600 text-white hover:bg-gray-700',
          outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-white',
          ghost: 'text-blue-600 hover:bg-blue-50 bg-transparent'
        };
        
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-6 py-3 text-lg'
        };

        const buttonClass = `
          ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary}
          ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium}
          rounded-lg font-medium transition-colors cursor-pointer
          flex items-center justify-center w-full h-full
        `.trim();

        return (
          <button className={buttonClass} disabled={!isPreview}>
            {(component.props.text as string) || 'Button'}
          </button>
        );
      }

      case 'input': {
        const inputType = component.props.type as string || 'text';
        const placeholder = component.props.placeholder as string || '';
        const required = component.props.required as boolean || false;

        return (
          <div className="w-full h-full flex items-center p-2">
            <input
              type={inputType}
              placeholder={placeholder}
              required={required}
              className={`${baseClassName} flex-1 min-w-0`}
              readOnly={!isPreview}
            />
          </div>
        );
      }

      case 'container': {
        const direction = component.props.direction as string || 'column';
        const align = component.props.align as string || 'start';
        const justify = component.props.justify as string || 'start';
        const gap = component.props.gap as string || '16px';

        const alignClasses = {
          start: 'items-start',
          center: 'items-center',
          end: 'items-end',
          stretch: 'items-stretch'
        };

        const justifyClasses = {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
          between: 'justify-between',
          around: 'justify-around'
        };

        const containerClass = `
          ${baseClassName}
          ${direction === 'row' ? 'flex-row' : 'flex-col'}
          ${alignClasses[align as keyof typeof alignClasses] || alignClasses.start}
          ${justifyClasses[justify as keyof typeof justifyClasses] || justifyClasses.start}
          flex p-4
        `.trim();

        return (
          <div 
            className={containerClass}
            style={{ gap }}
          >
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <ComponentContent
                  key={child.id}
                  component={child}
                  isPreview={isPreview}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded p-4 min-h-16">
                Drop components here
              </div>
            )}
          </div>
        );
      }

      case 'image': {
        const src = component.props.src as string || 'https://via.placeholder.com/300x200?text=Image';
        const alt = component.props.alt as string || 'Image';
        const fit = component.props.fit as string || 'cover';

        const fitClasses = {
          cover: 'object-cover',
          contain: 'object-contain',
          fill: 'object-fill',
          none: 'object-none',
          'scale-down': 'object-scale-down'
        };

        return (
          <div className="w-full h-full p-2">
            <img
              src={src}
              alt={alt}
              className={`w-full h-full rounded ${fitClasses[fit as keyof typeof fitClasses] || fitClasses.cover}`}
            />
          </div>
        );
      }

      case 'hero': {
        const title = component.props.title as string || 'Welcome to our website';
        const subtitle = component.props.subtitle as string || 'This is a hero section with a call to action';
        const buttonText = component.props.buttonText as string || 'Get Started';
        const backgroundImage = component.props.backgroundImage as string || '';

        const heroStyle = backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {};

        return (
          <div 
            className={`${baseClassName} flex flex-col items-center justify-center text-center p-6`}
            style={heroStyle}
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">
              {title}
            </h1>
            <p className="text-sm md:text-xl mb-4 opacity-90 text-white">
              {subtitle}
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
              {buttonText}
            </button>
          </div>
        );
      }

      case 'card': {
        const title = component.props.title as string || 'Card Title';
        const description = component.props.description as string || 'This is a card description.';
        const imageUrl = component.props.imageUrl as string || '';
        const buttonText = component.props.buttonText as string || '';

        return (
          <div className={`${baseClassName} p-4 flex flex-col`}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-24 object-cover rounded mb-3"
              />
            )}
            <h3 className="text-sm font-semibold mb-2 text-gray-900 flex-shrink-0">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mb-3 flex-1">
              {description}
            </p>
            {buttonText && (
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors self-start">
                {buttonText}
              </button>
            )}
          </div>
        );
      }

      case 'header': {
        const logo = component.props.logo as string || 'Logo';
        const navigation = component.props.navigation as string[] || ['Home', 'About', 'Services', 'Contact'];
        const ctaText = component.props.ctaText as string || 'Get Started';

        return (
          <header className={`${baseClassName} px-4 py-3`}>
            <div className="flex items-center justify-between w-full h-full">
              <div className="text-lg font-bold text-gray-900 flex-shrink-0">
                {logo}
              </div>
              <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
                {navigation.slice(0, 4).map((item, index) => (
                  <a key={index} href="#" className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
                    {item}
                  </a>
                ))}
              </nav>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors flex-shrink-0">
                {ctaText}
              </button>
            </div>
          </header>
        );
      }

      default:
        return (
          <div className={`${baseClassName} flex items-center justify-center p-4 border border-gray-300 rounded`}>
            <div className="text-center text-gray-500 text-sm">
              {component.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {renderComponent()}
    </div>
  );
}
