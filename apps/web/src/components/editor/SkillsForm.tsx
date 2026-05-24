import { Button, Input } from '@ai-resume/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { cn } from '@ai-resume/ui';

export function SkillsForm() {
  const { resume, addSkill, updateSkill, removeSkill } = useResumeStore();

  if (!resume) return null;

  const skills = resume.skills || [];

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Skills</h2>

        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  value={skill.name || ''}
                  onChange={(e) => updateSkill(index, { name: e.target.value })}
                  placeholder="React, Python, Leadership..."
                />
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateSkill(index, { rating })}
                    className={cn(
                      'h-5 w-5 rounded-sm transition-colors',
                      rating <= (skill.rating || 3)
                        ? 'bg-primary'
                        : 'bg-accent hover:bg-primary/30',
                    )}
                  />
                ))}
              </div>
              {skills.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addSkill}
          className="w-full gap-2 border-dashed mt-4"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>
    </div>
  );
}
