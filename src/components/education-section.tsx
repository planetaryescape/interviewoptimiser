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
import { CVWithRelations } from "@/lib/types";
import { Copy, PlusCircle, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export function EducationSection({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
}) {
  const [openEducation, setOpenEducation] = useState<string | null>(null);

  const handleEducationChange = (
    index: number,
    field: string,
    value: string | [string, string] | boolean
  ) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newEducation = [...prevCV.educations];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prevCV, educations: newEducation };
    });
  };

  const addEducation = () => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        educations: [
          ...prevCV.educations,
          {
            degree: "",
            school: "",
            location: "",
            startDate: "",
            current: false,
            endDate: "",
            order: 0,
            id: 0,
            cvId: 0,
          },
        ],
      };
    });
  };

  const duplicateEducation = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const educationToDuplicate = prevCV.educations[index];
      const newEducation = {
        ...educationToDuplicate,
        id: 0,
        order: 0,
      };
      return {
        ...prevCV,
        educations: [
          ...prevCV.educations.slice(0, index + 1),
          newEducation,
          ...prevCV.educations.slice(index + 1),
        ],
      };
    });
  };

  const removeEducation = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        educations: prevCV.educations.filter((_, i) => i !== index),
      };
    });
  };

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
        value={openEducation ?? ""}
        onValueChange={setOpenEducation}
      >
        {cv.educations.map((edu, index) => (
          <AccordionItem
            className="border-muted-foreground"
            key={index}
            value={index.toString()}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <div className="font-semibold">{edu.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.school} | {edu.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 mt-2">
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(index, "degree", e.target.value)
                  }
                  placeholder="Degree"
                />
                <Input
                  value={edu.school}
                  onChange={(e) =>
                    handleEducationChange(index, "school", e.target.value)
                  }
                  placeholder="School"
                />
                <Input
                  value={edu.location}
                  onChange={(e) =>
                    handleEducationChange(index, "location", e.target.value)
                  }
                  placeholder="Location"
                />
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                    <Input
                      type="date"
                      id={`edu-start-${index}`}
                      value={edu.startDate}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        id={`edu-end-${index}`}
                        value={edu.endDate || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                        disabled={edu.current}
                        className="flex-grow"
                      />
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Checkbox
                          id={`edu-current-${index}`}
                          checked={edu.current}
                          onCheckedChange={(checked) =>
                            handleEducationChange(index, "current", checked)
                          }
                        />
                        <Label htmlFor={`edu-current-${index}`}>Current</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => duplicateEducation(index)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(index)}
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
      <Button variant="secondary" onClick={addEducation} className="mt-2">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
