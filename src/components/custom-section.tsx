"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimpleMDEOptions } from "@/config/simplemde-options";
import { CVWithRelations } from "@/lib/types";
import "easymde/dist/easymde.min.css";
import { PlusCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export function CustomSectionComponent({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
  section: string;
}) {
  const handleCustomSectionChange = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newCustomSections = [...prevCV.customSections];
      newCustomSections[index] = {
        ...newCustomSections[index],
        [field]: value,
      };
      return { ...prevCV, customSections: newCustomSections };
    });
  };

  const addCustomSection = () => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        customSections: [
          ...prevCV.customSections,
          {
            id: 0,
            title: "",
            cvId: 0,
            order: 0,
            content: "",
          },
        ],
      };
    });
  };

  const removeCustomSection = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        customSections: prevCV.customSections.filter((_, i) => i !== index),
      };
    });
  };

  const simpleMDEOptions = useSimpleMDEOptions();

  return (
    <div className="space-y-4">
      {cv.customSections.map((customSection, index) => (
        <div key={index} className="space-y-4">
          <Input
            value={customSection.title}
            onChange={(e) =>
              handleCustomSectionChange(index, "title", e.target.value)
            }
            placeholder="Section Title"
            className="mb-2"
          />
          <SimpleMDE
            value={customSection.content}
            onChange={(value) =>
              handleCustomSectionChange(index, "content", value)
            }
            options={simpleMDEOptions}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeCustomSection(index)}
            className="mt-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Section
          </Button>
        </div>
      ))}

      <Button variant="secondary" onClick={addCustomSection} className="mt-4">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Custom Section
      </Button>
    </div>
  );
}
