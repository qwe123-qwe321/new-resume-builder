import { useState } from 'react';
import { Button, Badge, cn } from '@ai-resume/ui';
import { LayoutTemplate, Check, Crown, Sparkles, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

// Template data - in production this would come from API
const TEMPLATES = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean and contemporary design perfect for tech and business roles',
    category: 'professional',
    isPremium: false,
    colors: ['#6366F1', '#0EA5E9', '#10B981'],
    thumbnail: null,
  },
  {
    id: 'minimal-classic',
    name: 'Minimal Classic',
    description: 'Timeless design that works for any industry',
    category: 'minimal',
    isPremium: false,
    colors: ['#374151', '#6B7280', '#1F2937'],
    thumbnail: null,
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'Stand out with a unique and eye-catching layout',
    category: 'creative',
    isPremium: true,
    colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
    thumbnail: null,
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Sophisticated design for senior leadership positions',
    category: 'professional',
    isPremium: true,
    colors: ['#1E293B', '#0F172A', '#334155'],
    thumbnail: null,
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern design optimized for tech industry applications',
    category: 'modern',
    isPremium: false,
    colors: ['#3B82F6', '#6366F1', '#8B5CF6'],
    thumbnail: null,
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Perfect for academic CVs and research positions',
    category: 'academic',
    isPremium: true,
    colors: ['#0D9488', '#059669', '#047857'],
    thumbnail: null,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'professional', label: 'Professional' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'academic', label: 'Academic' },
];

export function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutTemplate className="h-5 w-5 text-primary" />
          </div>
          Resume Templates
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose from professionally designed templates to make your resume stand out
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedTemplate(template.id)}
            className={cn(
              'glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
              'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
              selectedTemplate === template.id && 'ring-2 ring-primary border-primary/30'
            )}
          >
            {/* Template Preview */}
            <div className="h-48 bg-gradient-to-br from-accent to-card relative overflow-hidden">
              {/* Simulated template preview */}
              <div className="absolute inset-4 bg-white rounded-lg shadow-xl overflow-hidden">
                <div 
                  className="h-8 w-full"
                  style={{ backgroundColor: template.colors[0] }}
                />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  <div className="h-2 w-1/2 bg-gray-100 rounded" />
                  <div className="mt-4 space-y-1.5">
                    <div className="h-1.5 w-full bg-gray-100 rounded" />
                    <div className="h-1.5 w-4/5 bg-gray-100 rounded" />
                    <div className="h-1.5 w-3/4 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                </div>
              )}

              {/* Selected Check */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-background/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Eye className="h-4 w-4" /> Preview
                </Button>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                {template.isPremium ? (
                  <Sparkles className="h-4 w-4 text-amber-500" />
                ) : (
                  <Badge variant="outline" className="text-[10px]">Free</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {template.description}
              </p>
              
              {/* Color Swatches */}
              <div className="flex items-center gap-1.5">
                {template.colors.map((color, j) => (
                  <div
                    key={j}
                    className="h-4 w-4 rounded-full ring-2 ring-offset-2 ring-offset-card ring-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-12 glass rounded-2xl p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">More Templates Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We are working on adding more professionally designed templates. 
          Currently, templates are in preview mode - your resumes use the default professional layout.
        </p>
      </div>
    </div>
  );
}
