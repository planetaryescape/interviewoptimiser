"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CVWithRelations } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function SkillsSection({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
}) {
  const addSkill = () => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        skills: [
          ...prevCV.skills,
          {
            id: 0,
            cvId: 0,
            order: 0,
            skill: "",
          },
        ],
      };
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newSkills = [...prevCV.skills];
      newSkills[index] = {
        id: 0,
        cvId: 0,
        order: 0,
        skill: value,
      };
      return { ...prevCV, skills: newSkills };
    });
  };

  const removeSkill = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        skills: prevCV.skills.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="space-y-4">
      {cv.skills.map((skill, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            value={skill.skill}
            onChange={(e) => handleSkillChange(index, e.target.value)}
            placeholder="Skill"
          />
          <Button
            variant="destructive"
            size="icon"
            className="m-0"
            onClick={() => removeSkill(index)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove skill</span>
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addSkill} className="mt-2">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Skill
      </Button>
    </div>
  );
}
