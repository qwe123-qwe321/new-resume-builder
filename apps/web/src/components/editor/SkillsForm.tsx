import { Trophy } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { RichTextEditor } from './RichTextEditor';

export function SkillsForm() {
  const { resume, updateField } = useResumeStore();
  if (!resume) return null;

  const awardText = (resume as { atsFeedback?: string }).atsFeedback || '';
  const extraText = (resume as { targetCompany?: string }).targetCompany || '';
  const supplementText = [
    ...(resume.certifications || []),
    ...(resume.languages || []),
  ]
    .filter(Boolean)
    .join('<br/>');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          校园经历
        </h2>
      </div>

      <div className="glass rounded-xl p-5">
        <p className="text-xs text-muted-foreground mb-2">所获奖项</p>
        <RichTextEditor value={awardText} onChange={(html) => updateField('atsFeedback', html)} placeholder="例如：国家奖学金、互联网+省级银奖、数学建模二等奖..." minHeight={120} />
      </div>

      <div className="glass rounded-xl p-5">
        <p className="text-xs text-muted-foreground mb-2">其它经历（附带奖项）</p>
        <RichTextEditor value={extraText} onChange={(html) => updateField('targetCompany', html)} placeholder="例如：学生会技术部部长、开源社区贡献者、志愿服务与荣誉..." minHeight={120} />
      </div>

      <div className="glass rounded-xl p-5">
        <p className="text-xs text-muted-foreground mb-2">补充技能 / 证书 / 语言</p>
        <RichTextEditor
          value={supplementText}
          onChange={(html) => {
            const lines = html
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/p>/gi, '\n')
              .replace(/<[^>]*>/g, '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean);
            updateField('languages', lines);
            updateField('certifications', []);
          }}
          placeholder="例如：英语（CET-6）、日语（N2）、软考中级、PMP、云原生证书等"
          minHeight={140}
        />
      </div>
    </div>
  );
}
