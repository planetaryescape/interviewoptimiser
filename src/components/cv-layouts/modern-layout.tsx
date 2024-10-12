import { CVWithRelations } from "@/lib/types";
import { formatDateRange } from "@/lib/utils/formatDateRange";
import { Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useFeatureFlagEnabled } from "posthog-js/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkMarkdownComponents } from "../remark-markdown-components";

interface CVPageContentProps {
  cv: CVWithRelations;
  bodyFont: string;
  headingFont: string;
}

export function ModernLayout({
  cv,
  bodyFont,
  headingFont,
}: CVPageContentProps) {
  const imageOnCVFeatureFlagEnabled = useFeatureFlagEnabled("image-on-cv");
  return (
    <div className={`max-w-4xl mx-auto bg-white ${bodyFont}`}>
      <header className="bg-gray-900 text-white p-8">
        <div className="text-center mb-4">
          <h1 className={`text-4xl font-bold ${headingFont}`}>{cv.name}</h1>
          <div className="h-px bg-yellow-500 w-1/2 mx-auto my-2"></div>
          <h2 className={`text-xl uppercase tracking-wide ${headingFont}`}>
            {cv.title}
          </h2>
        </div>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{cv.location}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span>{cv.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span>{cv.email}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_3fr]">
        <div className="col-span-1 bg-gray-100 p-8">
          <div className="mb-8">
            {imageOnCVFeatureFlagEnabled && (
              <Image
                src="/logo.png"
                alt="Profile"
                className="rounded-full w-48 h-48 mx-auto mb-4"
                width={192}
                height={192}
              />
            )}
            <h3 className={`text-xl font-bold mb-2 ${headingFont}`}>
              ABOUT ME
            </h3>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
            >
              {cv.summary}
            </ReactMarkdown>
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-2 ${headingFont}`}>
              EDUCATION
            </h3>
            {cv.educations.map((edu) => (
              <div key={edu.id} className="mb-2">
                <h4 className={`font-bold text-sm ${headingFont}`}>
                  {edu.degree}
                </h4>
                <p className="text-sm">{edu.school}</p>
                <p className="text-sm">
                  {formatDateRange({
                    startDate: edu.startDate,
                    endDate: edu.endDate ?? "",
                    current: edu.current,
                  })}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-2 ${headingFont}`}>LINKS</h3>
            {cv.links.map((link) => (
              <div key={link.id} className="flex items-center mb-2">
                {link.name === "LinkedIn" ? (
                  <Linkedin className="w-4 h-4 mr-2" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                <a
                  href={link.url}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {link.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 p-8">
          <section className="mb-8">
            <h3
              className={`text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2 ${headingFont}`}
            >
              WORK EXPERIENCE
            </h3>
            {cv.experiences.map((job) => (
              <div key={job.id} className="mb-6 relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="absolute left-0 top-2 w-2 h-2 bg-gray-500 rounded-full -ml-1"></div>
                <h4 className={`font-bold ${headingFont}`}>{job.title}</h4>
                <p className="text-sm text-gray-600">
                  {job.company} | {job.location}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateRange({
                    startDate: job.startDate,
                    endDate: job.endDate ?? "",
                    current: job.current,
                  })}
                </p>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                >
                  {job.description}
                </ReactMarkdown>
              </div>
            ))}
          </section>

          <section>
            {cv.customSections.map((section) => (
              <div key={section.id} className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${headingFont}`}>
                  {section.title}
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            ))}
          </section>

          <section>
            <h3
              className={`text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2 ${headingFont}`}
            >
              SKILLS
            </h3>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill.skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
