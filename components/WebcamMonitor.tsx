
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// FaceDetector API might not be in standard TypeScript lib
declare global {
  interface Window {
    FaceDetector: any;
  }
  class FaceDetector {
    constructor(options?: { fastMode?: boolean; maxDetectedFaces?: number });
    detect(image: ImageBitmapSource): Promise<any[]>;
  }
}


interface WebcamMonitorProps {
  onUserPresent: () => void;
  onUserNotPresent: () => void;
}

type WebcamStatus = 'initializing' | 'waiting' | 'active' | 'error';

const ABSENCE_TIMEOUT = 3000; // 3 seconds of absence triggers the warning
const CHECK_INTERVAL = 500; // Check every 0.5 seconds

export const WebcamMonitor = forwardRef<HTMLVideoElement, WebcamMonitorProps>(({ onUserPresent, onUserNotPresent }, ref) => {
  const videoRefInternal = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => videoRefInternal.current as HTMLVideoElement);
  
  const absenceTimerRef = useRef<number | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const [status, setStatus] = useState<WebcamStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detectFace = useCallback(async () => {
    if (!videoRefInternal.current || !faceDetectorRef.current || videoRefInternal.current.paused || videoRefInternal.current.ended || videoRefInternal.current.videoWidth === 0) {
      return;
    }

    try {
      const faces = await faceDetectorRef.current.detect(videoRefInternal.current);
      if (faces.length > 0) {
        // User is present
        if (absenceTimerRef.current) {
          clearTimeout(absenceTimerRef.current);
          absenceTimerRef.current = null;
        }
        onUserPresent();
      } else {
        // User might not be present
        if (!absenceTimerRef.current) {
          absenceTimerRef.current = window.setTimeout(() => {
            onUserNotPresent();
          }, ABSENCE_TIMEOUT);
        }
      }
    } catch (err) {
      console.error("Face detection failed:", err);
      // Fallback: assume presence to avoid breaking the flow on a glitch
      onUserPresent();
    }
  }, [onUserNotPresent, onUserPresent]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: number | null = null;

    const setup = async () => {
      setStatus('initializing');
      // 1. Check for FaceDetector support
      if (!('FaceDetector' in window)) {
        setErrorMessage("Your browser doesn't support face detection. Please use a modern browser like Chrome or Edge for this feature.");
        setStatus('error');
        return;
      }

      // 2. Initialize FaceDetector
      try {
        faceDetectorRef.current = new window.FaceDetector({ fastMode: true });
      } catch (err) {
        console.error("Failed to create FaceDetector:", err);
        setErrorMessage("Could not initialize face detection.");
        setStatus('error');
        return;
      }

      // 3. Start Webcam
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          setStatus('waiting');
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRefInternal.current) {
            videoRefInternal.current.srcObject = stream;
            // Wait for the video to start playing to get dimensions
            videoRefInternal.current.onloadedmetadata = () => {
                videoRefInternal.current?.play().catch(e => console.error("Video play failed:", e));
                setStatus('active');
                intervalId = window.setInterval(detectFace, CHECK_INTERVAL);
            }
          }
        } else {
          throw new Error('getUserMedia not supported');
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setErrorMessage("Could not access webcam. Please check permissions and refresh.");
        setStatus('error');
      }
    };

    setup();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (absenceTimerRef.current) {
        clearTimeout(absenceTimerRef.current);
      }
    };
  }, [detectFace]);

  const renderContent = () => {
    switch (status) {
        case 'error':
            return <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center text-sm flex items-center justify-center h-full">{errorMessage}</div>;
        case 'initializing':
            return <div className="text-gray-400 flex items-center justify-center h-full animate-pulse">Initializing Camera...</div>;
        case 'waiting':
            return <div className="text-gray-400 flex items-center justify-center h-full animate-pulse">Waiting for camera permission...</div>;
        case 'active':
            return (
                <>
                    <video ref={videoRefInternal} className="w-full h-full object-cover transform scaleX(-1)" muted playsInline />
                    <div className="absolute top-2 left-2 bg-red-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                </>
            );
    }
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center">
      {renderContent()}
    </div>
  );
});