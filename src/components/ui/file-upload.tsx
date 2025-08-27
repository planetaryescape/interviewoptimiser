import { cn } from "@/lib/utils";
import { IconUpload } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react"; // Add X icon import
import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  accept,
  label,
  description,
  files,
  loading = false,
}: {
  onChange?: (files: File[]) => void;
  accept?: string;
  label?: string;
  description?: string;
  files: File[];
  loading?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    onChange?.(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newFiles = files.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (_error) => {
      toast.error("Please upload a valid file.");
    },
  });

  useEffect(() => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [files]);

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            {label || "Upload file"}
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            {description || "Drag or drop your files here or click to upload"}
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={`file-${file.name}-${file.size}`}
                  layoutId={idx === 0 ? "file-upload" : `file-upload-${file.name}`}
                  className={cn(
                    "relative flex items-center justify-between w-full p-4 mb-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800",
                    "hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <IconUpload className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <motion.p
                        layout="position"
                        className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {file.name}
                      </motion.p>
                      <motion.p layout="position" className="text-xs text-neutral-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, idx)}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <X className="h-4 w-4 text-neutral-500" />
                  </button>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 text-neutral-600 dark:text-neutral-300 animate-spin" />
                ) : isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: rows * columns }, (_, i) => {
          const row = Math.floor(i / columns);
          const col = i % columns;
          return (
            <div
              key={`grid-cell-${row}-${col}`}
              className={cn(
                "w-10 h-10 flex flex-shrink-0 rounded-[2px]",
                i % 2 === 0
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "bg-neutral-50 dark:bg-neutral-900"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
