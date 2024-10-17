"use client";

import { AudioVisualizer } from "@/components/audio-visualizer";
import { Timer } from "@/components/timer";
import { Button } from "@/components/ui/button";
import { Interview } from "@/db/schema";
import { getRepository } from "@/lib/data/repositoryFactory";
import { cn } from "@/lib/utils";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools";
import { createInterviewInstructions } from "@/utils/conversation_config";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { useQuery } from "@tanstack/react-query";
import { Play, Square, Video, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function InterviewScreen({
  params,
}: {
  params: { id: string };
}) {
  const { data: interview } = useQuery({
    queryKey: ["interview", params.id],
    queryFn: async () => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.getById(params.id);
    },
  });

  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    })
  );

  const [items, setItems] = useState<ItemType[]>([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewDone, setIsInterviewDone] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const totalTime = interview?.data?.duration
    ? interview.data.duration * 60
    : 15 * 60;

  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    if (!client || !wavStreamPlayer) return;

    client.updateSession({
      instructions: createInterviewInstructions(
        interview?.data?.submittedCVText || "",
        interview?.data?.jobDescriptionText || ""
      ),
    });
    client.updateSession({
      input_audio_transcription: { model: "whisper-1" },
    });

    client.on("error", (event: any) => console.error(event));
    client.on("conversation.interrupted", async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on("conversation.updated", async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === "completed" && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }

      console.log("isInterviewDone:>>", isInterviewDone);
      if (!isInterviewDone) {
        setItems(items);
      } else {
        if (
          (items.at(-1) as any)?.status === "completed" &&
          items.at(-1)?.role === "assistant"
        ) {
          console.log("items.at(-1):", items.at(-1));

          const wavRecorder = wavRecorderRef.current;
          await wavRecorder.end();

          // client.disconnect();
        }
      }
    });

    setItems(client.conversation.getItems());

    return () => {
      client.reset();
    };
  }, [
    interview?.data?.jobDescriptionText,
    interview?.data?.submittedCVText,
    isInterviewDone,
  ]);

  const startInterview = useCallback(async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      if (!client || !wavRecorder || !wavStreamPlayer) {
        throw new Error("Failed to initialize interview components");
      }

      setItems(client.conversation.getItems());

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoEnabled,
      });

      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }

      // Connect to microphone
      await wavRecorder.begin();

      await wavStreamPlayer.connect();
      await client.connect();

      client.sendUserMessageContent([
        {
          type: "input_text",
          text: "Hello, I'm ready to start the interview.",
        },
      ]);

      client.updateSession({
        turn_detection: { type: "server_vad", silence_duration_ms: 1000 },
        voice: "shimmer",
      });

      await wavRecorder.record((data) => client.appendInputAudio(data.mono));

      setIsInterviewStarted(true);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start the interview. Please try again.");
      setIsInterviewStarted(false);
    }
  }, [isVideoEnabled]);

  const stopInterview = useCallback(async () => {
    setIsInterviewStarted(false);
    setElapsedTime(0);

    const client = clientRef.current;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    // await wavStreamPlayer.interrupt();

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
      videoRef.current.srcObject = null;
    }

    client.sendUserMessageContent([
      {
        type: "input_text",
        text: `
        Please analyze the interview and generate a comprehensive report on the candidate's performance. Do not be overly positive. The report should be candid and constructive, following the principles of Radical Candor: "Care Personally, Challenge Directly." Provide clear, respectful feedback that empowers the candidate to improve. Be specific, using examples from the interview to reinforce points.

        	•	Assess their speaking skills, including fluency, clarity, and confidence. Was there any hesitation or stuttering? Were there many "um"s or "ah"s or other filler words?
        	•	Assess clarity, relevance, and depth of responses.
          •	Evaluate communication skills, including how well the candidate elaborates on answers and provides specific examples.
          •	Judge problem-solving skills, technical knowledge, teamwork, adaptability, and overall fit.
          •	Be candid but respectful, giving constructive feedback following the principles of Radical Candor.


          Structure of Feedback Report:

          1. General Assessment

            •	Begin with an overall evaluation of the candidate's performance. Comment on their confidence, clarity, engagement, and professionalism during the interview.
            •	Use specific examples to highlight where they performed well or could improve. For instance, "Your response to the question about [specific topic] demonstrated a solid understanding of [relevant skill]."
            •	Maintain a balanced tone, acknowledging both strengths and areas where improvement is needed, framing all points constructively.

          2. Detailed Feedback

          Areas of Strength

            •	Identify key strengths shown during the interview. Provide specific examples where the candidate excelled, focusing on their approach, problem-solving ability, and relevant skills.
            •	Be encouraging, acknowledging the qualities that could help them succeed in a real interview. For example, "Your ability to clearly articulate your experience with [specific skill] was a highlight and could be an asset in this role."

          Areas for Improvement

            •	Candidly address areas where the candidate could improve, using examples to reinforce these points. Keep the tone respectful but direct, saying things like, "While your answer to [specific question] showed some insight, adding more details on [specific aspect] could strengthen your response."
            •	For each area, provide one or two actionable tips to help the candidate enhance their performance. For example, "Consider preparing specific examples of how you've applied [specific skill], which can make your responses more compelling."

          3. Actionable Next Steps

            •	Strengths to Build On: Summarize the candidate's top strengths and suggest ways to leverage these in future interviews. For example, "Continue to emphasize your experience with [specific skill], as this aligns well with the requirements for roles like [role]."
            •	Focus Areas: List specific areas to work on before the next interview, such as preparing examples, refining response structure, or improving clarity. Offer practical steps, such as, "Practice responding to questions on [specific skill], focusing on concise, structured answers."
            •	End with an encouraging note, reminding the candidate that improvement is a continuous process and that building on their strengths while addressing improvement areas can significantly boost their performance.
        `,
      },
    ]);

    setIsInterviewDone(true);
  }, []);

  const handleOutOfMinutes = useCallback(() => {
    stopInterview();
    toast.error("You've run out of minutes. The interview has been stopped.");
  }, [stopInterview]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((prev) => !prev);
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = (
        videoRef.current.srcObject as MediaStream
      ).getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Interview Controls & Video Area */}
      <div className="w-1/2 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <Timer
            isInterviewStarted={isInterviewStarted}
            elapsedTime={elapsedTime}
            setElapsedTime={setElapsedTime}
            totalTime={totalTime}
            onOutOfMinutes={handleOutOfMinutes}
          />
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "secondary"}
            size="sm"
            className="p-3 rounded-full"
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center space-y-6">
          <div className="w-full aspect-video bg-gray-800 rounded-2xl overflow-hidden border-4 border-blue-200 shadow-xl transition-all duration-300 hover:shadow-2xl">
            {isInterviewStarted && isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {isInterviewStarted
                  ? "Video is disabled"
                  : "Camera feed will appear here"}
              </div>
            )}
          </div>
          <AudioVisualizer
            startVisualization={isInterviewStarted}
            wavRecorder={wavRecorderRef.current}
            wavStreamPlayer={wavStreamPlayerRef.current}
          />
        </div>

        <div className="flex justify-end gap-4">
          {/* <Button */}
          {/*   onClick={() => { */}
          {/*     const client = clientRef.current; */}
          {/*     client.disconnect(); */}
          {/*   }} */}
          {/*   className="" */}
          {/*   variant="destructive" */}
          {/*   size="lg" */}
          {/* > */}
          {/*   <X className="mr-2 h-5 w-5" /> Disconnect */}
          {/* </Button> */}

          {!isInterviewStarted ? (
            <div className={cn("flex gap-4", isInterviewDone ? "hidden" : "")}>
              <Button
                disabled={isInterviewDone}
                onClick={isInterviewDone ? () => {} : startInterview}
                className="w-full"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" /> I&apos;m ready to start the
                interview
              </Button>
            </div>
          ) : (
            <Button
              onClick={stopInterview}
              className="w-full"
              variant="destructive"
              size="lg"
            >
              <Square className="mr-2 h-5 w-5" /> Stop Interview
            </Button>
          )}
        </div>
      </div>

      {/* Right side - Live Transcription and Notes Area */}
      <div className="w-1/2 p-8 bg-white shadow-2xl flex flex-col space-y-6">
        <div className="flex-1 overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Live Transcription
          </h2>
          <div
            ref={conversationRef}
            className="w-full h-[calc(100%-2rem)] p-4 rounded-xl flex flex-col gap-4 border-2 border-gray-200 overflow-y-auto whitespace-pre-wrap dark:bg-gray-900"
          >
            {!items.length && `awaiting connection...`}
            {items.map((conversationItem) => {
              if (conversationItem.role === "user") {
                return (
                  <div
                    className={cn(
                      "relative grid mb-2 gap-2",
                      "grid-cols-[50px_1fr_auto]"
                    )}
                    key={conversationItem.id}
                  >
                    <div
                      className={
                        "overflow-hidden break-words col-span-1 col-start-2 flex flex-col justify-end gap-4"
                      }
                    >
                      {!conversationItem.formatted.tool && (
                        <div className="p-2 px-4 rounded-3xl bg-[#0099ff] text-white font-medium">
                          {conversationItem.formatted.transcript ||
                            (conversationItem.formatted.audio?.length
                              ? "(awaiting transcript)"
                              : conversationItem.formatted.text ||
                                "(item sent)")}
                        </div>
                      )}

                      {conversationItem.formatted.file && (
                        <audio
                          src={conversationItem.formatted.file.url}
                          controls
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        "relative text-left gap-2 col-span-1 py-2",
                        "dark:text-gray-300 text-gray-700 col-start-3 text-right"
                      )}
                    >
                      <div>
                        {(
                          conversationItem.role || conversationItem.type
                        ).replaceAll("_", " ")}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  className={cn(
                    "relative grid mb-2",
                    "grid-cols-[auto_1fr_50px] gap-2"
                  )}
                  key={conversationItem.id}
                >
                  <div
                    className={cn(
                      "relative text-left gap-2 col-span-1 py-2",
                      "dark:text-gray-300 text-gray-700 col-start-1"
                    )}
                  >
                    <div>
                      {(
                        conversationItem.role || conversationItem.type
                      ).replaceAll("_", " ")}
                    </div>
                  </div>
                  <div
                    className={
                      "overflow-hidden break-words col-span-1 col-start-2 flex flex-col justify-start gap-4"
                    }
                  >
                    {!conversationItem.formatted.tool && (
                      <div className="p-2 px-4 rounded-3xl dark:bg-gray-800 bg-gray-200 dark:text-white text-black">
                        {conversationItem.formatted.transcript ||
                          conversationItem.formatted.text ||
                          "(truncated)"}
                      </div>
                    )}

                    {conversationItem.formatted.file && (
                      <audio
                        src={conversationItem.formatted.file.url}
                        controls
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Interview Notes
          </h2>
          <textarea
            placeholder="Jot down your notes here..."
            className="w-full h-[calc(100%-2rem)] resize-none p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
