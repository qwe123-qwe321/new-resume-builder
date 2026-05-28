import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@ai-resume/ui';
import { useAuth } from '@/contexts/auth';

export function Header() {
  const { isSignedIn, user, logout } = useAuth();

  return (
    <header className="no-print glass-strong sticky top-0 z-50 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight hidden sm:block">
            AI 简历助手
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">控制台</span>
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground hidden sm:inline mr-2">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                退出登录
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  注册
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
