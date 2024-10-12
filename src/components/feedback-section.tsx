"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

export function FeedbackSection({
  feedbackItems,
  setFeedbackItems,
}: {
  feedbackItems: { id: number; content: string; completed: boolean }[];
  setFeedbackItems: Dispatch<
    SetStateAction<{ id: number; content: string; completed: boolean }[]>
  >;
}) {
  const handleFeedbackToggle = (id: number) => {
    setFeedbackItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="p-4 bg-card text-card-foreground rounded-md border border-gray-300 dark:border-gray-600">
      <h3 className="text-xl font-bold mb-2">Feedback</h3>
      <div className="space-y-4">
        {feedbackItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={`feedback-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => handleFeedbackToggle(item.id)}
            />
            <Label
              htmlFor={`feedback-${item.id}`}
              className={cn("leading-5", item.completed ? "line-through" : "")}
            >
              {item.content}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
