"use client";

import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools";
import { WavRenderer } from "@/utils/wav_renderer";
import { useCallback, useEffect, useRef } from "react";

export function AudioVisualizer({
  startVisualization,
  wavRecorder,
  wavStreamPlayer,
}: {
  startVisualization: boolean;
  wavRecorder: WavRecorder;
  wavStreamPlayer: WavStreamPlayer;
}) {
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const aiCanvasRef = useRef<HTMLCanvasElement>(null);

  const setupAudioVisualization = useCallback(() => {
    const render = () => {
      if (userCanvasRef.current && aiCanvasRef.current) {
        const userCtx = userCanvasRef.current.getContext("2d");
        const aiCtx = aiCanvasRef.current.getContext("2d");

        if (userCtx && aiCtx) {
          userCtx.clearRect(
            0,
            0,
            userCanvasRef.current.width,
            userCanvasRef.current.height
          );
          aiCtx.clearRect(
            0,
            0,
            aiCanvasRef.current.width,
            aiCanvasRef.current.height
          );

          if (wavRecorder && wavStreamPlayer) {
            const userFrequencies = wavRecorder.recording
              ? wavRecorder.getFrequencies("voice")
              : { values: new Float32Array([0]) };
            const aiFrequencies = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies("voice")
              : { values: new Float32Array([0]) };

            WavRenderer.drawBars(
              userCanvasRef.current,
              userCtx,
              Array.from(userFrequencies?.values || []),
              "#0099ff",
              10,
              5,
              50
            );
            WavRenderer.drawBars(
              aiCanvasRef.current,
              aiCtx,
              Array.from(aiFrequencies?.values || []),
              "#009900",
              10,
              5,
              50
            );
          }
        }
      }

      requestAnimationFrame(render);
    };

    render();
  }, [wavRecorder, wavStreamPlayer]);

  useEffect(() => {
    if (startVisualization) {
      setupAudioVisualization();
    }
  }, [startVisualization, setupAudioVisualization]);

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-2xl shadow-lg">
      <div className="flex justify-between space-x-4">
        <div className="w-1/2">
          <div className="text-center text-sm font-semibold text-blue-600 mb-2">
            You
          </div>
          <canvas
            ref={userCanvasRef}
            width="200"
            height="100"
            className="w-full rounded-lg"
          />
        </div>
        <div className="w-1/2">
          <div className="text-center text-sm font-semibold text-pink-600 mb-2">
            AI
          </div>
          <canvas
            ref={aiCanvasRef}
            width="200"
            height="100"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
