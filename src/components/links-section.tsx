import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CVWithRelations } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function LinksSection({
  cv,
  setCV,
}: {
  cv: CVWithRelations;
  setCV: Dispatch<SetStateAction<CVWithRelations | null>>;
}) {
  const handleLinkChange = (
    index: number,
    field: "name" | "url",
    value: string
  ) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      const newLinks = [...prevCV.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prevCV, links: newLinks };
    });
  };

  const addLink = () => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        links: [
          ...prevCV.links,
          {
            id: 0,
            cvId: prevCV.id,
            name: "",
            url: "",
            order: prevCV.links.length,
          },
        ],
      };
    });
  };

  const removeLink = (index: number) => {
    setCV((prevCV) => {
      if (!prevCV) return null;
      return {
        ...prevCV,
        links: prevCV.links.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="space-y-4">
      {cv.links.map((link, index) => (
        <div key={link.id || index} className="flex items-center gap-2">
          <Input
            value={link.name}
            onChange={(e) => handleLinkChange(index, "name", e.target.value)}
            placeholder="Link Name"
            className="flex-1"
          />
          <Input
            value={link.url}
            onChange={(e) => handleLinkChange(index, "url", e.target.value)}
            placeholder="URL"
            className="flex-1"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeLink(index)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove link</span>
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={addLink} className="mt-2">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Link
      </Button>
    </div>
  );
}
