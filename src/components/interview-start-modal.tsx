"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquare, Mic, Pause, Volume2, XCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

type InterviewStartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  isLoading: boolean;
  duration?: number;
  availableMinutes?: number;
};

type PermissionStatus = "granted" | "denied" | "prompt";
type PermissionError =
  | null
  | "denied"
  | "not_secure"
  | "system_denied"
  | "not_supported"
  | "unknown";

export const InterviewStartModal = React.memo(function InterviewStartModal({
  isOpen,
  onClose,
  onStart,
  isLoading,
  duration,
  availableMinutes,
}: InterviewStartModalProps) {
  const [micPermission, setMicPermission] = useState<PermissionStatus>("prompt");
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<PermissionError>(null);

  const isSecureContext = useCallback(() => {
    return window.isSecureContext;
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      // Reset any previous errors
      setPermissionError(null);

      // Check if browser supports permissions API
      if (!navigator.permissions || !navigator.permissions.query) {
        // Fall back to checking if we're in a secure context
        if (!isSecureContext()) {
          setPermissionError("not_secure");
          setMicPermission("denied");
          return;
        }

        // If permissions API isn't available but context is secure,
        // we'll have to try requesting directly
        return;
      }

      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setMicPermission(permissionStatus.state);

      permissionStatus.addEventListener("change", () => {
        setMicPermission(permissionStatus.state);
        if (permissionStatus.state === "granted") {
          setPermissionError(null);
        } else if (permissionStatus.state === "denied") {
          setPermissionError("denied");
        }
      });
    } catch (_error) {
      if (!isSecureContext()) {
        setPermissionError("not_secure");
      } else {
        setPermissionError("unknown");
      }
    }
  }, [isSecureContext]);

  const requestMicrophonePermission = useCallback(async () => {
    setIsCheckingPermission(true);
    try {
      // Check if the MediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError("not_supported");
        setMicPermission("denied");
        return;
      }

      // Check if in secure context
      if (!isSecureContext()) {
        setPermissionError("not_secure");
        setMicPermission("denied");
        return;
      }

      // Attempt to get media stream
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // If successful, update permission state
      setMicPermission("granted");
      setPermissionError(null);
      await checkMicrophonePermission();
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          if (error.message.includes("Permission denied by system")) {
            setPermissionError("system_denied");
          } else {
            setPermissionError("denied");
          }
        } else if (error.name === "NotFoundError") {
          setPermissionError("not_supported");
        } else if (error.name === "NotReadableError") {
          setPermissionError("system_denied");
        } else {
          setPermissionError("unknown");
        }
      } else {
        setPermissionError("unknown");
      }

      setMicPermission("denied");
    } finally {
      setIsCheckingPermission(false);
    }
  }, [checkMicrophonePermission, isSecureContext]);

  useEffect(() => {
    if (isOpen) {
      checkMicrophonePermission();
    }
  }, [isOpen, checkMicrophonePermission]);

  const guidelines = [
    {
      icon: Volume2,
      title: "Quiet Environment",
      description: "Ensure you're in a quiet space to avoid interference",
    },
    {
      icon: Mic,
      title: "Natural Speech",
      description: "Speak naturally as you would in a real interview",
    },
    {
      icon: Pause,
      title: "Manage Pauses",
      description: "The interviewer may prompt you after long pauses",
    },
    {
      icon: MessageSquare,
      title: "Feel Free to Interrupt",
      description: "You can politely interrupt if needed - just like a real conversation",
    },
  ];

  const getPermissionErrorMessage = () => {
    switch (permissionError) {
      case "denied":
        return "You've denied microphone access. Please reset permissions in your browser settings and try again.";
      case "not_secure":
        return "Microphone access requires a secure (HTTPS) connection. Please use a secure connection to continue.";
      case "system_denied":
        return "Your system has blocked microphone access. Please check your system settings.";
      case "not_supported":
        return "Your browser doesn't support microphone access. Please try a different browser.";
      case "unknown":
        return "An unknown error occurred when requesting microphone access. Please try again or use a different browser.";
      default:
        return "Microphone access is required for the interview";
    }
  };

  const hasEnoughMinutes = duration && availableMinutes ? availableMinutes >= duration : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Before you begin your interview</DialogTitle>
        <DialogDescription>
          Please review these guidelines to ensure the best interview experience.
        </DialogDescription>

        <div className="relative overflow-hidden rounded-lg p-6">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background animate-gradient" />

          <div className="relative z-10">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {guidelines.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-start space-x-3">
                    <item.icon className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Microphone Permission Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-4 mb-6 rounded-lg border ${
                micPermission === "granted"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {micPermission === "granted" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-medium">Microphone Permission</h3>
                    <p className="text-sm text-muted-foreground">
                      {micPermission === "granted"
                        ? "Microphone access is enabled"
                        : getPermissionErrorMessage()}
                    </p>
                    {permissionError === "denied" && (
                      <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                        Tip: Look for the camera/microphone icon in your browser's address bar to
                        manage permissions
                      </p>
                    )}
                  </div>
                </div>
                {micPermission !== "granted" && (
                  <Button
                    size="sm"
                    onClick={requestMicrophonePermission}
                    disabled={isCheckingPermission}
                    className="relative"
                  >
                    <span className="relative flex items-center gap-2">
                      Request Access
                      {isCheckingPermission && <Loader2 className="w-4 h-4 animate-spin" />}
                    </span>
                  </Button>
                )}
              </div>
            </motion.div>

            {duration && duration > 0 && (
              <div
                className={`text-sm text-center mb-4 p-3 rounded-md border ${
                  hasEnoughMinutes
                    ? "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"
                    : "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                }`}
              >
                <p>
                  This interview session will use approximately{" "}
                  <strong>
                    {duration} minute{duration === 1 ? "" : "s"}
                  </strong>{" "}
                  from your account.
                </p>
                {!hasEnoughMinutes && (
                  <p className="mt-2 font-medium">
                    You only have {availableMinutes} minute
                    {availableMinutes === 1 ? "" : "s"} available. Please top up your account to
                    continue.
                    <Link href="/pricing" className="block mt-2">
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Buy Minutes
                      </Button>
                    </Link>
                  </p>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground text-center mb-6">
              By starting the interview, you agree to the collection and processing of your data as
              outlined in our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </div>

            <div className="flex justify-end space-x-3">
              <Button disabled={isLoading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={isLoading || micPermission !== "granted" || !hasEnoughMinutes}
                onClick={onStart}
                className="relative group"
              >
                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-30 blur-md transition-all rounded-lg" />
                <span className="relative flex items-center gap-2">
                  Begin Interview
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
