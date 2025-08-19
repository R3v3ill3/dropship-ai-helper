'use client';

import React, { useState } from 'react';

interface FormData {
  product: string;
  description: string;
  persona: string;
  suburb: string;
  postcode: string;
  tone: string;
}

interface FormSubmitData extends FormData {
  location: string;
}

interface FormProps {
  onSubmit: (data: FormSubmitData) => void;
  loading: boolean;
}

const HELIX_PERSONAS = [
  'Socially Aware Urbanites',
  'Rural Traditionalists',
  'Affluent and Ambitious',
  'Family-Focused Suburbanites',
  'Young Professional Urbanites',
  'Retirement-Age Traditionalists',
  'Creative and Alternative',
  'Health and Wellness Enthusiasts',
  'Tech-Savvy Early Adopters',
  'Value-Conscious Pragmatists'
];

const BRAND_TONES = [
  'Premium',
  'Eco-conscious',
  'Humorous',
  'Fun',
  'Minimalist',
  'Professional',
  'Casual',
  'Luxury',
  'Friendly',
  'Bold'
];

export default function Form({ onSubmit, loading }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    product: '',
    description: '',
    persona: '',
    suburb: '',
    postcode: '',
    tone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const location = `${formData.suburb}, ${formData.postcode}`;
    onSubmit({
      ...formData,
      location
    });
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Generate Your Branding Package
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="product"
            value={formData.product}
            onChange={(e) => handleChange('product', e.target.value)}
            className="input-field"
            placeholder="e.g., Wireless Bluetooth Headphones"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Product Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Brief description of your product features and benefits..."
          />
        </div>

        {/* Target Audience */}
        <div>
          <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-2">
            Target Helix Persona *
          </label>
          <select
            id="persona"
            value={formData.persona}
            onChange={(e) => handleChange('persona', e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a persona</option>
            {HELIX_PERSONAS.map((persona) => (
              <option key={persona} value={persona}>
                {persona}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
              Suburb *
            </label>
            <input
              type="text"
              id="suburb"
              value={formData.suburb}
              onChange={(e) => handleChange('suburb', e.target.value)}
              className="input-field"
              placeholder="e.g., Bondi"
              required
            />
          </div>
          
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
              Postcode *
            </label>
            <input
              type="text"
              id="postcode"
              value={formData.postcode}
              onChange={(e) => handleChange('postcode', e.target.value)}
              className="input-field"
              placeholder="e.g., 2026"
              required
            />
          </div>
        </div>

        {/* Brand Tone */}
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Brand Tone *
          </label>
          <select
            id="tone"
            value={formData.tone}
            onChange={(e) => handleChange('tone', e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a tone</option>
            {BRAND_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Branding Package'}
        </button>
      </form>
    </div>
  );
}

