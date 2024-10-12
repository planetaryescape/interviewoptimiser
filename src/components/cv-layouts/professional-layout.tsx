import { CVWithRelations } from "@/lib/types";
import { formatDateRange } from "@/lib/utils/formatDateRange";
import { Mail, MapPin, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkMarkdownComponents } from "../remark-markdown-components";

interface CVPageContentProps {
  cv: CVWithRelations;
  bodyFont: string;
  headingFont: string;
}

export function ProfessionalLayout({
  cv,
  bodyFont,
  headingFont,
}: CVPageContentProps) {
  return (
    <div className={`max-w-4xl bg-white mx-auto ${bodyFont}`}>
      <header className="mb-8 pb-4 border-b border-gray-300">
        <h1
          className={`text-4xl font-extrabold tracking-wider mb-1 ${headingFont}`}
        >
          {cv.name.toUpperCase()}
        </h1>
        <h2
          className={`text-base font-normal tracking-[0.2em] uppercase ${headingFont}`}
        >
          {cv.title}
        </h2>
      </header>

      <div className="grid grid-cols-3">
        <div className="col-span-1 space-y-6 border-r border-gray-300 pr-8">
          <section>
            <h3
              className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
            >
              Contacts
            </h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>{cv.location}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{cv.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{cv.phone}</span>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-300 pt-6">
            <section>
              <h3
                className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
              >
                About Me
              </h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={remarkMarkdownComponents}
              >
                {cv.summary}
              </ReactMarkdown>
            </section>
          </div>

          <div className="border-t border-gray-300 pt-6">
            <section>
              <h3
                className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
              >
                Education
              </h3>
              {cv.educations.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h4 className="font-semibold uppercase">{edu.degree}</h4>
                  <p>
                    {edu.school}, {edu.location}
                  </p>
                  <p className="text-gray-600">
                    {formatDateRange({
                      startDate: edu.startDate,
                      endDate: edu.endDate ?? "",
                      current: edu.current,
                    })}
                  </p>
                </div>
              ))}
            </section>
          </div>

          <div className="border-t border-gray-300 pt-6">
            <section>
              <h3
                className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
              >
                Links
              </h3>
              <div className="space-y-2">
                {cv.links.map((link) => (
                  <div key={link.id} className="flex items-center">
                    <a href={link.url} className="underline text-primary">
                      {link.name}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-gray-300 pt-6 mt-6">
              <section>
                <h3
                  className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
                >
                  Skills
                </h3>
                <div className="space-y-2">
                  {cv.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center">
                      <span>{skill.skill}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6 pl-8">
          <section>
            <h3
              className={`text-base font-semibold mb-4 uppercase ${headingFont}`}
            >
              Work Experience
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-300">
              {cv.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="pl-8 relative before:absolute before:left-0 before:top-[7px] before:w-[15px] before:h-[15px] before:bg-white before:border-2 before:border-gray-300 before:rounded-full"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4
                        className={`font-semibold uppercase leading-tight ${headingFont}`}
                      >
                        {exp.title}
                      </h4>
                      <p className="text-gray-600">
                        {exp.company}, {exp.location}
                      </p>
                    </div>
                    <p className="text-gray-600">
                      {formatDateRange({
                        startDate: exp.startDate,
                        endDate: exp.endDate ?? "",
                        current: exp.current,
                      })}
                    </p>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                  >
                    {exp.description}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          <div className="">
            {cv.customSections.map((section) => (
              <div
                key={section.id}
                className="border-t border-gray-300 pt-6 pb-6"
              >
                <section>
                  <h3
                    className={`text-base font-semibold mb-3 uppercase ${headingFont}`}
                  >
                    {section.title}
                  </h3>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                  >
                    {section.content}
                  </ReactMarkdown>
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
