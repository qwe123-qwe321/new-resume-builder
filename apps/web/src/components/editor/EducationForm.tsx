import { Button, Input, Textarea, Label } from '@ai-resume/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';

export function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();

  if (!resume) return null;

  const educations = resume.education || [];

  return (
    <div className="space-y-6">
      {educations.map((edu, index) => (
        <div key={index} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Education {index + 1}</h3>
            {educations.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">University</Label>
              <Input
                value={edu.universityName || ''}
                onChange={(e) => updateEducation(index, { universityName: e.target.value })}
                placeholder="Stanford University"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Degree</Label>
              <Input
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, { degree: e.target.value })}
                placeholder="Bachelor of Science"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Major</Label>
              <Input
                value={edu.major || ''}
                onChange={(e) => updateEducation(index, { major: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Start Date</Label>
              <Input
                type="date"
                value={edu.startDate || ''}
                onChange={(e) => updateEducation(index, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">End Date</Label>
              <Input
                type="date"
                value={edu.endDate || ''}
                onChange={(e) => updateEducation(index, { endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Description</Label>
              <Textarea
                value={edu.description || ''}
                onChange={(e) => updateEducation(index, { description: e.target.value })}
                placeholder="Honors, activities, relevant coursework..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addEducation}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" /> Add Education
      </Button>
    </div>
  );
}
