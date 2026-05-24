import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@ai-resume/ui';
import {
  Plus,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ai-resume/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumes, useCreateResume } from '@/hooks/use-resume';
import { useAuth } from '@/contexts/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const { data: resumes, isLoading } = useResumes();
  const createResume = useCreateResume();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetJob, setTargetJob] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createResume.mutate(
      {
        data: {
          title: title.trim(),
          targetJobTitle: targetJob.trim() || null,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
        },
      },
      {
        onSuccess: (result) => {
          const id = (result as { data: { data: { id: string } } }).data?.data?.id;
          if (id) {
            setOpen(false);
            navigate(`/dashboard/resume/${id}/edit`);
          }
        },
      },
    );
  };

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await api.resumes.archive(id, token).catch(() => toast.error('Failed to delete'));
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resumes</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Resume
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : !Array.isArray(resumes) || resumes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-12 text-center"
        >
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nothing here yet</h3>
          <p className="text-muted-foreground mb-6">Start a new resume to begin.</p>
          <Button onClick={() => setOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Resume
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {(resumes as Array<{ id: string; title: string; documentId: string; updatedAt: string; themeColor?: string; _count?: { versions: number } }> | undefined)?.map((resume, i: number) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group glass rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: resume.themeColor || '#6366f1' }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground truncate pr-2">
                      {resume.title || 'Untitled'}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/resume/${resume.id}/edit`)}>
                          <FileText className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/resume/${resume.id}/view`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(resume.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    {resume._count?.versions ? ` · ${resume._count.versions} versions` : ''}
                  </p>
                  <Link
                    to={`/dashboard/resume/${resume.id}/edit`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Edit
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Software Engineer 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Target job (optional)</Label>
              <Input
                placeholder="Senior Frontend Developer"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createResume.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createResume.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
