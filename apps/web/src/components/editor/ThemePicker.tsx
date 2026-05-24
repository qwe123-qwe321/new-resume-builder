import { Button } from '@ai-resume/ui';
import { Palette, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { RESUME_THEME_COLORS } from '@ai-resume/shared';
import { cn } from '@ai-resume/ui';

export function ThemePicker() {
  const { resume, updateField } = useResumeStore();
  const currentColor = resume?.themeColor || '#2563eb';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div
            className="h-3.5 w-3.5 rounded-full border border-white/20"
            style={{ backgroundColor: currentColor }}
          />
          <Palette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <h3 className="text-sm font-semibold mb-3">Theme Color</h3>
        <div className="grid grid-cols-5 gap-2">
          {RESUME_THEME_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateField('themeColor', color)}
              className={cn(
                'h-8 w-8 rounded-lg transition-all hover:scale-110',
                'flex items-center justify-center',
              )}
              style={{ backgroundColor: color }}
            >
              {currentColor === color && (
                <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
