'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import Form from '../../components/Form';
import OutputDisplay from '../../components/OutputDisplay';
import { BrandingOutput } from '../../prompts/branding';
import { getSupabaseClient } from '../../lib/supabase';
import { LogOut, Plus, History, Sparkles, ExternalLink, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  product_name: string;
  target_persona: string;
  locality: string;
  brand_tone?: string; // Optional in case column doesn't exist yet
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentOutput, setCurrentOutput] = useState<BrandingOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleFormSubmit = async (formData: { product: string; persona: string; tone: string; location: string }) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/generate-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          product: formData.product,
          persona: formData.persona,
          tone: formData.tone,
          location: formData.location,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        let serverDetails = '';
        try {
          const errJson = await response.json();
          serverDetails = errJson?.details || errJson?.error || JSON.stringify(errJson);
        } catch {}
        throw new Error(`Failed to generate branding (HTTP ${response.status})${serverDetails ? `: ${serverDetails}` : ''}`);
      }

      const result = await response.json();
      setCurrentOutput(result.branding);
      await fetchProjects(); // Refresh projects list
    } catch (error) {
      console.error('Error generating branding:', error);
      alert(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    // For now, just clear the current output to show the form again
    setCurrentOutput(null);
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      const { data: outputs, error } = await getSupabaseClient()
        .from('outputs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      if (outputs && outputs.length > 0) {
        const o = outputs[0];
        const branding: BrandingOutput = {
          brandName: o.brand_name,
          tagline: o.tagline,
          landingPageCopy: o.landing_page_copy,
          adHeadlines: o.ad_headlines,
          tiktokScripts: o.tiktok_scripts,
          adPlatforms: o.ad_platforms,
          budgetStrategy: o.budget_strategy,
        };
        setCurrentOutput(branding);
        setShowHistory(false);
        setSelectedProjectId(projectId);
      } else {
        alert('No outputs found for this project yet. Try re-running it.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to open project.');
    }
  };

  const handleRerunProject = async (projectId: string) => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch('/api/regenerate-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        let details = '';
        try { details = (await res.json())?.details || ''; } catch {}
        throw new Error(`Failed to regenerate (HTTP ${res.status}) ${details}`);
      }
      const json = await res.json();
      const branding: BrandingOutput = json.branding;
      setCurrentOutput(branding);
      setShowHistory(false);
      setSelectedProjectId(projectId);
      await fetchProjects();
    } catch (e) {
      console.error(e);
      alert('Failed to re-run project.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this project and all its outputs?')) return;
    try {
      const { error } = await getSupabaseClient()
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (error) throw error;
      await fetchProjects();
      if (selectedProjectId === projectId) {
        setCurrentOutput(null);
        setSelectedProjectId(null);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete project.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">DropshipAI Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showHistory ? (
          /* History View */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Project History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first branding project to get started</p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="btn-primary"
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {project.product_name}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Persona:</span> {project.target_persona}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {project.locality}
                          </div>
                          <div>
                            <span className="font-medium">Tone:</span> {project.brand_tone || 'Not specified'}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenProject(project.id)} className="btn-secondary inline-flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </button>
                        <button onClick={() => handleRerunProject(project.id)} className="btn-secondary inline-flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Re-run
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="btn-secondary inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main Dashboard View */
          <div className="space-y-8">
            {currentOutput ? (
              <OutputDisplay
                output={currentOutput}
                onRegenerate={handleRegenerate}
                loading={loading}
              />
            ) : (
              <Form onSubmit={handleFormSubmit} loading={loading} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

