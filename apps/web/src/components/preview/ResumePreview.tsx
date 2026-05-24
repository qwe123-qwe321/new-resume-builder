import { useResumeStore } from '../../stores/resume-store';
import { MapPin, Phone, Mail, Linkedin, Github, Globe, Award, Languages } from 'lucide-react';

export function ResumePreview() {
  const { resume } = useResumeStore();

  if (!resume) {
    return (
      <div className="a4-paper flex items-center justify-center">
        <p className="text-gray-400">No resume data</p>
      </div>
    );
  }

  const themeColor = resume.themeColor || '#6366F1';

  return (
    <div className="a4-paper text-gray-900 font-sans overflow-hidden">
      {/* Header Section */}
      <header
        className="px-8 py-6"
        style={{ backgroundColor: themeColor }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {resume.firstName || 'Your'} {resume.lastName || 'Name'}
        </h1>
        {resume.jobTitle && (
          <p className="text-base mt-1 text-white/90 font-medium">{resume.jobTitle}</p>
        )}

        {/* Contact Info Grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-white/80">
          {resume.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {resume.email}
            </span>
          )}
          {resume.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> {resume.phone}
            </span>
          )}
          {resume.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {resume.address}
            </span>
          )}
          {resume.linkedIn && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="h-3 w-3" /> {resume.linkedIn}
            </span>
          )}
          {resume.github && (
            <span className="flex items-center gap-1.5">
              <Github className="h-3 w-3" /> {resume.github}
            </span>
          )}
          {resume.portfolio && (
            <span className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" /> {resume.portfolio}
            </span>
          )}
        </div>
      </header>

      <div className="px-8 py-6 space-y-5">
        {/* Professional Summary */}
        {resume.summary && (
          <section>
            <SectionHeader title="Professional Summary" color={themeColor} />
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">
              {resume.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <SectionHeader title="Work Experience" color={themeColor} />
            <div className="space-y-4 mt-3">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                  <div 
                    className="absolute left-[-5px] top-1 h-2 w-2 rounded-full" 
                    style={{ backgroundColor: themeColor }}
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">{exp.title}</h3>
                      <p className="text-xs text-gray-600 font-medium">{exp.companyName}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0 ml-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  {exp.city && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {exp.city}{exp.state ? `, ${exp.state}` : ''}
                    </p>
                  )}
                  {exp.workSummary && (
                    <div
                      className="mt-2 text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none
                        prose-li:my-0.5 prose-ul:my-1 prose-p:my-1"
                      dangerouslySetInnerHTML={{ __html: exp.workSummary }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <section>
            <SectionHeader title="Education" color={themeColor} />
            <div className="space-y-3 mt-3">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{edu.universityName}</h3>
                    <p className="text-xs text-gray-600">
                      {edu.degree}{edu.major ? ` in ${edu.major}` : ''}
                    </p>
                    {edu.description && (
                      <p className="text-xs text-gray-500 mt-1">{edu.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0 ml-2">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <section>
            <SectionHeader title="Skills" color={themeColor} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {resume.skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200"
                  style={{ backgroundColor: `${themeColor}08` }}
                >
                  {skill.name}
                  {skill.rating && (
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <span
                          key={j}
                          className="h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: j < skill.rating! ? themeColor : '#E5E7EB',
                          }}
                        />
                      ))}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Two Column Layout for Certifications and Languages */}
        {((resume.certifications && resume.certifications.length > 0) || 
          (resume.languages && resume.languages.length > 0)) && (
          <div className="grid grid-cols-2 gap-6">
            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <section>
                <SectionHeader title="Certifications" color={themeColor} icon={Award} />
                <ul className="mt-2 space-y-1">
                  {resume.certifications.map((cert: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <span 
                        className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5" 
                        style={{ backgroundColor: themeColor }}
                      />
                      {cert}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.length > 0 && (
              <section>
                <SectionHeader title="Languages" color={themeColor} icon={Languages} />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {resume.languages.map((lang: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-medium text-gray-600 bg-gray-100"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ATS Score Badge - if available */}
      {resume.atsScore != null && (
        <div className="px-8 pb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ 
              backgroundColor: `${themeColor}10`, 
              color: themeColor,
              border: `1px solid ${themeColor}30`
            }}
          >
            <span className="font-bold">ATS Score:</span>
            <span>{resume.atsScore}/100</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Header Component
function SectionHeader({ 
  title, 
  color, 
  icon: Icon 
}: { 
  title: string; 
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5" style={{ color }} />}
      <h2
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
