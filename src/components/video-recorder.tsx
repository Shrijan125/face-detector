'use client';
import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from './ui/button';
import { Download, PauseCircle, PlayCircle } from 'lucide-react';

const VideoRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoData, setVideoData] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const combinedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 720, height: 560 });

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth <= 768;
      setDisplayDimensions({
        width: isMobile ? 400 : 720,
        height: isMobile ? 300 : 560
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoStreamRef.current = stream;

        const videoElement = document.getElementById(
          'video',
        ) as HTMLVideoElement | null;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the webcam:', error);
      }
    };

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ])
      .then(() => {
        startVideo();
      })
      .catch((error) => {
        console.error('Error loading models:', error);
      });
  }, []);

  const handlePlay = async () => {
    const videoElement = document.getElementById('video') as HTMLVideoElement | null;
    if (!videoElement) return;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = displayDimensions.width;
    combinedCanvas.height = displayDimensions.height;
    combinedCanvasRef.current = combinedCanvas;

    const ctx = combinedCanvas.getContext('2d');
    const faceCanvas = faceapi.createCanvasFromMedia(videoElement);
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = displayDimensions.width;
    offscreenCanvas.height = displayDimensions.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    const container = videoElement.parentElement;

    if (container && ctx && offscreenCtx) {
      faceCanvas.style.position = 'absolute';
      faceCanvas.style.top = '0';
      faceCanvas.style.left = '0';
      faceCanvas.width = displayDimensions.width;
      faceCanvas.height = displayDimensions.height;
      container.appendChild(faceCanvas);

      faceapi.matchDimensions(faceCanvas, displayDimensions);

      setInterval(async () => {
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCtx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

        const detections = await faceapi
          .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displayDimensions);
        const faceCtx = faceCanvas.getContext('2d');

        faceCtx?.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
        faceapi.draw.drawDetections(faceCanvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(faceCanvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(faceCanvas, resizedDetections);

        offscreenCtx.drawImage(faceCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

        ctx.clearRect(0, 0, combinedCanvas.width, combinedCanvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0, combinedCanvas.width, combinedCanvas.height);
      }, 100);
    }
  };

  const handleToggleRecording = () => {
    const combinedCanvas = combinedCanvasRef.current;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      setIsRecording(false);
    } else {
      if (!combinedCanvas) return;

      const ctx = combinedCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, combinedCanvas.width, combinedCanvas.height);
      }
      setVideoData(null);
      setRecordingDuration(0);

      const stream = combinedCanvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        setVideoData(videoBlob);
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleDownload = () => {
    if (videoData) {
      const url = URL.createObjectURL(videoData);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'video-recording.mp4';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="place-items-center mt-20">
      <div className="relative md:w-[720px] md:h-[560px] w-[400px] h-[300px]">
        <video
          id="video"
          width={displayDimensions.width}
          height={displayDimensions.height}
          className="shadow-[0px_0px_15px_5px_#6a27d2] rounded-md"
          autoPlay
          muted
          onPlay={handlePlay}
        ></video>
      </div>
      <div className="flex mt-6 gap-9">
        <Button onClick={handleToggleRecording} variant={isRecording ? 'destructive' : 'default'}>
          <div className="flex gap-2 items-center">
            {isRecording ? <PauseCircle /> : <PlayCircle />}
            {isRecording ? 'Stop' : 'Start'}
          </div>
        </Button>
        <Button
          variant={'outline'}
          className="border-bgPrimary"
          onClick={handleDownload}
          disabled={!videoData}
        >
          <div className="flex items-center gap-2">
            <Download />
            Download
          </div>
        </Button>
      </div>
      {isRecording && (
        <div className="mt-4 text-center text-sm font-bold text-purple-200">
          Recording Duration: {formatDuration(recordingDuration)}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;