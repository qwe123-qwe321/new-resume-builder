import { createBrowserRouter, Navigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '../contexts/auth';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { HomePage } from '../app/(marketing)/page';
import { DashboardPage } from '../app/(dashboard)/dashboard/page';
import { EditResumePage } from '../app/(dashboard)/resume/[id]/edit/page';
import { ViewResumePage } from '../app/(dashboard)/resume/[id]/view/page';
import { ResumeAiWorkspacePage } from '../app/(dashboard)/resume/[id]/ai/page';
import { AuthPage } from '../app/auth/page';
import { TemplatesPage } from '../app/(dashboard)/templates/page';
import { SettingsPage } from '../app/(dashboard)/settings/page';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!isSignedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <p className="text-muted-foreground mt-4">页面不存在</p>
          <a href="/dashboard" className="text-primary hover:underline text-sm mt-2 inline-block">
            返回控制台
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold">页面发生错误</h1>
        <p className="text-muted-foreground mt-2">请刷新后重试，或返回首页。</p>
        <a href="/" className="text-primary hover:underline text-sm mt-4 inline-block">
          返回首页
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auth', element: <AuthPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'resume/new', element: <Navigate to="/dashboard" replace /> },
          { path: 'resume/:id/edit', element: <EditResumePage /> },
          { path: 'templates', element: <TemplatesPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      {
        path: 'resume/:id/view',
        element: <ViewResumePage />,
      },
      {
        path: 'resume/:id/ai',
        element: <ResumeAiWorkspacePage />,
      },
    ],
  },
]);
