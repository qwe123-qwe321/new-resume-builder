import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@ai-resume/ui';
import { Wrench } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { RichTextEditor } from './RichTextEditor';

export function ProfessionalSkillsForm() {
  const { resume, updateField } = useResumeStore();
  const [exampleOpen, setExampleOpen] = useState(false);
  if (!resume) return null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          专业技能
        </h2>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">专业技能内容</span>
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setExampleOpen(true)}>
            示例
          </Button>
        </div>
        <RichTextEditor
          value={(resume as { targetIndustry?: string }).targetIndustry || ''}
          onChange={(html) => updateField('targetIndustry', html)}
          placeholder="请填写与你目标岗位最相关的专业技能、技术栈与实践场景。"
          minHeight={220}
        />
      </div>

      <Dialog open={exampleOpen} onOpenChange={setExampleOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>专业技能示例</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto whitespace-pre-line text-sm leading-7 text-foreground">
{`先问一下你自己会什么，然后看看你意向的公司需要什么。一般 HR 可能并不太懂技术，所以他在筛选简历的时候可能就盯着你专业技能的关键词来看。对于公司有要求而你不会的技能，你可以花几天时间学习一下，然后在简历上可以写上自己了解这个技能。

下面是一份最新的 Java 后端开发技能清单，你可以根据自身情况以及岗位招聘要求做动态调整，核心思想就是尽可能满足岗位招聘的所有技能要求。

下面是一些比较基本的 Java 后端开发技能（根据你自身的情况调整，切勿完全照搬）：

- 计算机基础：熟练掌握计算机网络、数据结构和算法、操作系统
- Java：熟悉 Java 语言，具备 JVM 调优和问题排查经验
- 开发工具：熟练使用 Maven/Gradle、Git、IDEA、Docker 等开发工具，有 Linux 开发和部署经验
- 数据库：熟练掌握 MySQL、Redis、Elasticsearch 使用及常见优化手段
- 框架：熟练掌握 Spring、Spring MVC、SpringBoot、MyBatis 等开发框架
- 分布式：熟练掌握分布式相关理论（如 CAP、Raft）以及解决方案（如分布式 ID、分布式事务），熟练使用 Spring Cloud Alibaba 全家桶（如 Dubbo、Nacos、Sentinel）
- 前端：熟练掌握 HTML、CSS、Javascript、React、Vue 等前端技术，前后端分离架构开发经验丰富

还有一些工作招聘有一些特殊的要求比如：

- Devops：熟练掌握 Jenkins，搭建过持续集成环境。
- 云原生：熟练掌握 Kubernetes 以及周边生态/ServiceMesh`}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
