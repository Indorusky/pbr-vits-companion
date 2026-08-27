import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadFaceApiModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  // Vladmandic fork model folder hosted on jsDelivr CDN
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
  
  loadingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
    } catch (error) {
      loadingPromise = null;
      console.error('Failed to load face-api.js models:', error);
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Detects a face and returns its 128-dimensional embedding descriptor.
 */
export async function getFaceEmbedding(
  element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await loadFaceApiModels();
  
  const detection = await faceapi.detectSingleFace(element)
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  if (!detection) return null;
  return detection.descriptor;
}

/**
 * Checks if face-api models are loaded
 */
export function isFaceApiLoaded() {
  return modelsLoaded;
}
