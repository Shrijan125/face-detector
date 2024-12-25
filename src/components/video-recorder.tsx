'use client'
import React, { useEffect } from 'react';
import * as faceapi from 'face-api.js';

const VideoRecorder: React.FC = () => {
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('video') as HTMLVideoElement | null;
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

    const canvas = faceapi.createCanvasFromMedia(videoElement);
    const container = videoElement.parentElement;

    if (container) {
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '1';
      container.appendChild(canvas);
    }

    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
  };

  return (
    <div style={{ position: 'relative', width: '720px', height: '560px' }}>
      <video id="video" width="720" height="560" autoPlay muted onPlay={handlePlay}></video>
    </div>
  );
};

export default VideoRecorder;
