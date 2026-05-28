import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, Settings, ChevronRight } from 'lucide-react';
import { Button, cn } from '@ai-resume/ui';
import { useResumes } from '../../hooks/use-resume';

const NAV_ITEMS = [
  { href: '/dashboard', label: '我的简历', icon: FileText },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { data: resumes } = useResumes();

  return (
    <aside className="w-64 border-r border-border bg-card/50 hidden lg:flex flex-col">
      <div className="p-4">
        <Link to="/dashboard/resume/new">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" /> 新建简历
          </Button>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-3">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          最近编辑
        </h3>
        <div className="space-y-1">
          {(resumes as Array<{ id: string; title: string }> | undefined)?.slice(0, 5).map((resume) => (
            <Link
              key={resume.id}
              to={`/dashboard/resume/${resume.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group"
            >
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="truncate">{resume.title || '未命名简历'}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
