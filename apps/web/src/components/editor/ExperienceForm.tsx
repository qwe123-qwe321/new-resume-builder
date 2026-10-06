import { Button, Input, Label, cn, Dialog, DialogContent, DialogHeader, DialogTitle } from '@ai-resume/ui';
import { Plus, Trash2, Briefcase, Building2, MapPin, Calendar, GripVertical } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RichTextEditor } from './RichTextEditor';

export function ExperienceForm() {
  const {
    resume,
    addExperience,
    updateExperience,
    removeExperience,
    candidateType,
    setCandidateType,
    studentExperienceType,
    setStudentExperienceType,
  } = useResumeStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [exampleOpen, setExampleOpen] = useState(false);

  if (!resume) return null;

  const experiences = resume.experience || [];
  const sectionTitle =
    candidateType === 'professional'
      ? '工作经历'
      : studentExperienceType === 'internship'
        ? '实习经历'
        : '项目经历';
  const rolePlaceholder =
    candidateType === 'professional'
      ? '前端/后端/架构等职位名称'
      : studentExperienceType === 'internship'
        ? '前端/后端/架构等职位名称'
        : '例如：项目负责人 / 开发成员';
  const isProjectMode = candidateType === 'student' && studentExperienceType === 'project';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          {sectionTitle}
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 p-1">
            <Button type="button" variant={candidateType === 'student' ? 'default' : 'ghost'} size="sm" onClick={() => setCandidateType('student')} className="flex-1">学生</Button>
            <Button type="button" variant={candidateType === 'professional' ? 'default' : 'ghost'} size="sm" onClick={() => setCandidateType('professional')} className="flex-1">正式工作者</Button>
          </div>
          {candidateType === 'student' && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 p-1">
              <Button type="button" variant={studentExperienceType === 'internship' ? 'default' : 'ghost'} size="sm" onClick={() => setStudentExperienceType('internship')} className="flex-1">实习经历</Button>
              <Button type="button" variant={studentExperienceType === 'project' ? 'default' : 'ghost'} size="sm" onClick={() => setStudentExperienceType('project')} className="flex-1">项目经历</Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {experiences.map((exp, index) => (
          <motion.div key={index} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="glass rounded-xl overflow-hidden">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)} className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent text-muted-foreground"><GripVertical className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{isProjectMode ? (exp.companyName || '新项目') : (exp.companyName || '新单位')}</p>
                <p className="text-xs text-muted-foreground truncate">{exp.title || '担任角色'} {exp.startDate && `· ${exp.startDate}`}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <svg className={cn('h-5 w-5 text-muted-foreground transition-transform duration-200', expandedIndex === index && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                    {experiences.length > 1 && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => removeExperience(index)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 mr-2" /> 删除
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {isProjectMode ? (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">项目名称</Label>
                            <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.companyName || ''} onChange={(e) => updateExperience(index, { companyName: e.target.value })} placeholder="例如：校园二手交易平台" className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">担任角色</Label>
                            <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.title || ''} onChange={(e) => updateExperience(index, { title: e.target.value })} placeholder={rolePlaceholder} className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">省份</Label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.city || ''} onChange={(e) => updateExperience(index, { city: e.target.value })} placeholder="例如：江苏省" className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">市/区</Label>
                            <Input value={exp.state || ''} onChange={(e) => updateExperience(index, { state: e.target.value })} placeholder="例如：南京市鼓楼区" className="bg-accent/50" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">公司名称</Label>
                            <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.companyName || ''} onChange={(e) => updateExperience(index, { companyName: e.target.value })} placeholder="例如：某某科技有限公司" className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">工作地点</Label>
                            <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.state || ''} onChange={(e) => updateExperience(index, { state: e.target.value })} placeholder="例如：上海市浦东新区" className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">担任角色</Label>
                            <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.title || ''} onChange={(e) => updateExperience(index, { title: e.target.value })} placeholder={rolePlaceholder} className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">部门/业务方向</Label>
                            <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input value={exp.city || ''} onChange={(e) => updateExperience(index, { city: e.target.value })} placeholder="例如：支付中台/交易系统" className="pl-10 bg-accent/50" />
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">开始时间</Label>
                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="month" value={exp.startDate || ''} onChange={(e) => updateExperience(index, { startDate: e.target.value })} className="pl-10 bg-accent/50" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">结束时间</Label>
                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="month" value={exp.endDate || ''} onChange={(e) => updateExperience(index, { endDate: e.target.value })} placeholder="至今" disabled={exp.currentlyWorking} className="pl-10 bg-accent/50 disabled:opacity-50" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="mb-1.5 flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground block">工作内容与成果</Label>
                          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setExampleOpen(true)}>示例</Button>
                        </div>
                        <RichTextEditor value={exp.workSummary || ''} onChange={(html) => updateExperience(index, { workSummary: html })} placeholder="请填写工作内容与成果（点击右上角“示例”查看参考）" minHeight={180} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button variant="outline" onClick={() => { addExperience(); setExpandedIndex(experiences.length); }} className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 h-12">
        <Plus className="h-4 w-4" /> 添加{sectionTitle}
      </Button>

      <Dialog open={exampleOpen} onOpenChange={setExampleOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>工作内容与成果示例</DialogTitle></DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto whitespace-pre-line text-sm leading-6 text-foreground">
{`项目描述：简单描述项目是做什么的。后面可以加上GitHub地址或者演示地址
技术栈：用了什么技术（如 Spring Boot + MySQL + Redis + Mybatis-plus + Spring Security + Oauth2）。
工作内容/个人职责：简单描述自己做了什么，解决了什么问题，带来了什么实质性的改善。突出自己的能力，不要过于平淡的叙述。尽量减少纯业务的个人职责介绍，对于面试不太友好。尽量再多挖掘一些亮点（6~8 条个人职责介绍差不多了，做好筛选），最好可以体现自己的综合素质，比如你是如何协调项目组成员协同开发的或者在遇到某一个棘手的问题的时候你是如何解决的又或者说你在这个项目优化了某个模块的性能,技术优化取得的成果尽量要量化一下
个人收获（可选）：从这个项目中你学会了那些东西，使用到了那些技术，学会了那些新技术的使用。通常是可以不用写个人收获的，因为你在个人职责介绍中写的东西已经表明了自己的主要收获。
项目成果（可选）：简单描述这个项目取得了什么成绩。`}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
