
import React from 'react';
import { UploadCloud, MessageSquare, Play, Sparkles, BookOpen, Clock } from 'lucide-react';
import Button from '../components/Button';

const Dashboard = ({ setView }) => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100">
                    <Sparkles size={16} />
                    <span>AI-Powered Sign Learning</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
                    Break the silence with <span className="text-indigo-600">SignAI</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                    The all-in-one platform for hearing and speaking challenged users to learn sign language,
                    convert materials, and communicate seamlessly through artificial intelligence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button size="xl" onClick={() => setView('upload')}>
                        Upload Material
                    </Button>
                    <Button size="xl" variant="outline" onClick={() => setView('query')}>
                        Ask in Sign Language
                    </Button>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div
                    onClick={() => setView('learn')}
                    className="group cursor-pointer p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Learn Lessons</h3>
                    <p className="text-slate-600 mb-6">Master sign language with guided lessons featuring high-quality AI avatar videos.</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-4 transition-all">
                        Start Learning <Play size={16} fill="currentColor" />
                    </div>
                </div>

                <div
                    onClick={() => setView('query')}
                    className="group cursor-pointer p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <MessageSquare size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Sign to Text</h3>
                    <p className="text-slate-600 mb-6">Use your camera to sign, and our AI will translate it into text or spoken language instantly.</p>
                    <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-4 transition-all">
                        Try Now <Play size={16} fill="currentColor" />
                    </div>
                </div>

                <div
                    onClick={() => setView('content')}
                    className="group cursor-pointer p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Your Archive</h3>
                    <p className="text-slate-600 mb-6">Access your converted learning materials, custom lessons, and saved translations.</p>
                    <div className="flex items-center gap-2 text-slate-600 font-semibold group-hover:gap-4 transition-all">
                        View Content <Play size={16} fill="currentColor" />
                    </div>
                </div>
            </section>

            {/* Recent Activity / Stats */}
            <section className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Sparkles size={120} />
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <h2 className="text-4xl font-bold mb-6 tracking-tight">Your Progress</h2>
                        <div className="space-y-6">
                            <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Sign Proficiency</span>
                                    <span className="text-teal-400">72%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400 w-[72%]"></div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">Study Time</div>
                                        <div className="font-bold">12.5 hrs</div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/60">Signs Mastered</div>
                                        <div className="font-bold">450+</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="aspect-video bg-indigo-500/10 border border-white/10 rounded-3xl flex items-center justify-center p-8 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Play fill="white" size={32} className="ml-1" />
                                </div>
                                <p className="text-lg font-medium">Continue Learning: ASL Intermediate</p>
                                <p className="text-white/60">Lesson 4: Expressing Emotions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
