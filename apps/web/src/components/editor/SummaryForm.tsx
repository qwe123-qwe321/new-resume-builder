import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Label } from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { RichTextEditor } from './RichTextEditor';

export function SummaryForm() {
  const { resume, updateField } = useResumeStore();
  const [exampleOpen, setExampleOpen] = useState(false);

  if (!resume) return null;

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">自我评价</h2>
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setExampleOpen(true)}>
            示例
          </Button>
        </div>

        <Label className="text-xs text-muted-foreground mb-1.5 block">自我评价内容</Label>
        <RichTextEditor
          value={resume.summary || ''}
          onChange={(html) => updateField('summary', html)}
          placeholder="请填写你的核心优势、项目亮点与岗位匹配能力。"
          minHeight={200}
        />
      </div>

      <Dialog open={exampleOpen} onOpenChange={setExampleOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>自我评价示例</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto whitespace-pre-line text-sm leading-7 text-foreground">
{`个人评价就是对自己的解读，一定要用简洁的语言突出自己的特点和优势，避免废话！ 像勤奋、吃苦这些比较虚的东西就不要扯了，面试官看着这种个人评价就烦。

我们可以从下面几个角度来写个人评价：

文档编写能力、学习能力、沟通能力、团队协作能力
对待工作的态度以及个人的责任心
能承受的工作压力以及对待困难的态度
对技术的追求、对代码质量的追求
分布式、高并发系统开发或维护经验
列举 3 个实际的例子：

学习能力较强，大三参加国家软件设计大赛的时候快速上手 Python 写了一个可配置化的爬虫系统。
具有团队协作精神，大三参加国家软件设计大赛的时候协调项目组内 5 名开发同学，并对编码遇到困难的同学提供帮助，最终顺利在 1 个月的时间完成项目的核心功能。
项目经验丰富，在校期间主导过多个企业级项目的开发。`}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
