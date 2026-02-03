import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, File, Trash2, ArrowRight, Loader, Download } from 'lucide-react';
import Button from '../components/Button';
import { pipelineService } from '../services/pipelineService';
import { useNavigate } from 'react-router-dom';

const INITIAL_STEPS = [
    { id: 1, label: 'Reading Document Content', status: 'pending' },
    { id: 2, label: 'Simplifying Complexity', status: 'pending' },
    { id: 3, label: 'Translating to Gloss', status: 'pending' },
    { id: 4, label: 'Generating Motion Poses', status: 'pending' },
    { id: 5, label: 'Finalizing Animation', status: 'pending' },
];

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [steps, setSteps] = useState(INITIAL_STEPS);
    const [isComplete, setIsComplete] = useState(false);
    const [pipelineResult, setPipelineResult] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setIsComplete(false);
            setSteps(INITIAL_STEPS);
        }
    };

    const startProcessing = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));

        try {
            // Simulate incremental progress for visual feedback
            // In a real app with WebSockets, we'd get real event updates
            let currentStep = 0;
            const interval = setInterval(() => {
                if (currentStep < 4) { // Don't complete step 5 until actual return
                    setSteps(prev => prev.map((s, idx) =>
                        idx === currentStep ? { ...s, status: 'processing' } :
                            idx < currentStep ? { ...s, status: 'complete' } : s
                    ));
                    currentStep++;
                }
            }, 3000); // 3 seconds per simulated step

            const result = await pipelineService.processFullPipeline(file, (percent) => {
                console.log(`Upload Progress: ${percent}%`);
            });

            clearInterval(interval);

            // Mark all as complete on success
            setPipelineResult(result);
            setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
            setIsComplete(true);

        } catch (err) {
            console.error(err);
            setError("Failed to process document. Please ensure the backend is running.");
            setSteps(prev => prev.map(s => ({ ...s, status: 'error' })));
        } finally {
            setIsUploading(false);
        }
    };

    const getChapters = () => {
        return pipelineResult?.pipeline_summary?.final_output?.video_chapters || [];
    };

    const handleOpenLesson = () => {
        navigate('/lesson', { state: { pipelineResult } });
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Upload Learning Material</h1>
                <p className="text-lg text-slate-600">
                    Transform any text, PDF, or video into a custom sign language lesson powered by our AI Avatar.
                </p>
            </div>

            {!isUploading && !isComplete && !error ? (
                <div className="space-y-8">
                    {/* Upload Card */}
                    <div
                        className={`
              relative border-4 border-dashed rounded-[40px] p-16 flex flex-col items-center justify-center transition-all duration-300
              ${file ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50'}
            `}
                    >
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />

                        <div className={`
              w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500
              ${file ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400'}
            `}>
                            {file ? <File size={40} /> : <Upload size={40} />}
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                {file ? file.name : 'Click or Drag File Here'}
                            </h3>
                            <p className="text-slate-500 mb-8">
                                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Supported: PDF, DOCX, MP4, TXT (Max 50MB)'}
                            </p>
                            {file && (
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => setFile(null)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                                        <Trash2 size={18} />
                                        Remove
                                    </button>
                                    <Button size="lg" onClick={startProcessing}>Process Document</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <FileText className="text-indigo-600" />, title: "Smart Summaries", desc: "We distill your content into easy-to-learn sign phrases." },
                            { icon: <Clock className="text-teal-600" />, title: "Quick Conversion", desc: "Turn lengthy documents into video lessons in under 2 minutes." },
                            { icon: <CheckCircle className="text-indigo-600" />, title: "High Accuracy", desc: "Our avatar uses certified sign vocabulary for all translations." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">{feature.icon}</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{feature.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{file?.name || "Processing Content"}</h3>
                                    <p className="text-sm text-slate-500">
                                        {error ? "Processing Failed" : isComplete ? "Processing Complete" : "AI is converting your material..."}
                                    </p>
                                </div>
                            </div>
                            {isComplete && <CheckCircle size={24} className="text-teal-500" fill="currentColor" />}
                            {error && <AlertCircle size={24} className="text-red-500" />}
                        </div>

                        {error ? (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                                {error}
                                <button
                                    onClick={() => { setError(null); setIsUploading(false); setIsComplete(false); }}
                                    className="block mt-2 font-bold underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-4">
                                        <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${step.status === 'complete' ? 'bg-teal-500 border-teal-500 text-white' :
                                                step.status === 'processing' ? 'border-indigo-600 text-indigo-600 animate-pulse' :
                                                    'border-slate-100 text-slate-200'}
                      `}>
                                            {step.status === 'complete' ? <CheckCircle size={14} fill="currentColor" /> :
                                                step.status === 'processing' ? <Loader size={14} className="animate-spin" /> :
                                                    <span className="text-xs font-bold">{step.id}</span>}
                                        </div>
                                        <span className={`
                        font-semibold text-lg transition-colors duration-500
                        ${step.status === 'complete' ? 'text-slate-900' :
                                                step.status === 'processing' ? 'text-indigo-600' : 'text-slate-300'}
                      `}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isComplete && (
                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 text-teal-800">
                                    <h4 className="font-bold mb-3">Generated Animations</h4>

                                    <div className="space-y-2">
                                        {getChapters().map((chapter, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-100">
                                                <div>
                                                    <p className="font-semibold text-sm">{chapter.chapter_title}</p>
                                                    <p className="text-xs text-slate-400">
                                                        Duration: {chapter.duration_seconds?.toFixed(1) || "?"}s
                                                    </p>
                                                </div>
                                                <a
                                                    href={`http://127.0.0.1:8000${chapter.video_url}`}
                                                    download
                                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    <Download size={16} /> JSON
                                                </a>
                                            </div>
                                        ))}
                                        {getChapters().length === 0 && (
                                            <p className="text-sm text-slate-400 italic">No output generated.</p>
                                        )}
                                    </div>
                                </div>
                                <Button size="xl" className="w-full flex items-center justify-center gap-3" onClick={handleOpenLesson}>
                                    Open AI Lesson <ArrowRight size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {!isComplete && !error && (
                        <div className="p-6 bg-indigo-50/50 rounded-3xl flex items-start gap-4 border border-indigo-100">
                            <AlertCircle className="text-indigo-600 flex-shrink-0" size={24} />
                            <p className="text-sm text-indigo-800 leading-relaxed">
                                <strong>Tip:</strong> You can stay on this page or navigate away.
                                We'll notify you via your archive when the conversion is ready for viewing.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadPage;
