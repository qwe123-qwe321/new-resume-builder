import { Input, Label } from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';

export function PersonalDetailForm() {
  const { resume, updateField } = useResumeStore();

  if (!resume) return null;

  const fields = [
    { key: 'firstName' as const, label: 'First Name', span: 1 },
    { key: 'lastName' as const, label: 'Last Name', span: 1 },
    { key: 'jobTitle' as const, label: 'Job Title', span: 2 },
    { key: 'address' as const, label: 'Address', span: 2 },
    { key: 'phone' as const, label: 'Phone', span: 1 },
    { key: 'email' as const, label: 'Email', span: 1 },
    { key: 'linkedIn' as const, label: 'LinkedIn', span: 1 },
    { key: 'github' as const, label: 'GitHub', span: 1 },
    { key: 'portfolio' as const, label: 'Portfolio', span: 1 },
    { key: 'targetJobTitle' as const, label: 'Target Job', span: 1 },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ key, label, span }) => (
          <div key={key} className={span === 2 ? 'col-span-2' : ''}>
            <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
            <Input
              value={resume[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
