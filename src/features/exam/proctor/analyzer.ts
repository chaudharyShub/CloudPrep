import type { FrameSignals, ObjectSignals } from '@/domain/exam/proctor';
import { faceReading, meanBrightness, OBJECT_LABELS, objectSignals } from './signals';

/** Runs the AI models on the current camera frame. Frames are analysed in memory only. */
export interface ProctorAnalyzer {
  /** Faces, head pose, eyes and mouth, plus brightness. Null if no frame is ready yet. */
  analyzeFrame: (video: HTMLVideoElement, now: number) => FrameSignals | null;
  /** Phones, people, books and screens. Null if no frame is ready yet. */
  detectObjects: (video: HTMLVideoElement, now: number) => ObjectSignals | null;
  close: () => void;
}

declare global {
  interface Window {
    /**
     * Test hook: end-to-end tests install a scripted analyzer here instead of the real models.
     * It can't weaken anything a learner couldn't already bypass in their own browser.
     */
    __cloudprepProctorAnalyzer?: () => ProctorAnalyzer;
  }
}

const BASE = `${import.meta.env.BASE_URL}proctor/`;
export const FACE_MODEL_URL = `${BASE}models/face_landmarker.task`;
export const OBJECT_MODEL_URL = `${BASE}models/efficientdet_lite2.tflite`;

function frameReady(video: HTMLVideoElement): boolean {
  return video.readyState >= 2 && video.videoWidth > 0;
}

/** Brightness from a tiny copy of the frame (never kept). */
function brightnessReader(): (video: HTMLVideoElement) => number {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 24;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  return (video) => {
    if (!context) return 255; // can't measure: don't report a covered camera
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return meanBrightness(context.getImageData(0, 0, canvas.width, canvas.height).data);
  };
}

/** Each MediaPipe task needs strictly increasing timestamps. */
function timestamps(): (now: number) => number {
  let last = 0;
  return (now) => {
    last = Math.max(Math.round(now), last + 1);
    return last;
  };
}

/**
 * Loads MediaPipe (WebAssembly runtime + two models) from this site's own /proctor/ folder.
 * Uses the GPU when available and falls back to the CPU.
 */
export async function loadProctorAnalyzer(): Promise<ProctorAnalyzer> {
  const testAnalyzer = window.__cloudprepProctorAnalyzer;
  if (testAnalyzer) return testAnalyzer();

  const vision = await import('@mediapipe/tasks-vision');
  const fileset = await vision.FilesetResolver.forVisionTasks(`${BASE}wasm`);
  const withFallback = async <T>(create: (delegate: 'GPU' | 'CPU') => Promise<T>) => {
    try {
      return await create('GPU');
    } catch {
      return create('CPU');
    }
  };
  const faces = await withFallback((delegate) =>
    vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numFaces: 3,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    }),
  );
  const objects = await withFallback((delegate) =>
    vision.ObjectDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: OBJECT_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      scoreThreshold: 0.3,
      maxResults: 10,
      categoryAllowlist: [...OBJECT_LABELS],
    }),
  );
  const brightness = brightnessReader();
  const faceTime = timestamps();
  const objectTime = timestamps();

  return {
    analyzeFrame(video, now) {
      if (!frameReady(video)) return null;
      const result = faces.detectForVideo(video, faceTime(now));
      const count = result.faceLandmarks.length;
      const blendshapes = result.faceBlendshapes[0]?.categories ?? [];
      return {
        faces: count,
        face: count > 0 ? faceReading(blendshapes, result.facialTransformationMatrixes[0]) : null,
        brightness: brightness(video),
      };
    },
    detectObjects(video, now) {
      if (!frameReady(video)) return null;
      return objectSignals(objects.detectForVideo(video, objectTime(now)).detections);
    },
    close() {
      faces.close();
      objects.close();
    },
  };
}
