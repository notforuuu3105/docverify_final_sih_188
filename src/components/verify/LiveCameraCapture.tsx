import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RotateCcw,
  Check,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LiveCameraCaptureProps {
  onPhotoConfirmed: (photoDataUrl: string, burstFrames?: string[]) => void;
  onPhotoReset: () => void;
  confirmedPhoto: string | null;
  isConfirmed: boolean;
  onSkip?: () => void;
}

export const LiveCameraCapture: React.FC<LiveCameraCaptureProps> = ({
  onPhotoConfirmed,
  onPhotoReset,
  confirmedPhoto,
  isConfirmed,
  onSkip,
}) => {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureState, setCaptureState] = useState<'idle' | 'requesting' | 'active' | 'preview'>('idle');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBurst, setCapturedBurst] = useState<string[]>([]);
  const [isCapturingBurst, setIsCapturingBurst] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<'denied' | 'unavailable' | 'other' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  // Stop active stream tracks safely
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Launch live camera feed
  const startCamera = async () => {
    stopStream();
    setErrorType(null);
    setErrorMsg('');
    setCaptureState('requesting');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCaptureState('active');

      // Bind to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video play interrupted:', playErr);
        });
      }
    } catch (err: unknown) {
      console.error('Camera initialization failed:', err);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorType('denied');
        setErrorMsg(t('camera_permission_denied'));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorType('unavailable');
        setErrorMsg(t('camera_unavailable'));
      } else {
        setErrorType('other');
        setErrorMsg(error.message || 'Unable to access live camera device.');
      }
      setCaptureState('idle');
    }
  };

  // Attach stream to videoRef when state becomes 'active'
  useEffect(() => {
    if (captureState === 'active' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((playErr) => {
        console.warn('Video play interrupted:', playErr);
      });
    }
  }, [captureState, stream]);

  const grabSingleFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    context.save();
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);
    context.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Capture multi-frame burst (3 frames) for anti-spoofing & liveness verification
  const handleTakeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturingBurst(true);

    const burst: string[] = [];
    const f1 = grabSingleFrame();
    if (f1) burst.push(f1);

    await new Promise((r) => setTimeout(r, 150));
    const f2 = grabSingleFrame();
    if (f2) burst.push(f2);

    await new Promise((r) => setTimeout(r, 150));
    const f3 = grabSingleFrame();
    if (f3) burst.push(f3);

    setIsCapturingBurst(false);

    const mainPhoto = f2 || f1;
    if (mainPhoto) {
      setCapturedPreview(mainPhoto);
      setCapturedBurst(burst);
      setTimestamp(new Date().toLocaleTimeString());
      stopStream();
      setCaptureState('preview');
    }
  };

  // Retake photo: discard preview and restart live camera
  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBurst([]);
    onPhotoReset();
    startCamera();
  };

  // Cancel camera during active stream
  const handleCancelCamera = () => {
    stopStream();
    setCaptureState('idle');
  };

  // Confirm photo: user clicks "Continue"
  const handleContinue = () => {
    if (capturedPreview) {
      onPhotoConfirmed(capturedPreview, capturedBurst);
      setCaptureState('idle');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-sm border border-gov-line shadow-xs space-y-4">
      {/* Hidden processing canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Header & Step Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gov-navy-900 text-white flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-gov-saffron" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-gov-navy-950 uppercase tracking-wide">
                4. {t('live_camera_step_title')}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                {t('live_photo_mandatory_badge')}
              </span>
            </div>
            <p className="text-[11px] text-gov-inksoft mt-0.5">
              {t('live_camera_step_subtitle')}
            </p>
          </div>
        </div>

        {isConfirmed && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 self-start sm:self-auto">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('live_photo_verified')}</span>
          </div>
        )}
      </div>

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite">
        {captureState === 'requesting' && 'Requesting camera access...'}
        {captureState === 'active' && 'Camera is active. Position your face in frame and capture a photo.'}
        {captureState === 'preview' && 'Live photo captured. Review or retake the photo.'}
        {isConfirmed && 'Live photo confirmed.'}
      </div>

      {/* Error Banner (Permissions / Hardware) */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-300 rounded-sm text-xs text-rose-950 flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <strong className="block font-bold">
              {errorType === 'denied'
                ? (isHi ? 'कैमरा अनुमति अस्वीकृत' : 'Camera Permission Blocked')
                : (isHi ? 'कैमरा अनुपलब्ध' : 'Camera Device Unavailable')}
            </strong>
            <p className="text-[11px] leading-relaxed text-rose-900">{errorMsg}</p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-rose-800 hover:bg-rose-900 px-3 py-1 rounded-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('retry_camera_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Confirmed State (Photo Locked and Ready) */}
      {isConfirmed && confirmedPhoto ? (
        <div className="p-4 bg-emerald-50/40 border border-emerald-300 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 rounded bg-slate-900 border-2 border-emerald-600 overflow-hidden shrink-0 shadow-xs relative">
              <img
                src={confirmedPhoto}
                alt="Confirmed Live Photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-[8px] font-mono text-emerald-300 text-center py-0.5">
                LIVE SECURED
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gov-navy-950">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{isHi ? 'लाइव फोटो रिकॉर्ड सत्यापित' : 'Live Camera Token Locked'}</span>
              </div>
              <p className="text-[11px] text-gov-inksoft leading-tight">
                {isHi
                  ? 'फोटो का मिलान दस्तावेज़ में स्थित पहचान फोटो से स्वचालित रूप से किया जाएगा।'
                  : 'Photo locked for automated 1:1 facial comparison against the identity document.'}
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-slate-500">
                <span>TIMESTAMP: {timestamp || 'AUTHENTICATED'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">READY TO VERIFY</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRetake}
            className="btn-gov-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
            title={t('retake_photo_btn')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('retake_photo_btn')}</span>
          </button>
        </div>
      ) : null}

      {/* 2. Idle State (Prompt to Capture Live Photo) */}
      {!isConfirmed && captureState === 'idle' && (
        <div className="p-6 border-2 border-dashed border-gov-line rounded-sm bg-gov-paper text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gov-navy-900 text-gov-saffron flex items-center justify-center mx-auto shadow-xs">
            <Camera className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <p className="text-xs font-bold text-gov-navy-950">
              {isHi
                ? 'दस्तावेज़ सत्यापन शुरू करने से पहले लाइव कैमरा फोटो अनिवार्य है'
                : 'Live photo capture is strictly mandatory before starting verification'}
            </p>
            <p className="text-[11px] text-gov-inksoft">
              {isHi
                ? 'सुरक्षा कारणों से मौजूदा छवि अपलोड की अनुमति नहीं है। केवल डिवाइस कैमरे से लाइव फोटो स्वीकार की जाती है।'
                : 'Existing photo uploads are prohibited for identity validation. Only live webcam/device camera capture is accepted.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={startCamera}
              className="btn-gov-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-sm hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <Camera className="w-4 h-4 text-gov-saffron" />
              <span>{t('capture_live_photo_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Requesting Camera State */}
      {captureState === 'requesting' && (
        <div className="p-8 border border-gov-line rounded-sm bg-gov-paper text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gov-navy-900 animate-spin mx-auto" />
          <p className="text-xs font-bold text-gov-navy-950">
            {isHi ? 'कैमरा अनुमतियों की जांच एवं प्रारंभ जारी है...' : 'Requesting Camera Access & Initializing Video Enclave...'}
          </p>
          <p className="text-[11px] text-gov-inksoft">
            {isHi ? 'कृपया अपने ब्राउज़र में कैमरा एक्सेस स्वीकार करें।' : 'Please accept the browser camera prompt to proceed.'}
          </p>
        </div>
      )}

      {/* 4. Active Live Camera Viewfinder */}
      {captureState === 'active' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="relative max-w-sm mx-auto aspect-[4/5] bg-slate-950 rounded-sm overflow-hidden border-2 border-gov-navy-900 shadow-md">
            {/* Live Mirror Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
              aria-label="Live camera feed"
            />

            {/* Oval Biometric Reticle Guide */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-gov-saffron/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] relative flex items-center justify-center">
                {/* Center crosshair */}
                <div className="w-2 h-2 rounded-full bg-gov-saffron animate-pulse" />
                <div className="absolute top-2 text-[9px] font-mono font-bold text-gov-saffron uppercase tracking-widest bg-slate-950/70 px-2 py-0.5 rounded">
                  ALIGN FACE
                </div>
              </div>
            </div>

            {/* Top Live Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 text-white text-[10px] font-mono border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400">LIVE CAMERA</span>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-2 inset-x-2 text-center text-[10px] font-medium text-slate-200 bg-slate-900/80 py-1 px-2 rounded backdrop-blur-xs">
              {t('camera_active_hint')}
            </div>
          </div>

          {/* Shutter & Cancel Actions */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCancelCamera}
              className="btn-gov-secondary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('cancel_camera_btn')}</span>
            </button>

            <button
              type="button"
              onClick={handleTakeSnapshot}
              className="btn-gov-primary text-xs px-6 py-2.5 flex items-center gap-2 font-bold shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Camera className="w-4 h-4 text-gov-saffron" />
              <span>{t('take_snapshot_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Review & Retake State (Step 5) */}
      {!isConfirmed && captureState === 'preview' && capturedPreview && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-gov-paper border border-gov-line rounded-sm max-w-md mx-auto space-y-3 text-center">
            <span className="text-[10px] font-bold text-gov-navy-950 uppercase tracking-wider font-mono block">
              5. {isHi ? 'फोटो समीक्षा करें अथवा दोबारा लें' : 'Review Photo or Retake'}
            </span>

            {/* Captured Snapshot Frame */}
            <div className="w-44 h-56 mx-auto rounded bg-slate-950 border-2 border-gov-navy-900 overflow-hidden shadow-sm relative">
              <img
                src={capturedPreview}
                alt="Captured Live Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 inset-x-1 bg-gov-navy-950/80 text-[9px] font-mono text-white py-0.5 rounded-xs flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-gov-saffron" />
                <span>CAPTURED AT {timestamp}</span>
              </div>
            </div>

            <p className="text-[11px] text-gov-inksoft">
              {isHi
                ? 'यदि फोटो साफ और सीधी है तो "आगे बढ़ें" पर क्लिक करें, अन्यथा "दोबारा फोटो लें"।'
                : 'Confirm if your face is clearly visible, evenly lit, and free of reflections before continuing.'}
            </p>

            {/* Action Buttons: Retake Photo and Continue */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetake}
                className="btn-gov-secondary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('retake_photo_btn')}</span>
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="btn-gov-primary text-xs px-6 py-2.5 flex items-center gap-2 font-bold shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 text-gov-saffron" />
                <span>{t('continue_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
