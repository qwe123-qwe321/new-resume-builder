import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, cn } from '@ai-resume/ui';
import {
  Plus,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  Search,
  LayoutGrid,
  List,
  Clock,
  Sparkles,
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

type ViewMode = 'grid' | 'list';

export function DashboardPage() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const { data: resumes, isLoading } = useResumes();
  const createResume = useCreateResume();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
            setTitle('');
            setTargetJob('');
            navigate(`/dashboard/resume/${id}/edit`);
          }
        },
      },
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    const token = await getToken();
    await api.resumes.archive(id, token).catch(() => toast.error('Failed to delete'));
    toast.success('Resume deleted');
    window.location.reload();
  };

  const filteredResumes = (resumes as Array<{ id: string; title: string; documentId: string; updatedAt: string; themeColor?: string; _count?: { versions: number } }> | undefined)?.filter(
    (resume) => resume.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            My Resumes
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your professional resumes
          </p>
        </div>
        <Button 
          onClick={() => setOpen(true)} 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 sm:w-auto w-full"
        >
          <Plus className="h-4 w-4" /> New Resume
        </Button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-3'
        )}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                'glass rounded-xl animate-pulse',
                viewMode === 'grid' ? 'h-48' : 'h-20'
              )} 
            />
          ))}
        </div>
      ) : !filteredResumes || filteredResumes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No resumes found' : 'No resumes yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchQuery 
              ? 'Try a different search term'
              : 'Create your first resume and let AI help you stand out from the crowd.'
            }
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => setOpen(true)} 
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> Create Your First Resume
            </Button>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredResumes.map((resume, i) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link to={`/dashboard/resume/${resume.id}/edit`}>
                  <div className="glass rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                    {/* Color Bar */}
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: resume.themeColor || '#6366F1' }}
                    />
                    
                    {/* Preview Thumbnail */}
                    <div className="h-32 bg-gradient-to-b from-accent/50 to-transparent flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground/20" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground truncate pr-2 group-hover:text-primary transition-colors">
                          {resume.title || 'Untitled'}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              onClick={(e) => e.preventDefault()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-accent"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); navigate(`/dashboard/resume/${resume.id}/edit`); }}>
                              <FileText className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); window.open(`/resume/${resume.id}/view`, '_blank'); }}>
                              <ExternalLink className="h-4 w-4 mr-2" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <Separator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDelete(resume.id, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </span>
                        {resume._count?.versions && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {resume._count.versions} versions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {filteredResumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/dashboard/resume/${resume.id}/edit`}>
                <div className="glass rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-200 group">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${resume.themeColor || '#6366F1'}20` }}
                  >
                    <FileText className="h-5 w-5" style={{ color: resume.themeColor || '#6366F1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {resume.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); window.open(`/resume/${resume.id}/view`, '_blank'); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Create New Resume
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Resume Title</Label>
              <Input
                placeholder="e.g., Software Engineer 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 bg-accent/50"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Give your resume a name to help you organize
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Target Position (Optional)</Label>
              <Input
                placeholder="e.g., Senior Frontend Developer at Google"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                className="mt-1.5 bg-accent/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will tailor suggestions for this role
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createResume.isPending}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {createResume.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Resume
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
