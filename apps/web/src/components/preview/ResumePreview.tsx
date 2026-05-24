import { useResumeStore } from '../../stores/resume-store';
import { MapPin, Phone, Mail, Linkedin, Github, Globe } from 'lucide-react';

export function ResumePreview() {
  const { resume } = useResumeStore();

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No resume data
      </div>
    );
  }

  const themeColor = resume.themeColor || '#6366f1';

  return (
    <div className="max-w-[800px] mx-auto bg-white text-gray-900 font-sans shadow-sm">
      {/* Header */}
      <header
        className="px-10 py-8 text-white"
        style={{ backgroundColor: themeColor }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {resume.firstName || 'First'} {resume.lastName || 'Last'}
        </h1>
        {resume.jobTitle && (
          <p className="text-lg mt-1 opacity-90">{resume.jobTitle}</p>
        )}

        {/* Contact Row */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
          {resume.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {resume.address}
            </span>
          )}
          {resume.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {resume.phone}
            </span>
          )}
          {resume.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {resume.email}
            </span>
          )}
          {resume.linkedIn && (
            <span className="flex items-center gap-1">
              <Linkedin className="h-3.5 w-3.5" /> {resume.linkedIn}
            </span>
          )}
          {resume.github && (
            <span className="flex items-center gap-1">
              <Github className="h-3.5 w-3.5" /> {resume.github}
            </span>
          )}
          {resume.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> {resume.portfolio}
            </span>
          )}
        </div>
      </header>

      <div className="px-10 py-6 space-y-6">
        {/* Summary */}
        {resume.summary && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {resume.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Experience
            </h2>
            <div className="space-y-5">
              {resume.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-sm">{exp.title}</h3>
                    <span className="text-xs text-gray-500">
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{exp.companyName}</p>
                  {exp.workSummary && (
                    <div
                      className="mt-2 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
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
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-sm">{edu.universityName}</h3>
                    <span className="text-xs text-gray-500">
                      {edu.startDate} — {edu.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {edu.degree}{edu.major ? ` · ${edu.major}` : ''}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700"
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  {skill.name}
                  {skill.rating && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <div
                          key={j}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: j < skill.rating! ? themeColor : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Certifications
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {resume.certifications.map((cert: string, i: number) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((lang: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100"
                >
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ATS Score Badge */}
        {resume.atsScore != null && (
          <div
            className="mt-4 p-3 rounded-lg text-xs font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
          >
            ATS Score: {resume.atsScore}/100
          </div>
        )}
      </div>
    </div>
  );
}
