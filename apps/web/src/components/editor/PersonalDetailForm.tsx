import { Input, Label, cn } from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { User, Briefcase, MapPin, Phone, Mail, Linkedin, Github, Globe, Target } from 'lucide-react';

const FIELD_GROUPS = [
  {
    title: 'Basic Information',
    icon: User,
    fields: [
      { key: 'firstName' as const, label: 'First Name', placeholder: 'John', span: 1 },
      { key: 'lastName' as const, label: 'Last Name', placeholder: 'Doe', span: 1 },
      { key: 'jobTitle' as const, label: 'Job Title', placeholder: 'Senior Software Engineer', span: 2, icon: Briefcase },
    ],
  },
  {
    title: 'Contact Information',
    icon: Phone,
    fields: [
      { key: 'email' as const, label: 'Email', placeholder: 'john@example.com', span: 1, icon: Mail },
      { key: 'phone' as const, label: 'Phone', placeholder: '+1 (555) 123-4567', span: 1, icon: Phone },
      { key: 'address' as const, label: 'Address', placeholder: 'San Francisco, CA', span: 2, icon: MapPin },
    ],
  },
  {
    title: 'Online Profiles',
    icon: Globe,
    fields: [
      { key: 'linkedIn' as const, label: 'LinkedIn', placeholder: 'linkedin.com/in/johndoe', span: 1, icon: Linkedin },
      { key: 'github' as const, label: 'GitHub', placeholder: 'github.com/johndoe', span: 1, icon: Github },
      { key: 'portfolio' as const, label: 'Portfolio', placeholder: 'johndoe.dev', span: 2, icon: Globe },
    ],
  },
  {
    title: 'Target Position',
    icon: Target,
    fields: [
      { key: 'targetJobTitle' as const, label: 'Target Job Title', placeholder: 'Frontend Developer at Google', span: 2, icon: Target },
    ],
  },
];

export function PersonalDetailForm() {
  const { resume, updateField } = useResumeStore();

  if (!resume) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          Personal Details
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Start with your basic information. This will appear at the top of your resume.
        </p>
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.title} className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <group.icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">{group.title}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {group.fields.map(({ key, label, placeholder, span, icon: FieldIcon }) => (
              <div key={key} className={cn(span === 2 && 'col-span-2')}>
                <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
                <div className="relative">
                  {FieldIcon && (
                    <FieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    value={resume[key] || ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                      'bg-accent/50 border-border focus:border-primary transition-colors',
                      FieldIcon && 'pl-10'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
