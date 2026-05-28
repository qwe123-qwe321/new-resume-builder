import { Button, Input, Label } from '@ai-resume/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { RichTextEditor } from './RichTextEditor';

export function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();

  if (!resume) return null;

  const educations = resume.education || [];

  return (
    <div className="space-y-6">
      {educations.map((edu, index) => (
        <div key={index} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">教育经历 {index + 1}</h3>
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
              <Label className="text-xs text-muted-foreground mb-1.5 block">学校名称</Label>
              <Input
                value={edu.universityName || ''}
                onChange={(e) => updateEducation(index, { universityName: e.target.value })}
                placeholder="例如：清华大学"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">学历</Label>
              <Input
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, { degree: e.target.value })}
                placeholder="例如：本科"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">专业</Label>
              <Input
                value={edu.major || ''}
                onChange={(e) => updateEducation(index, { major: e.target.value })}
                placeholder="例如：计算机科学与技术"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">开始时间</Label>
              <Input
                type="month"
                value={edu.startDate || ''}
                onChange={(e) => updateEducation(index, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">结束时间</Label>
              <Input
                type="month"
                value={edu.endDate || ''}
                onChange={(e) => updateEducation(index, { endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">补充说明</Label>
              <RichTextEditor
                value={edu.description || ''}
                onChange={(html) => updateEducation(index, { description: html })}
                placeholder="例如：主修课程、荣誉奖项、科研经历..."
                minHeight={120}
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addEducation} className="w-full gap-2 border-dashed">
        <Plus className="h-4 w-4" /> 添加教育经历
      </Button>
    </div>
  );
}
