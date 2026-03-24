# Audio Recording in Interview Optimiser

## Overview

The Interview Optimiser platform provides audio recording capabilities for interview sessions. This document explains how the audio recording functionality works, from the user interface to the backend infrastructure.

## Architecture

The audio recording system follows this high-level workflow:

1. During an interview session, voice interactions are processed through Hume AI's Voice SDK
2. After interview completion, the frontend initiates audio reconstruction via an API endpoint
3. Inngest functions process the reconstruction asynchronously
4. The audio is stored in S3 with CloudFront CDN for delivery
5. The report record is updated with the audio URL

## Key Components

### Infrastructure (AWS)

- **S3 Bucket**: `interviewoptimiser-audio-recordings-${environment}`

  - Stores all interview audio recordings
  - Implements lifecycle policies (Standard → Standard IA → Glacier)
  - Server-side encryption enabled

- **CloudFront Distribution**:

  - Provides cached and secure access to audio files
  - Implements proper cache behaviors for different audio formats
  - HTTPS-only access

- **Inngest Functions**:
  - `generate-missing-audio`: finds reports with missing audio and requests Hume reconstruction
  - `save-audio-to-s3`: polls Hume, downloads completed audio, uploads it to S3, and updates the report
  - `regenerate-incomplete-reports`: retries incomplete reports on a schedule

### Backend Components

- **API Endpoint**: `/api/interviews/[interviewId]/audio-reconstruction`

  - Initiates the audio reconstruction process
  - Checks authorization and validates interview ownership
  - Returns reconstruction status

- **Inngest Route**: `/api/inngest`
  - Serves the active Inngest functions for report generation and audio recovery

- **Utility Functions**:
  - `src/lib/utils/hume-audio-reconstruction.ts`: requests and polls Hume audio reconstruction
  - `lib/utils/s3-audio.ts`: uploads audio to S3 and returns a CloudFront URL

### Frontend Integration

- **Interview Controller**: `src/components/interview/interview-controller.tsx`
  - Uses React Query to request audio reconstruction after interview completion
  - Manages the interview session lifecycle

## Audio Playback

The platform includes an audio playback system built on the Web Audio API:

- **WavStreamPlayer**: Core class for audio playback functionality

  - Manages audio streaming and playback from PCM chunks
  - Provides frequency analysis for visualizations
  - Handles timing and tracking of audio playback position

- **Audio Visualization**: Real-time visualization of audio streams
  - Uses canvas-based rendering for waveform display
  - Shows voice patterns during playback
  - Provides separate visualizations for user and AI voices

The interview recording playback component automatically loads when viewing completed interviews, allowing users to:

- Play/pause the full interview recording
- See a visual representation of the audio
- Access the audio file directly via the CloudFront URL

## Data Flow

1. User completes an interview session
2. Frontend calls the audio reconstruction API endpoint
3. API endpoint verifies authorization and initiates reconstruction process
4. Inngest queues the audio save workflow
5. Inngest polls Hume API until reconstruction is complete
6. When ready, Inngest downloads the audio file
7. Audio is uploaded to S3 with proper metadata
8. Report record is updated with the CloudFront URL
9. Audio is available for playback in the interface

## Database Schema

The `reports` table includes an `interviewAudioUrl` field that stores the CloudFront URL to the processed audio file.

## Error Handling

- Comprehensive error handling at each stage
- Inngest retry handling for async failures
- Sentry integration for error tracking
- Discord notifications for critical failures

## Security Considerations

- Private S3 bucket with no public access
- CloudFront distribution for secure delivery
- CORS configuration to allow playback only from authorized domains
- Proper IAM permissions and policies

## Future Improvements

- Add audio compression options
- Implement audio transcription for accessibility
- Add waveform visualization for the audio player
- Support for downloading audio files in different formats
