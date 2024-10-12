import {
  CoverLetter,
  CustomSection,
  CV,
  Education,
  Experience,
  Feedback,
  Link,
  Optimization,
  PageSettings,
  SectionsOrder,
  Skill,
} from "@/db/schema";

export type CVWithRelations = CV & {
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  links: Link[];
  customSections: CustomSection[];
  pageSettings: PageSettings;
  optimization: Optimization & {
    sectionsOrder: SectionsOrder;
    feedback: Feedback[];
    coverLetter: CoverLetter;
  };
};
