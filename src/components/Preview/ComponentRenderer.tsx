'use client';

import * as React from 'react';
import type { JSX } from 'react';
import { ComponentData } from '@/lib/types';
import { getComponentDefinition } from '@/lib/components';

interface ComponentRendererProps {
  component: ComponentData;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isPreview?: boolean;
  scale?: number;
}

export default function ComponentRenderer({ 
  component, 
  isSelected = false, 
  onSelect, 
  isPreview = false,
  scale = 1
}: ComponentRendererProps) {
  const definition = getComponentDefinition(component.type);
  
  if (!definition) {
    return (
      <div className="p-2 border border-red-300 bg-red-50 text-red-600 text-sm rounded">
        Unknown component: {component.type}
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview) {
      e.stopPropagation();
      onSelect?.(component.id);
    }
  };

  const baseClassName = `
    ${component.style.className || definition.defaultStyle.className || ''}
    ${!isPreview && isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
    ${!isPreview ? 'cursor-pointer' : ''}
  `.trim();

  const renderComponent = () => {
    switch (component.type) {
      case 'text': {
        const Tag = (component.props.tag as keyof JSX.IntrinsicElements) || 'p';
        return (
          <Tag className={baseClassName}>
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
          outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          ghost: 'text-blue-600 hover:bg-blue-50'
        };
        
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2',
          large: 'px-6 py-3 text-lg'
        };

        const buttonClass = `
          ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary}
          ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium}
          rounded-lg font-medium transition-colors
          ${!isPreview && isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
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
          <input
            type={inputType}
            placeholder={placeholder}
            required={required}
            className={baseClassName}
            readOnly={!isPreview}
          />
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
          flex min-h-24
        `.trim();

        return (
          <div 
            className={containerClass}
            style={{ gap }}
          >
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <ComponentRenderer
                  key={child.id}
                  component={child}
                  isPreview={isPreview}
                  onSelect={onSelect}
                  scale={scale}
                />
              ))
            ) : (
              <div className="text-sm text-gray-400 p-4 border-2 border-dashed border-gray-200 rounded">
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
          <img
            src={src}
            alt={alt}
            className={`${baseClassName} ${fitClasses[fit as keyof typeof fitClasses] || fitClasses.cover}`}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
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
            className={baseClassName}
            style={heroStyle}
          >
            <h1 className="text-4xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-xl mb-6 opacity-90">
              {subtitle}
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
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
          <div className={baseClassName}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="w-full h-32 object-cover rounded-t-lg mb-4"
              />
            )}
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {description}
            </p>
            {buttonText && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
          <header className={baseClassName}>
            <div className="flex items-center justify-between w-full">
              <div className="text-xl font-bold text-gray-900">
                {logo}
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                {navigation.map((item, index) => (
                  <a key={index} href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </nav>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                {ctaText}
              </button>
            </div>
          </header>
        );
      }

      default:
        return (
          <div className={`${baseClassName} p-4 border border-gray-300 rounded`}>
            <div className="text-center text-gray-500">
              {component.type} Component
            </div>
          </div>
        );
    }
  };

  if (isPreview) {
    return <>{renderComponent()}</>;
  }

  return (
    <div
      className="absolute"
      style={{
        left: component.position.x * scale,
        top: component.position.y * scale,
        width: component.position.width * scale,
        height: component.position.height * scale,
        zIndex: component.position.zIndex || 1,
      }}
      onClick={handleClick}
    >
      {renderComponent()}
      
      {/* Selection indicators */}
      {isSelected && !isPreview && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          
          {/* Component label */}
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {definition.label}
          </div>
        </div>
      )}
    </div>
  );
}
