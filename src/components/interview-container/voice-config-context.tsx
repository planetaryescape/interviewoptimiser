"use client";

import * as React from "react";

interface VoiceConfigContextType {
  accessToken: string;
  configId: string | undefined;
  systemPrompt: string;
  interview: any;
}

const VoiceConfigContext = React.createContext<VoiceConfigContextType | undefined>(undefined);

export function VoiceConfigProvider({
  children,
  accessToken,
  configId,
  systemPrompt,
  interview,
}: React.PropsWithChildren<VoiceConfigContextType>) {
  return (
    <VoiceConfigContext.Provider value={{ accessToken, configId, systemPrompt, interview }}>
      {children}
    </VoiceConfigContext.Provider>
  );
}

export function useVoiceConfig() {
  const context = React.useContext(VoiceConfigContext);
  if (!context) {
    throw new Error("useVoiceConfig must be used within VoiceConfigProvider");
  }
  return context;
}
