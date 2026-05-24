import { Button, Input, Textarea, Label, cn } from '@ai-resume/ui';
import { Plus, Trash2, GraduationCap, Building, BookOpen, Calendar, GripVertical } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!resume) return null;

  const educations = resume.education || [];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          Education
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Add your educational background, starting with the most recent.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {educations.map((edu, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Collapsed Header */}
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {edu.universityName || 'New Education'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {edu.degree || 'Degree'} {edu.major && `in ${edu.major}`}
                </p>
              </div>
              <svg
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform duration-200',
                  expandedIndex === index && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                    {/* Delete Button */}
                    {educations.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">University / Institution</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={edu.universityName || ''}
                            onChange={(e) => updateEducation(index, { universityName: e.target.value })}
                            placeholder="Stanford University"
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Degree</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, { degree: e.target.value })}
                            placeholder="Bachelor of Science"
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Major / Field of Study</Label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={edu.major || ''}
                            onChange={(e) => updateEducation(index, { major: e.target.value })}
                            placeholder="Computer Science"
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Start Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="month"
                            value={edu.startDate || ''}
                            onChange={(e) => updateEducation(index, { startDate: e.target.value })}
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">End Date (or Expected)</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="month"
                            value={edu.endDate || ''}
                            onChange={(e) => updateEducation(index, { endDate: e.target.value })}
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Additional Details (Optional)
                        </Label>
                        <Textarea
                          value={edu.description || ''}
                          onChange={(e) => updateEducation(index, { description: e.target.value })}
                          placeholder="GPA: 3.8/4.0, Dean's List, Relevant coursework, Honors, Activities..."
                          className="min-h-[80px] bg-accent/50 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Button */}
      <Button
        variant="outline"
        onClick={() => {
          addEducation();
          setExpandedIndex(educations.length);
        }}
        className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 h-12"
      >
        <Plus className="h-4 w-4" /> Add Education
      </Button>
    </div>
  );
}
