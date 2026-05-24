import { Link } from 'react-router-dom';
import { Button } from '@ai-resume/ui';
import { ArrowRight, FileText, Search, Languages, Target } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const FEATURES = [
  { icon: FileText, title: 'Resume builder', description: 'Forms for every section. Nothing fancy, just works.' },
  { icon: Target, title: 'ATS analysis', description: 'Paste a job description, get a score and missing keywords.' },
  { icon: Search, title: 'Interview prep', description: 'Generates questions from your actual experience.' },
  { icon: Languages, title: 'Translate', description: 'Chinese, Japanese, Korean, French, German, Spanish.' },
];

export function HomePage() {
  const { isSignedIn } = useAuth();
  const linkTo = isSignedIn ? '/dashboard' : '/auth';

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          Resume builder{' '}
          <span className="text-primary">that doesn't get in your way</span>
        </h1>

        <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-10 leading-relaxed">
          Fill in the forms. AI fills the gaps. Export when you're done.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={linkTo}>
            <Button size="lg" className="text-base">
              Get started <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to={linkTo}>
            <Button variant="outline" size="lg" className="text-base">
              Sign in
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
        <p>AI Resume Builder</p>
      </footer>
    </div>
  );
}
