
import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCcw, Send, Info, MessageSquare, Play } from 'lucide-react';
import Button from '../components/Button';
import { interpretSign } from '../services/geminiService';

const QueryInterface = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraActive(true);
            setError(null);
        } catch (err) {
            setError("Camera access denied. Please enable camera permissions.");
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const captureAndInterpret = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsProcessing(true);
        setError(null);

        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            const translation = await interpretSign(dataUrl);
            setResult(translation);
        }

        setIsProcessing(false);
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sign to Text</h1>
                <p className="text-lg text-slate-600">
                    Sign clearly in front of the camera. Our AI will translate your gestures into text instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Camera Feed Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl ring-8 ring-white border border-slate-200">
                        {!isCameraActive ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-6 bg-slate-900">
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center">
                                    <CameraOff size={40} className="text-slate-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold">Camera is inactive</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto">Allow camera access to start using sign language translation.</p>
                                </div>
                                <Button size="lg" onClick={startCamera}>Start Camera</Button>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />

                                {/* Live Indicator Overlay */}
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Live View
                                </div>

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                    <Button
                                        variant="danger"
                                        onClick={stopCamera}
                                        className="rounded-full !p-4"
                                    >
                                        <CameraOff size={24} />
                                    </Button>
                                    <Button
                                        size="xl"
                                        variant="accent"
                                        isLoading={isProcessing}
                                        onClick={captureAndInterpret}
                                        className="shadow-2xl shadow-teal-500/20 rounded-full"
                                    >
                                        <Sparkles size={24} className="mr-2" />
                                        Interpret Sign
                                    </Button>
                                    <button className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors">
                                        <RefreshCcw size={24} />
                                    </button>
                                </div>
                            </>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
                            <Info size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                </div>

                {/* Translation Results Area */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 min-h-[400px] flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Translation</h2>
                        </div>

                        <div className="flex-1 space-y-6">
                            {isProcessing ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
                                    <div className="h-6 bg-slate-100 rounded-full w-1/2"></div>
                                    <div className="h-24 bg-slate-100 rounded-3xl"></div>
                                </div>
                            ) : result ? (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative group">
                                        <p className="text-2xl font-semibold text-indigo-900 leading-tight">
                                            "{result}"
                                        </p>
                                        <button className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Send size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Suggested Replies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["Hello!", "Thank you", "How are you?", "Nice to meet you"].map(text => (
                                                <button key={text} className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-medium border border-transparent hover:border-indigo-100 transition-all">
                                                    {text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                        <MessageSquare size={32} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400">Your translated sign will appear here.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                                <span>Confidence Level</span>
                                <span className="text-teal-600">High (92%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 w-[92%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[30px] p-6 text-white overflow-hidden relative group cursor-pointer">
                        <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform" />
                        <h4 className="font-bold text-lg mb-1 relative z-10">Avatar Feedback</h4>
                        <p className="text-slate-400 text-sm relative z-10">Watch the AI avatar mirror your sign for accuracy.</p>
                        <div className="mt-4 aspect-square bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
                            {/* Fix: Play is now imported */}
                            <Play fill="white" size={24} className="opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryInterface;
