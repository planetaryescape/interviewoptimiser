import { SectionsOrder } from "@/db/schema";
import { CVWithRelations } from "@/lib/types";
import { formatDateRange } from "@/lib/utils/formatDateRange";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkMarkdownComponents } from "../remark-markdown-components";

interface CVPageContentProps {
  cv: CVWithRelations;
  sectionOrder: { section: keyof SectionsOrder; order: number }[];
  bodyFont: string;
  headingFont: string;
}

export function PolishedLayout({
  cv,
  sectionOrder,
  bodyFont,
  headingFont,
}: CVPageContentProps) {
  return (
    <div className={bodyFont}>
      <h1 className={`text-4xl font-bold mb-1 ${headingFont}`}>{cv.name}</h1>
      <h2 className={`text-xl text-gray-500 mb-4 ${headingFont}`}>
        {cv.title}
      </h2>
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {cv.location}
        </div>
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-1" />
          <Link className="hover:underline" href={`mailto:${cv.email}`}>
            {cv.email}
          </Link>
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-1" />
          <Link className="hover:underline" href={`tel:${cv.phone}`}>
            {cv.phone}
          </Link>
        </div>
      </div>
      {sectionOrder.map(({ section, order }) => {
        return (
          <div key={order} className="mb-6">
            {section === "summary" && (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${headingFont}`}>
                  Summary
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                >
                  {cv.summary}
                </ReactMarkdown>
              </>
            )}
            {section === "experiences" && cv.experiences.length > 0 && (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${headingFont}`}>
                  Work Experience
                </h3>
                {cv.experiences.map((exp) => (
                  <div key={exp.id} className="mb-4">
                    <h3 className={`font-semibold ${headingFont}`}>
                      {exp.title}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {exp.company} | {exp.location} | {formatDateRange(exp)}
                    </div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={remarkMarkdownComponents}
                    >
                      {exp.description}
                    </ReactMarkdown>
                  </div>
                ))}
              </>
            )}
            {section === "educations" && cv.educations.length > 0 && (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${headingFont}`}>
                  Education
                </h3>
                {cv.educations.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <h3 className={`font-semibold ${headingFont}`}>
                      {edu.degree}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {edu.school} | {edu.location} | {formatDateRange(edu)}
                    </div>
                  </div>
                ))}
              </>
            )}
            {section === "skills" && cv.skills.length > 0 && (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${headingFont}`}>
                  Skills
                </h3>
                <p>{cv.skills.map((skill) => skill.skill).join(", ")}</p>
              </>
            )}
            {section === "links" && cv.links.length > 0 && (
              <>
                {cv.links.map((link) => (
                  <div key={link.id} className="flex gap-2 items-center">
                    <span className="font-semibold">{link.name}:</span>
                    <a href={link.url} className="text-primary hover:underline">
                      {link.url}
                    </a>
                  </div>
                ))}
              </>
            )}
            {section === "customSections" && cv.customSections.length > 0 && (
              <>
                {cv.customSections.map((customSection) => (
                  <div key={customSection.id} className="mb-2">
                    <h3 className={`text-lg font-semibold mb-2 ${headingFont}`}>
                      {customSection.title}
                    </h3>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={remarkMarkdownComponents}
                    >
                      {customSection.content}
                    </ReactMarkdown>
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
