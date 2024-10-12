"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import { CVWithRelations } from "@/lib/types";
import { Copy, PlusCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useState } from "react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export function ExperienceSection({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
}) {
  const [openExperience, setOpenExperience] = useState<string | null>(null);

  const handleExperienceChange = (
    index: number,
    field: string,
    value: string | string[] | [string, string] | boolean
  ) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newExperience = [...prevCV.experiences];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prevCV, experiences: newExperience };
    });
  };

  const addExperience = () => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        experiences: [
          ...prevCV.experiences,
          {
            id: 0,
            cvId: 0,
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            order: 0,
          },
        ],
      };
    });
  };

  const duplicateExperience = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const experienceToDuplicate = prevCV.experiences[index];
      const newExperience = {
        ...experienceToDuplicate,
        order: 0,
        id: 0,
      };
      return {
        ...prevCV,
        experiences: [
          ...prevCV.experiences.slice(0, index + 1),
          newExperience,
          ...prevCV.experiences.slice(index + 1),
        ],
      };
    });
  };

  const removeExperience = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        experiences: prevCV.experiences.filter((_, i) => i !== index),
      };
    });
  };

  const simpleMDEOptions = useSimpleMDEOptions();

  const formatDateRange = (
    startDate: string,
    endDate: string | null,
    current: boolean
  ) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    const end = current
      ? "Present"
      : endDate
      ? new Date(endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "";
    return `${start} - ${end}`;
  };

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        value={openExperience ?? ""}
        onValueChange={setOpenExperience}
      >
        {cv.experiences
          .sort((a, b) => a.order - b.order)
          .map((exp, index) => (
            <AccordionItem
              className="border-muted-foreground"
              key={index}
              value={index.toString()}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex text-left justify-between items-center w-full">
                  <div className="text-left">
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {exp.company} | {exp.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  <Input
                    value={exp.title}
                    onChange={(e) =>
                      handleExperienceChange(index, "title", e.target.value)
                    }
                    placeholder="Title"
                  />
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(index, "company", e.target.value)
                    }
                    placeholder="Company"
                  />
                  <Input
                    value={exp.location}
                    onChange={(e) =>
                      handleExperienceChange(index, "location", e.target.value)
                    }
                    placeholder="Location"
                  />
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                      <Input
                        type="date"
                        id={`exp-start-${index}`}
                        value={exp.startDate}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          id={`exp-end-${index}`}
                          value={exp.endDate || ""}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                          disabled={exp.current}
                          className="flex-grow"
                        />
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          <Checkbox
                            id={`exp-current-${index}`}
                            checked={exp.current}
                            onCheckedChange={(checked) =>
                              handleExperienceChange(index, "current", checked)
                            }
                          />
                          <Label htmlFor={`exp-current-${index}`}>
                            Current
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SimpleMDE
                    value={exp.description}
                    onChange={(value) =>
                      handleExperienceChange(index, "description", value)
                    }
                    options={simpleMDEOptions}
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => duplicateExperience(index)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
      <Button variant="secondary" onClick={addExperience} className="mt-2">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
}
