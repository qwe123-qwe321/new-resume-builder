import { type ReactElement, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useResumeStore } from '../../stores/resume-store';

const A4_MM_HEIGHT = 297;
const PX_PER_MM = 3.7795275591;
const A4_PX_HEIGHT = A4_MM_HEIGHT * PX_PER_MM;
// A slight tolerance is used so page tails are filled more aggressively.
const PAGE_CONTENT_HEIGHT = A4_PX_HEIGHT - 32;

type Block = { id: string; node: ReactElement };

export function ResumePreview() {
  const { resume, candidateType, studentExperienceType } = useResumeStore();
  const measureRootRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<Block[][]>([]);
  const [ready, setReady] = useState(false);

  const themeColor = resume?.themeColor || '#1f4e79';
  const fullName = (resume?.firstName || `${resume?.lastName || ''}${resume?.firstName || ''}`).trim() || '你的姓名';
  const experienceList = resume?.experience || [];
  const educationList = resume?.education || [];
  const certs = Array.isArray(resume?.certifications) ? resume.certifications : [];
  const langs = Array.isArray(resume?.languages) ? resume.languages : [];
  const professionalSkillsHtml = (resume as { targetIndustry?: string } | null)?.targetIndustry || '';
  const photoUrl = (resume as { photoUrl?: string } | null)?.photoUrl;

  const isProjectMode = candidateType === 'student' && studentExperienceType === 'project';
  const experienceSectionTitle =
    candidateType === 'professional'
      ? '工作经历'
      : studentExperienceType === 'internship'
        ? '实习经历'
        : '项目经历';

  const blocks = useMemo<Block[]>(() => {
    const list: Block[] = [];

    list.push({
      id: 'top-bar',
      node: (
        <div className="space-y-2">
          <div
            className="h-2.5 rounded-sm"
            style={{ background: `linear-gradient(90deg, ${themeColor} 0%, ${themeColor} 58%, #9ca3af 58%, #9ca3af 100%)` }}
          />
          <div className="h-px bg-gray-300" />
        </div>
      ),
    });

    list.push({
      id: 'base',
      node: (
        <section>
          <SectionHeader title="基本信息" color={themeColor} />
          <div className="mt-1.5 flex gap-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 flex-1 pr-1 text-[12px] leading-[1.08]">
              <Row label="姓名" value={fullName} />
              <Row label="联系电话" value={resume?.phone || '-'} />
              <Row label="工作年限" value={(resume as { workYears?: string } | null)?.workYears || '应届生'} />
              <Row label="电子邮箱" value={resume?.email || '-'} />
              <Row label="居住地址" value={resume?.address || '-'} />
              <Row label="求职意向" value={resume?.targetJobTitle || '-'} />
            </div>
            <div className="w-16 shrink-0">
              <div className="h-22 border border-gray-300 rounded-sm overflow-hidden bg-gray-50">
                {photoUrl ? (
                  <img src={photoUrl} alt="证件照" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">证件照</div>
                )}
              </div>
            </div>
          </div>
        </section>
      ),
    });

    if (educationList.length > 0) {
      list.push({ id: 'education-title', node: <SectionHeader title="教育背景" color={themeColor} /> });
      educationList.forEach((edu, i) => {
        list.push({
          id: `education-${i}`,
          node: (
            <div className="text-[12px] leading-[1.08]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                <span className="text-[14px] font-semibold">{edu.universityName || '学校名称'}</span>
                <span className="text-gray-800 text-center text-[12px] font-semibold">
                  {edu.degree || '学历'}{edu.major ? ` | ${edu.major}` : ''}
                </span>
                <span className="text-[12px] text-gray-700 text-right">{edu.startDate || '-'} ~ {edu.endDate || '至今'}</span>
              </div>
              {edu.description && <div className="text-[12px] text-gray-700 resume-rich-content" dangerouslySetInnerHTML={{ __html: edu.description }} />}
            </div>
          ),
        });
      });
    }

    if (professionalSkillsHtml) {
      list.push({ id: 'skills-pro-title', node: <SectionHeader title="专业技能" color={themeColor} /> });
      splitRichTextHtml(professionalSkillsHtml).forEach((chunk, i) => {
        list.push({
          id: `skills-pro-${i}`,
          node: <div className="text-[12px] leading-[1.08] resume-rich-content" dangerouslySetInnerHTML={{ __html: chunk }} />,
        });
      });
    }

    if (experienceList.length > 0) {
      list.push({ id: 'exp-title', node: <SectionHeader title={experienceSectionTitle} color={themeColor} /> });
      experienceList.forEach((exp, i) => {
        const headerNode = isProjectMode ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
            <span className="text-[14px] font-semibold">{exp.companyName || ''}</span>
            <span className="text-[12px] text-gray-800 text-center font-semibold">{exp.title || ''}</span>
            <span className="text-[12px] text-gray-700 text-right">
              {(exp.startDate || exp.endDate) ? `${exp.startDate || '-'} ~ ${exp.endDate || '至今'}` : ''}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
            <span className="text-[14px] font-semibold">{exp.companyName || ''}</span>
            <span className="text-[12px] text-gray-800 text-center font-semibold">
              {exp.title || exp.city ? `${exp.title || ''}|${exp.city || ''}` : ''}
            </span>
            <span className="text-[12px] text-gray-700 text-right">
              {exp.state || (exp.startDate || exp.endDate)
                ? `${exp.state || ''}${exp.state && (exp.startDate || exp.endDate) ? '|' : ''}${(exp.startDate || exp.endDate) ? `${exp.startDate || '-'} ~ ${exp.endDate || '至今'}` : ''}`
                : ''}
            </span>
          </div>
        );

        list.push({
          id: `exp-${i}-header`,
          node: <div className="text-[12px] leading-[1.08]">{headerNode}</div>,
        });

        splitRichTextHtml(exp.workSummary || '').forEach((chunk, idx) => {
          list.push({
            id: `exp-${i}-summary-${idx}`,
            node: <div className="mt-1 text-[12px] text-gray-700 resume-rich-content" dangerouslySetInnerHTML={{ __html: chunk }} />,
          });
        });
      });
    }

    if ((resume as { atsFeedback?: string } | null)?.atsFeedback || (resume as { targetCompany?: string } | null)?.targetCompany || certs.length > 0 || langs.length > 0) {
      list.push({ id: 'campus-title', node: <SectionHeader title="校园经历" color={themeColor} /> });
      const ats = (resume as { atsFeedback?: string } | null)?.atsFeedback || '';
      const company = (resume as { targetCompany?: string } | null)?.targetCompany || '';
      splitRichTextHtml(ats).forEach((chunk, i) => {
        list.push({
          id: `campus-ats-${i}`,
          node: <div className="text-[12px] leading-[1.08] resume-rich-content" dangerouslySetInnerHTML={{ __html: chunk }} />,
        });
      });
      splitRichTextHtml(company).forEach((chunk, i) => {
        list.push({
          id: `campus-company-${i}`,
          node: <div className="text-[12px] leading-[1.08] resume-rich-content" dangerouslySetInnerHTML={{ __html: chunk }} />,
        });
      });
      if (certs.length > 0) {
        list.push({
          id: 'campus-certs',
          node: <p className="text-[12px] leading-[1.08]"><span className="font-semibold">证书：</span>{certs.filter(Boolean).join('、')}</p>,
        });
      }
      if (langs.length > 0) {
        langs.filter(Boolean).forEach((line, i) => {
          list.push({
            id: `campus-lang-${i}`,
            node: <div className="text-[12px] leading-[1.08] resume-rich-content" dangerouslySetInnerHTML={{ __html: line }} />,
          });
        });
      }
    }

    if (resume?.summary) {
      list.push({ id: 'summary-title', node: <SectionHeader title="自我评价" color={themeColor} /> });
      splitRichTextHtml(resume.summary || '').forEach((chunk, i) => {
        list.push({
          id: `summary-${i}`,
          node: <div className="text-[12px] leading-[1.08] resume-rich-content" dangerouslySetInnerHTML={{ __html: chunk }} />,
        });
      });
    }

    return list;
  }, [themeColor, fullName, resume, educationList, professionalSkillsHtml, experienceList, experienceSectionTitle, isProjectMode, certs, langs, photoUrl]);

  useLayoutEffect(() => {
    if (!resume) {
      setPages([]);
      setReady(true);
      return;
    }
    const host = measureRootRef.current;
    if (!host) return;

    const blockEls = Array.from(host.querySelectorAll<HTMLElement>('[data-block-id]'));
    if (blockEls.length === 0) {
      setPages([]);
      setReady(true);
      return;
    }

    const heights = new Map<string, number>();
    for (const el of blockEls) {
      heights.set(el.dataset.blockId || '', el.offsetHeight);
    }

    const nextPages: Block[][] = [];
    let current: Block[] = [];
    let used = 0;
    for (const b of blocks) {
      const h = heights.get(b.id) || 0;
      const gap = current.length > 0 ? 12 : 0;
      const blockNeed = h + gap;
      if (current.length > 0 && used + blockNeed > PAGE_CONTENT_HEIGHT) {
        nextPages.push(current);
        current = [];
        used = 0;
      }
      current.push(b);
      used += blockNeed;
    }
    if (current.length > 0) nextPages.push(current);
    if (nextPages.length === 0) nextPages.push([]);

    // Backfill: move next-page leading blocks up when they still fit.
    for (let i = 0; i < nextPages.length - 1; i++) {
      let changed = true;
      while (changed && nextPages[i + 1].length > 0) {
        changed = false;
        const candidate = nextPages[i + 1][0];
        const prev = nextPages[i];
        const prevHeight = prev.reduce((sum, b, idx) => {
          const hh = heights.get(b.id) || 0;
          return sum + hh + (idx > 0 ? 12 : 0);
        }, 0);
        const candHeight = (heights.get(candidate.id) || 0) + (prev.length > 0 ? 12 : 0);
        if (prevHeight + candHeight <= PAGE_CONTENT_HEIGHT) {
          prev.push(candidate);
          nextPages[i + 1].shift();
          changed = true;
        }
      }
    }

    // Remove empty pages caused by backfill.
    const compactPages = nextPages.filter((p) => p.length > 0);
    if (compactPages.length === 0) compactPages.push([]);

    setPages(compactPages);
    setReady(true);
  }, [blocks]);

  return (
    <>
      {!resume ? (
        <div className="a4-page flex items-center justify-center">
          <p className="text-gray-400">暂无简历数据</p>
        </div>
      ) : (
        <>
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="a4-measure-root" ref={measureRootRef}>
            <div className="a4-measure-inner px-8 py-5 space-y-3">
              {blocks.map((b) => (
                <div key={b.id} data-block-id={b.id}>
                  {b.node}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      <div className="a4-pages-list" style={{ visibility: ready ? 'visible' : 'hidden' }}>
        {(pages.length > 0 ? pages : [blocks]).map((page, index) => (
          <div key={index} className="a4-page">
            <div className="px-8 py-5 space-y-3">
              {page.map((b) => (
                <div key={b.id}>{b.node}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </>
  );
}

function splitRichTextHtml(input: string): string[] {
  const html = String(input || '').trim();
  if (!html) return [];
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return [html];

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out: string[] = [];
    const nodes = Array.from(doc.body.childNodes);
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || '').trim();
        if (text) out.push(`<p>${text}</p>`);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        const lis = Array.from(el.querySelectorAll(':scope > li'));
        if (lis.length === 0) {
          out.push(el.outerHTML);
          return;
        }
        lis.forEach((li) => out.push(`<${tag}><li>${li.innerHTML}</li></${tag}>`));
        return;
      }
      out.push(el.outerHTML);
    });
    return out.length > 0 ? out : [html];
  } catch {
    return [html];
  }
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-[14px] font-bold tracking-wide" style={{ color }}>
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis" title={value}>
      <span className="font-semibold">{label}：</span>
      <span className="text-gray-800">{value}</span>
    </p>
  );
}
