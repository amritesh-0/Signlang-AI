
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, File, Trash2, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

const INITIAL_STEPS = [
    { id: 1, label: 'Reading Document Content', status: 'pending' },
    { id: 2, label: 'Extracting Key Concepts', status: 'pending' },
    { id: 3, label: 'Generating Sign Mappings', status: 'pending' },
    { id: 4, label: 'Rendering AI Avatar Lesson', status: 'pending' },
];

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [steps, setSteps] = useState(INITIAL_STEPS);
    const [isComplete, setIsComplete] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startProcessing = () => {
        setIsUploading(true);
        let currentStep = 0;

        const interval = setInterval(() => {
            setSteps(prev => prev.map((step, idx) => {
                if (idx === currentStep) return { ...step, status: 'processing' };
                if (idx < currentStep) return { ...step, status: 'complete' };
                return step;
            }));

            if (currentStep >= steps.length) {
                clearInterval(interval);
                setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
                setIsComplete(true);
                setIsUploading(false);
            }
            currentStep++;
        }, 2000);
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Upload Learning Material</h1>
                <p className="text-lg text-slate-600">
                    Transform any text, PDF, or video into a custom sign language lesson powered by our AI Avatar.
                </p>
            </div>

            {!isUploading && !isComplete ? (
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
                                        {isComplete ? "Processing Complete" : "AI is converting your material..."}
                                    </p>
                                </div>
                            </div>
                            {isComplete && <CheckCircle size={24} className="text-teal-500" fill="currentColor" />}
                        </div>

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
                                            step.status === 'processing' ? <Clock size={14} className="animate-spin" /> :
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

                        {isComplete && (
                            <div className="pt-8 border-t border-slate-100">
                                <Button size="xl" className="w-full flex items-center justify-center gap-3">
                                    Open AI Lesson <ArrowRight size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {!isComplete && (
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
