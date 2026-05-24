import { Button, cn } from '@ai-resume/ui';
import { Palette, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { RESUME_THEME_COLORS } from '@ai-resume/shared';

export function ThemePicker() {
  const { resume, updateField } = useResumeStore();
  const currentColor = resume?.themeColor || '#6366F1';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <div
            className="h-4 w-4 rounded-full ring-2 ring-offset-2 ring-offset-background ring-border"
            style={{ backgroundColor: currentColor }}
          />
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resume Theme</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose a color that matches your style
            </p>
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {RESUME_THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateField('themeColor', color)}
                className={cn(
                  'h-9 w-9 rounded-lg transition-all duration-200',
                  'flex items-center justify-center',
                  'hover:scale-110 hover:shadow-lg',
                  'ring-2 ring-offset-2 ring-offset-popover',
                  currentColor === color 
                    ? 'ring-primary scale-110' 
                    : 'ring-transparent hover:ring-border'
                )}
                style={{ 
                  backgroundColor: color,
                  boxShadow: currentColor === color ? `0 4px 14px ${color}40` : undefined
                }}
              >
                {currentColor === color && (
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Custom:</span>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateField('themeColor', e.target.value)}
                className="h-8 w-16 rounded cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {currentColor}
              </span>
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
