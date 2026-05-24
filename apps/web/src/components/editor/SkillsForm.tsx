import { Button, Input, Label, cn } from '@ai-resume/ui';
import { Plus, Trash2, Wrench, Star, Sparkles } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'AWS', 'Docker', 'Git', 'SQL', 'MongoDB', 'GraphQL',
  'Leadership', 'Communication', 'Problem Solving', 'Agile', 'Scrum'
];

export function SkillsForm() {
  const { resume, addSkill, updateSkill, removeSkill, updateField } = useResumeStore();

  if (!resume) return null;

  const skills = resume.skills || [];
  const certifications = resume.certifications || [];
  const languages = resume.languages || [];

  const addSuggestedSkill = (skillName: string) => {
    if (!skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      addSkill();
      setTimeout(() => {
        updateSkill(skills.length, { name: skillName, rating: 4 });
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          Skills & More
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Highlight your technical and soft skills, certifications, and languages.
        </p>
      </div>

      {/* Skills Section */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Skills</h3>
        </div>

        {/* Skill Suggestions */}
        <div className="mb-4 p-3 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Quick Add:</p>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_SUGGESTIONS.slice(0, 12).map((skill) => {
              const isAdded = skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSuggestedSkill(skill)}
                  disabled={isAdded}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-all',
                    isAdded
                      ? 'bg-primary/20 text-primary cursor-not-allowed'
                      : 'bg-accent hover:bg-primary/10 hover:text-primary text-muted-foreground'
                  )}
                >
                  {isAdded ? '✓ ' : '+ '}{skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-accent/30"
              >
                <Input
                  value={skill.name || ''}
                  onChange={(e) => updateSkill(index, { name: e.target.value })}
                  placeholder="Skill name"
                  className="flex-1 bg-transparent border-0 h-8 focus:ring-0 focus:border-0"
                />
                
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateSkill(index, { rating })}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'h-4 w-4 transition-colors',
                          rating <= (skill.rating || 3)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <Button
          variant="outline"
          size="sm"
          onClick={addSkill}
          className="w-full gap-2 border-dashed mt-3"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {/* Certifications Section */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Certifications</h3>
        </div>

        <div className="space-y-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={cert}
                onChange={(e) => {
                  const newCerts = [...certifications];
                  newCerts[index] = e.target.value;
                  updateField('certifications', newCerts);
                }}
                placeholder="AWS Solutions Architect, PMP, etc."
                className="flex-1 bg-accent/50"
              />
              <button
                type="button"
                onClick={() => {
                  updateField('certifications', certifications.filter((_, i) => i !== index));
                }}
                className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updateField('certifications', [...certifications, ''])}
          className="w-full gap-2 border-dashed mt-3"
        >
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      </div>

      {/* Languages Section */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
          </svg>
          <h3 className="text-sm font-medium text-foreground">Languages</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1.5 bg-accent/50 rounded-lg group"
            >
              <Input
                value={lang}
                onChange={(e) => {
                  const newLangs = [...languages];
                  newLangs[index] = e.target.value;
                  updateField('languages', newLangs);
                }}
                placeholder="English"
                className="w-24 bg-transparent border-0 h-6 p-0 text-sm focus:ring-0"
              />
              <button
                type="button"
                onClick={() => {
                  updateField('languages', languages.filter((_, i) => i !== index));
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateField('languages', [...languages, ''])}
            className="h-8 gap-1 border-dashed"
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
