import { type ReactElement, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useResumeStore } from '../../stores/resume-store';

const A4_MM_HEIGHT = 297;
const PX_PER_MM = 3.7795275591;
const A4_PX_HEIGHT = A4_MM_HEIGHT * PX_PER_MM;
// A slight tolerance is used so page tails are filled more aggressively.
const PAGE_CONTENT_HEIGHT = A4_PX_HEIGHT - 32;
const DEFAULT_BLOCK_GAP = 12;
const SECTION_CONTENT_GAP = 8;
const RICH_TEXT_FIRST_GAP = 4;
const RICH_TEXT_FRAGMENT_GAP = 3;
const RICH_TEXT_LIST_ITEM_GAP = 1;

type Block = { id: string; node: ReactElement; gapBefore?: number };
type RichTextChunk = { html: string; gapBefore?: number };

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
    const pushRichTextBlocks = (
      idPrefix: string,
      html: string,
      className: string,
      firstGap = RICH_TEXT_FIRST_GAP,
    ) => {
      splitRichTextHtml(html).forEach((chunk, i) => {
        list.push({
          id: `${idPrefix}-${i}`,
          gapBefore: i === 0 ? firstGap : chunk.gapBefore,
          node: <div className={`${className} resume-rich-content-fragment`} dangerouslySetInnerHTML={{ __html: chunk.html }} />,
        });
      });
    };

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
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 flex-1 pr-1 text-[12px] leading-normal">
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
          gapBefore: i === 0 ? SECTION_CONTENT_GAP : DEFAULT_BLOCK_GAP,
          node: (
            <div className="text-[12px] leading-normal">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                <span className="text-[14px] font-semibold">{edu.universityName || '学校名称'}</span>
                <span className="text-gray-800 text-center text-[12px] font-semibold">
                  {edu.degree || '学历'}{edu.major ? ` | ${edu.major}` : ''}
                </span>
                <span className="text-[12px] text-gray-700 text-right">{edu.startDate || '-'} ~ {edu.endDate || '至今'}</span>
              </div>
            </div>
          ),
        });
        pushRichTextBlocks(`education-${i}-desc`, edu.description || '', 'text-[12px] text-gray-700 resume-rich-content', RICH_TEXT_FIRST_GAP);
      });
    }

    if (professionalSkillsHtml) {
      list.push({ id: 'skills-pro-title', node: <SectionHeader title="专业技能" color={themeColor} /> });
      pushRichTextBlocks('skills-pro', professionalSkillsHtml, 'text-[12px] leading-normal resume-rich-content-compact', SECTION_CONTENT_GAP);
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
          gapBefore: i === 0 ? SECTION_CONTENT_GAP : DEFAULT_BLOCK_GAP,
          node: <div className="text-[12px] leading-normal">{headerNode}</div>,
        });

        pushRichTextBlocks(`exp-${i}-summary`, exp.workSummary || '', 'text-[12px] text-gray-700 resume-rich-content-compact', RICH_TEXT_FIRST_GAP);
      });
    }

    if ((resume as { atsFeedback?: string } | null)?.atsFeedback || (resume as { targetCompany?: string } | null)?.targetCompany || certs.length > 0 || langs.length > 0) {
      list.push({ id: 'campus-title', node: <SectionHeader title="校园经历" color={themeColor} /> });
      const ats = (resume as { atsFeedback?: string } | null)?.atsFeedback || '';
      const company = (resume as { targetCompany?: string } | null)?.targetCompany || '';
      pushRichTextBlocks('campus-ats', ats, 'text-[12px] leading-normal resume-rich-content-compact', SECTION_CONTENT_GAP);
      pushRichTextBlocks('campus-company', company, 'text-[12px] leading-normal resume-rich-content-compact', ats ? RICH_TEXT_FIRST_GAP : SECTION_CONTENT_GAP);
      if (certs.length > 0) {
        list.push({
          id: 'campus-certs',
          gapBefore: ats || company ? DEFAULT_BLOCK_GAP : SECTION_CONTENT_GAP,
          node: <p className="text-[12px] leading-normal"><span className="font-semibold">证书：</span>{certs.filter(Boolean).join('、')}</p>,
        });
      }
      if (langs.length > 0) {
        langs.filter(Boolean).forEach((line, i) => {
          const hasEarlierCampusContent = Boolean(ats || company || certs.length > 0 || i > 0);
          pushRichTextBlocks(`campus-lang-${i}`, line, 'text-[12px] leading-normal resume-rich-content-compact', hasEarlierCampusContent ? RICH_TEXT_FIRST_GAP : SECTION_CONTENT_GAP);
        });
      }
    }

    if (resume?.summary) {
      list.push({ id: 'summary-title', node: <SectionHeader title="自我评价" color={themeColor} /> });
      pushRichTextBlocks('summary', resume.summary || '', 'text-[12px] leading-normal resume-rich-content-compact', SECTION_CONTENT_GAP);
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
      let gap = getBlockGap(b, current.length > 0);
      const blockNeed = h + gap;
      if (current.length > 0 && used + blockNeed > PAGE_CONTENT_HEIGHT) {
        nextPages.push(current);
        current = [];
        used = 0;
        gap = 0;
      }
      current.push(b);
      used += h + gap;
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
        const prevHeight = getPageHeight(prev, heights);
        const candHeight = (heights.get(candidate.id) || 0) + getBlockGap(candidate, prev.length > 0);
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
            <div className="a4-measure-inner px-8 py-5">
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
            <div className="px-8 py-5">
              {page.map((b, blockIndex) => (
                <div key={b.id} style={getBlockStyle(b, blockIndex)}>
                  {b.node}
                </div>
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

function getBlockGap(block: Block, hasPreviousBlock: boolean) {
  if (!hasPreviousBlock) return 0;
  return block.gapBefore ?? DEFAULT_BLOCK_GAP;
}

function getBlockStyle(block: Block, index: number) {
  const marginTop = getBlockGap(block, index > 0);
  return marginTop > 0 ? { marginTop } : undefined;
}

function getPageHeight(page: Block[], heights: Map<string, number>) {
  return page.reduce((sum, b, idx) => {
    const height = heights.get(b.id) || 0;
    return sum + height + getBlockGap(b, idx > 0);
  }, 0);
}

function splitRichTextHtml(input: string): RichTextChunk[] {
  const html = String(input || '').trim();
  if (!html) return [];
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return [{ html, gapBefore: RICH_TEXT_FRAGMENT_GAP }];

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const out: RichTextChunk[] = [];
    const nodes = Array.from(doc.body.childNodes);
    nodes.forEach((node) => out.push(...splitRichTextNode(node)));
    return out.length > 0 ? out : [{ html, gapBefore: RICH_TEXT_FRAGMENT_GAP }];
  } catch {
    return [{ html, gapBefore: RICH_TEXT_FRAGMENT_GAP }];
  }
}

function splitRichTextNode(node: ChildNode): RichTextChunk[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || '').trim();
    return text ? [{ html: `<p>${escapeHtml(text)}</p>`, gapBefore: RICH_TEXT_FRAGMENT_GAP }] : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === 'ul' || tag === 'ol') {
    return splitListElement(el, tag);
  }

  if (tag === 'li') {
    return [{ html: `<ul>${el.outerHTML}</ul>`, gapBefore: RICH_TEXT_LIST_ITEM_GAP }];
  }

  if (tag === 'div' && hasBlockChildren(el)) {
    const chunks = Array.from(el.childNodes).flatMap((child) => splitRichTextNode(child));
    return chunks.length > 0 ? chunks : [{ html: el.outerHTML, gapBefore: RICH_TEXT_FRAGMENT_GAP }];
  }

  return [{ html: el.outerHTML, gapBefore: RICH_TEXT_FRAGMENT_GAP }];
}

function splitListElement(el: HTMLElement, tag: string): RichTextChunk[] {
  const items = Array.from(el.children).filter((child) => child.tagName.toLowerCase() === 'li');
  if (items.length === 0) return [{ html: el.outerHTML, gapBefore: RICH_TEXT_FRAGMENT_GAP }];

  const parsedStart = Number.parseInt(el.getAttribute('start') || '1', 10);
  const start = Number.isFinite(parsedStart) ? parsedStart : 1;

  return items.map((item, index) => {
    const startAttribute = tag === 'ol' ? ` start="${start + index}"` : '';
    return {
      html: `<${tag}${startAttribute}>${item.outerHTML}</${tag}>`,
      gapBefore: RICH_TEXT_LIST_ITEM_GAP,
    };
  });
}

function hasBlockChildren(el: HTMLElement) {
  return Array.from(el.children).some((child) => ['div', 'p', 'ul', 'ol'].includes(child.tagName.toLowerCase()));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
