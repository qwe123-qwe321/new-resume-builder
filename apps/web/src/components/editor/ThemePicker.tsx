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
import { useState } from 'react';

export function ThemePicker() {
  const { resume, updateField } = useResumeStore();
  const currentColor = resume?.themeColor || '#2563eb';
  const [customColor, setCustomColor] = useState(currentColor);

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
        <h3 className="text-sm font-semibold mb-3">主题色</h3>
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
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">自定义颜色</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-8 w-10 rounded border border-border bg-transparent p-0.5"
              aria-label="自定义主题色"
            />
            <input
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#2563eb"
              className="h-8 flex-1 rounded border border-border bg-background px-2 text-xs"
            />
            <Button size="sm" className="h-8" onClick={() => updateField('themeColor', customColor)}>
              应用
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
