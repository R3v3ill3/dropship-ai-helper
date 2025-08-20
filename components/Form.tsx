'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface FormState {
  product: string;
  description: string;
  persona: string[]; // multiple selected personas
  suburb: string;
  postcode: string;
  tone: string;
}

interface FormSubmitData {
  product: string;
  description: string;
  persona: string; // comma-separated for API compatibility
  tone: string;
  location: string;
}

interface FormProps {
  onSubmit: (data: FormSubmitData) => void;
  loading: boolean;
}

interface HelixSegment {
  id: string;
  label: string;
  groupName?: string;
  description?: string;
}

const HELIX_PERSONAS_FALLBACK = [
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
  const [formData, setFormData] = useState<FormState>({
    product: '',
    description: '',
    persona: [],
    suburb: '',
    postcode: '',
    tone: ''
  });

  const [personaOptions, setPersonaOptions] = useState<HelixSegment[]>(
    HELIX_PERSONAS_FALLBACK.map((label) => ({ id: label, label }))
  );
  const [loadingPersonas, setLoadingPersonas] = useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPersonaSegments() {
      try {
        setLoadingPersonas(true);
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('helix_segments')
          // Select only columns that are guaranteed to exist to avoid query errors
          .select('label,group_name,description');
        if (error) throw error;
        const rows: any[] = Array.isArray(data) ? data : [];
        const segments: HelixSegment[] = rows
          .map((row) => ({
            id: String(row.id ?? row.code ?? row.label),
            label: String(row.label ?? row.name ?? row.segment_name ?? row.title ?? row.code ?? row.slug ?? ''),
            groupName: row.group_name ?? row.group ?? undefined,
            description: row.description ?? undefined,
          }))
          .filter((s) => s.label && s.id);
        if (segments.length > 0) setPersonaOptions(segments);
      } catch (err) {
        // Fall back to built-in list silently
        console.error('Failed to load helix_segments; using fallback list', err);
      } finally {
        setLoadingPersonas(false);
      }
    }
    fetchPersonaSegments();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const location = `${formData.suburb}, ${formData.postcode}`;
    const idToLabel = new Map(personaOptions.map((s) => [s.id, s.label] as const));
    const personaJoined = formData.persona
      .map((id) => idToLabel.get(id) ?? id)
      .join(', ');
    onSubmit({
      product: formData.product,
      description: formData.description,
      persona: personaJoined,
      tone: formData.tone,
      location
    });
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uniqueGroupNames = React.useMemo(() => {
    const names = new Set<string>();
    for (const seg of personaOptions) {
      if (seg.groupName && seg.groupName.trim().length > 0) names.add(seg.groupName.trim());
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [personaOptions]);

  const displayGroupName = (groupName?: string) => groupName && groupName.trim() ? groupName.trim() : 'Ungrouped';

  const filteredAndSortedSegments = React.useMemo(() => {
    const hasGroupFilter = selectedGroups.length > 0;
    const filtered = personaOptions.filter(seg => {
      if (!hasGroupFilter) return true;
      const name = displayGroupName(seg.groupName);
      return selectedGroups.includes(name);
    });
    const sortByGroup = selectedGroups.length > 1;
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const byLabel = (a: HelixSegment, b: HelixSegment) => collator.compare(a.label, b.label);
    if (sortByGroup) {
      return filtered.sort((a, b) => {
        const ga = displayGroupName(a.groupName);
        const gb = displayGroupName(b.groupName);
        const gcmp = collator.compare(ga, gb);
        return gcmp !== 0 ? gcmp : byLabel(a, b);
      });
    }
    return filtered.sort(byLabel);
  }, [personaOptions, selectedGroups]);

  const togglePersonaSelection = (id: string) => {
    setFormData(prev => {
      const exists = prev.persona.includes(id);
      const next = exists ? prev.persona.filter(pid => pid !== id) : [...prev.persona, id];
      return { ...prev, persona: next };
    });
  };

  const isPersonaSelected = (id: string) => formData.persona.includes(id);

  const toggleGroupFilter = (groupName: string) => {
    setSelectedGroups(prev => prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Helix Persona Segments *
          </label>
          {/* Group Filters */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 mb-1">Filter by Group</div>
            <div className="flex flex-wrap gap-2">
              {uniqueGroupNames.length === 0 ? (
                <span className="text-xs text-gray-500">No groups available</span>
              ) : (
                uniqueGroupNames.map((group) => (
                  <label key={group} className="inline-flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedGroups.includes(group)}
                      onChange={() => toggleGroupFilter(group)}
                    />
                    <span>{group}</span>
                  </label>
                ))
              )}
              {/* Include Ungrouped if present */}
              {personaOptions.some(s => !s.groupName || !s.groupName.trim()) && (
                <label className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedGroups.includes('Ungrouped')}
                    onChange={() => toggleGroupFilter('Ungrouped')}
                  />
                  <span>Ungrouped</span>
                </label>
              )}
            </div>
          </div>

          {/* Segments Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 text-xs font-semibold grid grid-cols-12 gap-2">
              <div className="col-span-1"></div>
              <div className="col-span-4">Segment</div>
              <div className="col-span-3">Group</div>
              <div className="col-span-4">Description</div>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {loadingPersonas && (
                <div className="px-3 py-2 text-sm text-gray-500">Loading persona segments…</div>
              )}
              {!loadingPersonas && filteredAndSortedSegments.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No segments found for the selected filters.</div>
              )}
              {!loadingPersonas && filteredAndSortedSegments.map((segment) => (
                <label key={segment.id} className="px-3 py-2 grid grid-cols-12 gap-2 items-start cursor-pointer hover:bg-gray-50">
                  <div className="col-span-1 pt-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isPersonaSelected(segment.id)}
                      onChange={() => togglePersonaSelection(segment.id)}
                    />
                  </div>
                  <div className="col-span-4 text-sm text-gray-900">{segment.label}</div>
                  <div className="col-span-3 text-sm text-gray-700">{displayGroupName(segment.groupName)}</div>
                  <div className="col-span-4 text-sm text-gray-600">{segment.description || ''}</div>
                </label>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.persona.length === 0 ? 'Select at least one segment.' : `${formData.persona.length} segment(s) selected.`}
          </p>

          {/* Summary Table */}
          {formData.persona.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Selected Segments</div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold grid grid-cols-12 gap-2">
                  <div className="col-span-5">Segment</div>
                  <div className="col-span-3">Group</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y">
                  {formData.persona.map((id) => {
                    const seg = personaOptions.find(s => s.id === id);
                    if (!seg) return null;
                    return (
                      <div key={id} className="px-3 py-2 grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5 text-sm text-gray-900">{seg.label}</div>
                        <div className="col-span-3 text-sm text-gray-700">{displayGroupName(seg.groupName)}</div>
                        <div className="col-span-3 text-sm text-gray-600">{seg.description || ''}</div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                            onClick={() => togglePersonaSelection(id)}
                            aria-label={`Remove ${seg.label}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
          disabled={loading || formData.persona.length === 0}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-disabled={loading || formData.persona.length === 0}
        >
          {loading ? 'Generating...' : 'Generate Branding Package'}
        </button>
      </form>
    </div>
  );
}

