import { Input, Label } from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ai-resume/ui';
import { Button } from '@ai-resume/ui';

export function PersonalDetailForm() {
  const { resume, updateField } = useResumeStore();

  if (!resume) return null;

  const fullName = `${resume.lastName || ''}${resume.firstName || ''}`.trim();
  const workYears = ((resume as { workYears?: string }).workYears || '应届生').trim();
  const photoUrl = (resume as { photoUrl?: string }).photoUrl || '';
  const workYearOptions = ['应届生', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年及以上'];

  const onUploadPhoto = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      (updateField as unknown as (k: string, v: string) => void)('photoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">基本信息</h2>

      <div className="mb-4 flex items-center gap-4">
        <div className="h-24 w-18 rounded border border-border bg-accent/40 overflow-hidden flex items-center justify-center">
          {photoUrl ? (
            <img src={photoUrl} alt="证件照" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">证件照</span>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground block">上传证件照</Label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onUploadPhoto(e.target.files?.[0] || null)}
            className="text-xs"
          />
          {photoUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => (updateField as unknown as (k: string, v: string) => void)('photoUrl', '')}
            >
              清除照片
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">姓名</Label>
          <Input
            value={fullName}
            onChange={(e) => {
              const name = e.target.value.trim();
              updateField('lastName', '');
              updateField('firstName', name);
            }}
            placeholder="请输入姓名"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">联系电话</Label>
          <Input value={resume.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="请输入联系电话" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">工作年限</Label>
          <Select
            value={workYearOptions.includes(workYears) ? workYears : '应届生'}
            onValueChange={(value) => (updateField as unknown as (k: string, v: string) => void)('workYears', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择工作年限" />
            </SelectTrigger>
            <SelectContent>
              {workYearOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">电子邮箱</Label>
          <Input value={resume.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="请输入电子邮箱" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">居住地址</Label>
          <Input value={resume.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="请输入居住地址" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">求职意向</Label>
          <Input value={resume.targetJobTitle || ''} onChange={(e) => updateField('targetJobTitle', e.target.value)} placeholder="请输入求职意向" />
        </div>
      </div>
    </div>
  );
}
