import { CVWithRelations } from "@/lib/types";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkMarkdownComponents } from "../remark-markdown-components";

interface CVPageContentProps {
  cv: CVWithRelations;
  bodyFont: string;
  headingFont: string;
}

export function ClassicLayout({
  cv,
  bodyFont,
  headingFont,
}: CVPageContentProps) {
  console.log("cv:", cv);

  const formatDateRange = (dateRange: [string, string]) => {
    const [start, end] = dateRange;
    const startDate = start
      ? new Date(start).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "";
    const endDate =
      end.trim() !== "" && end.trim() !== "Present"
        ? new Date(end).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })
        : "Present";
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className={bodyFont}>
      <header className="mb-8">
        <h1 className={`text-4xl font-bold mb-1 ${headingFont}`}>{cv.name}</h1>
        <h2 className={`text-xl text-gray-600 mb-4 ${headingFont}`}>
          {cv.title}
        </h2>
        <div className="w-full h-px bg-gray-300 my-4"></div>
      </header>

      <div className="grid grid-cols-[1fr_3fr] gap-8">
        <div className="col-span-1">
          <section className="mb-8">
            <h3 className={`text-lg font-bold mb-2 ${headingFont}`}>
              CONTACTS
            </h3>
            <div className="flex items-center mb-1">
              <MapPin className="w-2 h-2 mr-2" />
              <span className="text-sm">{cv.location}</span>
            </div>
            <div className="flex items-center mb-1">
              <Mail className="w-2 h-2 mr-2" />
              <Link href={`mailto:${cv.email}`} className="text-sm">
                {cv.email}
              </Link>
            </div>
            <div className="flex items-center mb-1">
              <Phone className="w-2 h-2 mr-2" />
              <Link href={`tel:${cv.phone}`} className="text-sm">
                {cv.phone}
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h3 className={`text-lg font-bold mb-2 ${headingFont}`}>
              ABOUT ME
            </h3>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
            >
              {cv.summary}
            </ReactMarkdown>
          </section>

          <section className="mb-8">
            <h3 className={`text-lg font-bold mb-2 ${headingFont}`}>
              EDUCATION
            </h3>
            {cv.educations.map((edu) => (
              <div key={edu.id}>
                <h4 className={`font-bold text-sm ${headingFont}`}>
                  {edu.degree}
                </h4>
                <p className="text-sm">{edu.school}</p>
                <p className="text-sm">
                  {formatDateRange([edu.startDate, edu.endDate ?? ""])}
                </p>
              </div>
            ))}
          </section>

          <section className="mb-8">
            <h3 className={`text-lg font-bold mb-2 ${headingFont}`}>LINKS</h3>
            {cv.links.map((link) => (
              <div key={link.id} className="flex items-center mb-1">
                <Link
                  href={link.url}
                  className="text-sm text-primary underline"
                  target="_blank"
                >
                  {link.name}
                </Link>
              </div>
            ))}
          </section>

          <section>
            <h3 className={`text-lg font-bold mb-4 ${headingFont}`}>SKILLS</h3>
            <ul className="list-disc list-inside">
              {cv.skills.map((skill) => (
                <li key={skill.id} className="text-sm">
                  {skill.skill}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-span-1">
          <section className="mb-8">
            <h3 className={`text-lg font-bold mb-4 ${headingFont}`}>
              WORK EXPERIENCE
            </h3>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
              {cv.experiences.map((job) => (
                <div key={job.id} className="ml-6 mb-6">
                  <div className="absolute left-0 w-2 h-2 bg-gray-300 rounded-full mt-2 -ml-1"></div>
                  <h4 className={`font-bold ${headingFont}`}>{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-600">
                    {formatDateRange([job.startDate, job.endDate ?? ""])}
                  </p>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                  >
                    {job.description}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          <section>
            {cv.customSections.map((section) => (
              <section key={section.id} className="mb-8">
                <h3 className={`text-lg font-bold mb-2 ${headingFont}`}>
                  {section.title}
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                >
                  {section.content}
                </ReactMarkdown>
              </section>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
