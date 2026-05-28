import { Link } from 'react-router-dom';
import { Button } from '@ai-resume/ui';
import { ArrowRight, FileText, Search, Languages, Target } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const FEATURES = [
  { icon: FileText, title: '结构化简历编辑', description: '分模块填写，所见即所得，快速生成专业简历。' },
  { icon: Target, title: 'ATS 匹配分析', description: '粘贴岗位描述，分析匹配度并提示关键优化点。' },
  { icon: Search, title: '面试问题生成', description: '结合你的经历内容，生成更有针对性的面试题。' },
  { icon: Languages, title: '多语言支持', description: '支持中文、日语、韩语、法语、德语、西班牙语。' },
];

export function HomePage() {
  const { isSignedIn } = useAuth();
  const linkTo = isSignedIn ? '/dashboard' : '/auth';

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          专注内容本身的
          <span className="text-primary"> AI 简历助手</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-10 leading-relaxed">
          你负责表达经历，AI 协助润色与补全，完成后即可导出。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={linkTo}>
            <Button size="lg" className="text-base">
              立即开始 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to={linkTo}>
            <Button variant="outline" size="lg" className="text-base">
              前往登录
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="mt-0.5 h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        <p>AI 简历助手</p>
      </footer>
    </div>
  );
}
