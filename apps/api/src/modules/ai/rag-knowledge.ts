import type { RagChunkInput } from './rag.service';

export const DEFAULT_KNOWLEDGE_CHUNKS: RagChunkInput[] = [
  {
    source: 'builtin-career-knowledge',
    title: 'ATS 关键词匹配原则',
    category: 'ats',
    tags: ['ATS', 'keyword', 'JD', 'resume'],
    content:
      'ATS 匹配通常关注岗位 JD 中的硬技能、工具链、业务领域、经验年限和职责关键词。简历优化时应优先补充真实做过的技术关键词，并把关键词放到专业技能、项目经历和工作经历的上下文中，避免无上下文堆砌。',
  },
  {
    source: 'builtin-career-knowledge',
    title: 'STAR 法则优化项目经历',
    category: 'resume_optimization',
    tags: ['STAR', 'experience', 'project', 'impact'],
    content:
      '项目经历建议按 STAR 法则组织：Situation 说明背景，Task 说明目标，Action 说明你采取的具体行动，Result 说明结果。结果最好量化，例如性能提升、响应时间下降、转化率提升、包体减少、错误率下降或效率提升。',
  },
  {
    source: 'builtin-career-knowledge',
    title: '前端实习简历项目表达',
    category: 'resume_optimization',
    tags: ['frontend', 'internship', 'React', 'TypeScript'],
    content:
      '前端实习简历的项目表达应突出组件化、状态管理、路由、表格表单、请求封装、性能优化和工程化。描述时不要只写使用技术栈，要写清楚负责模块、解决的问题、技术取舍和可验证结果。',
  },
  {
    source: 'builtin-career-knowledge',
    title: '中文互联网技术面常见深挖方向',
    category: 'interview',
    tags: ['interview', 'frontend', 'backend', 'deep-dive'],
    content:
      '中文互联网技术面常围绕简历项目深挖：为什么选这个技术、状态怎么管理、接口怎么设计、异常怎么处理、性能瓶颈在哪里、权限怎么做、有没有数据一致性问题、如果用户量扩大怎么优化。',
  },
  {
    source: 'builtin-career-knowledge',
    title: 'AI 应用面试追问方向',
    category: 'interview',
    tags: ['AI', 'RAG', 'Prompt', 'LLM'],
    content:
      'AI 应用项目常被追问 Prompt 如何设计、如何保证结构化输出、如何减少幻觉、如何控制 token 成本、如何做调用监控、RAG 检索如何评估、模型失败如何降级和重试。',
  },
  {
    source: 'builtin-career-knowledge',
    title: 'RAG 混合检索设计',
    category: 'rag',
    tags: ['RAG', 'Embedding', 'Keyword Retrieval', 'Hybrid Search'],
    content:
      'RAG 混合检索可以结合向量语义相似度和关键词命中率。向量检索适合召回语义相关内容，关键词检索适合技术名词和岗位关键词精确匹配。最终可以按 weighted score 排序，并将 topK 片段注入 Prompt。',
  },
  {
    source: 'builtin-career-knowledge',
    title: '简历优化不要编造经历',
    category: 'safety',
    tags: ['resume', 'truthfulness', 'risk'],
    content:
      'AI 简历优化必须保留用户真实经历，不能编造公司、项目、指标或技能。对于缺失的量化数据，应提示用户补充真实数据，而不是直接生成虚假数字。',
  },
  {
    source: 'builtin-career-knowledge',
    title: 'ATS 输出结构建议',
    category: 'ats',
    tags: ['Structured Output', 'ATS', 'JSON'],
    content:
      'ATS 分析建议输出结构包括 atsScore、matchLevel、matchedKeywords、missingKeywords、recommendations、formatIssues。每条建议应说明对应的简历位置、问题原因和可执行修改方向。',
  },
];
