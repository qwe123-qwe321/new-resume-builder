import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Settings, 
  LayoutTemplate,
  ChevronRight,
  Sparkles,
  Home,
  FolderOpen
} from 'lucide-react';
import { Button, cn } from '@ai-resume/ui';
import { useResumes } from '../../hooks/use-resume';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'My Resumes', icon: Home },
  { href: '/dashboard/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { data: resumes } = useResumes();

  return (
    <aside className="w-[260px] border-r border-sidebar-border bg-sidebar hidden lg:flex flex-col">
      {/* Logo Section */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Resume Builder
          </span>
        </Link>
      </div>

      {/* New Resume Button */}
      <div className="p-4">
        <Link to="/dashboard/resume/new">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02]">
            <Plus className="h-4 w-4" /> 
            <span>New Resume</span>
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/dashboard' && location.pathname === '/dashboard');
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Recent Resumes */}
      <div className="mt-6 px-3 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 px-3 mb-3">
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent
          </h3>
        </div>
        <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
          {(resumes as Array<{ id: string; title: string; themeColor?: string }> | undefined)?.slice(0, 8).map((resume) => (
            <Link
              key={resume.id}
              to={`/dashboard/resume/${resume.id}/edit`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 group"
            >
              <div 
                className="h-2 w-2 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-sidebar"
                style={{ backgroundColor: resume.themeColor || '#6366F1' }}
              />
              <span className="truncate flex-1">{resume.title || 'Untitled'}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </Link>
          ))}
          {(!resumes || (resumes as unknown[]).length === 0) && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No resumes yet
            </p>
          )}
        </div>
      </div>

      {/* AI Feature Promo */}
      <div className="p-4 mt-auto">
        <div className="glass rounded-xl p-4 gradient-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground">AI-Powered</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get ATS scores, interview prep, and smart suggestions.
          </p>
        </div>
      </div>
    </aside>
  );
}
