'use client';

import React from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { BrandingOutput } from '../prompts/branding';

interface OutputDisplayProps {
  output: BrandingOutput;
  onRegenerate: () => void;
  loading: boolean;
}

export default function OutputDisplay({ output, onRegenerate, loading }: OutputDisplayProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      title="Copy to clipboard"
    >
      {copiedField === fieldName ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header with Regenerate Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Your Branding Package
        </h2>
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="btn-secondary inline-flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Brand Identity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Identity</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Brand Name</label>
              <p className="text-xl font-bold text-gray-900">{output.brandName}</p>
            </div>
            <CopyButton text={output.brandName} fieldName="brandName" />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tagline</label>
              <p className="text-lg text-gray-800 italic">"{output.tagline}"</p>
            </div>
            <CopyButton text={output.tagline} fieldName="tagline" />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Landing Page Copy</label>
              <p className="text-gray-800">{output.landingPageCopy}</p>
            </div>
            <CopyButton text={output.landingPageCopy} fieldName="landingPageCopy" />
          </div>
        </div>
      </div>

      {/* Ad Headlines */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Facebook/Google Ad Headlines</h3>
        <div className="space-y-3">
          {output.adHeadlines.map((headline, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="bg-gray-50 p-3 rounded-lg flex-1">
                <p className="text-gray-800 font-medium">{headline}</p>
              </div>
              <CopyButton text={headline} fieldName={`headline-${index}`} />
            </div>
          ))}
        </div>
      </div>

      {/* TikTok Ad Scripts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">TikTok Ad Scripts</h3>
        <div className="space-y-4">
          {output.tiktokScripts.map((script, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="bg-gray-50 p-4 rounded-lg flex-1">
                <div className="flex items-center mb-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                    TikTok
                  </span>
                  <span className="text-sm text-gray-500">Script {index + 1}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-line">{script}</p>
              </div>
              <CopyButton text={script} fieldName={`tiktok-${index}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Ad Strategy */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertising Strategy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Recommended Platforms</label>
            <div className="flex flex-wrap gap-2">
              {output.adPlatforms.map((platform, index) => (
                <span
                  key={index}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Budget Strategy</label>
              <p className="text-gray-800">{output.budgetStrategy}</p>
            </div>
            <CopyButton text={output.budgetStrategy} fieldName="budgetStrategy" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New Version'}
        </button>
        <button className="btn-secondary px-8 py-3 text-lg">
          Download PDF
        </button>
      </div>
    </div>
  );
}

