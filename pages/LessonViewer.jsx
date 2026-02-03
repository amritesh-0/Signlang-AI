
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, List, ChevronLeft, Sparkles } from 'lucide-react';
import Button from '../components/Button';

const MOCK_LESSON = {
    id: '1',
    title: 'Introduction to Conversational ASL',
    duration: '15:20',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/seed/lesson/800/450',
    chapters: [
        { id: 'c1', title: 'Welcome and Basic Greetings', timestamp: 0 },
        { id: 'c2', title: 'The Alphabet and Numbers', timestamp: 120 },
        { id: 'c3', title: 'Common Sentences', timestamp: 350 },
        { id: 'c4', title: 'Asking Questions', timestamp: 600 },
        { id: 'c5', title: 'Practice Exercises', timestamp: 850 },
    ]
};

const LessonViewer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(MOCK_LESSON.chapters[0]);
    const [speed, setSpeed] = useState(1);

    return (
        <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-white">
            {/* Chapter Sidebar */}
            <aside className="w-full lg:w-96 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-medium">
                        <ChevronLeft size={20} />
                        Back to Lessons
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{MOCK_LESSON.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">Instructor: AI Avatar "Zephyr"</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
                        <List size={14} />
                        Lesson Chapters
                    </div>
                    {MOCK_LESSON.chapters.map((chapter) => (
                        <button
                            key={chapter.id}
                            onClick={() => setCurrentChapter(chapter)}
                            className={`
                w-full text-left p-4 rounded-2xl transition-all duration-200 border
                ${currentChapter.id === chapter.id
                                    ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50'
                                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}
              `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold ${currentChapter.id === chapter.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                    {chapter.title}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {Math.floor(chapter.timestamp / 60)}:{(chapter.timestamp % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className={`text-xs ${currentChapter.id === chapter.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                                {currentChapter.id === chapter.id ? 'Currently Playing' : 'Click to jump'}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-1">Weekly Quiz</h4>
                            <p className="text-sm text-indigo-100 mb-4">Test your knowledge on today's session.</p>
                            <Button size="sm" variant="accent" className="w-full">Start Quiz</Button>
                        </div>
                        {/* Fix: Sparkles is now imported */}
                        <Sparkles className="absolute -bottom-4 -right-4 text-indigo-400/20 w-24 h-24" />
                    </div>
                </div>
            </aside>

            {/* Video Content Area */}
            <main className="flex-1 flex flex-col p-6 lg:p-10 bg-slate-50/30">
                {/* Main Video Player */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-[40px] shadow-2xl relative overflow-hidden group ring-8 ring-white">
                        <img
                            src={MOCK_LESSON.thumbnail}
                            alt="Sign language avatar"
                            className="w-full h-full object-cover opacity-80"
                        />

                        {/* Overlay Controls (Simulated) */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-xl transform transition-transform active:scale-95"
                            >
                                {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                            </button>
                        </div>

                        {/* Bottom Controls Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="h-1.5 w-full bg-white/20 rounded-full mb-6 cursor-pointer overflow-hidden group/progress">
                                <div className="h-full bg-indigo-500 w-1/3 relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <button className="hover:text-indigo-400 transition-colors"><SkipBack fill="currentColor" size={20} /></button>
                                        <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-indigo-400 transition-colors">
                                            {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
                                        </button>
                                        <button className="hover:text-indigo-400 transition-colors"><SkipForward fill="currentColor" size={20} /></button>
                                    </div>
                                    <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                                        <button className="hover:text-indigo-400 transition-colors"><Volume2 size={20} /></button>
                                        <span className="text-sm font-medium opacity-80">04:20 / {MOCK_LESSON.duration}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSpeed(s => s === 2 ? 0.5 : s + 0.5)}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold tracking-tight transition-colors"
                                    >
                                        {speed}x
                                    </button>
                                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><Settings size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Context Info */}
                    <div className="w-full max-w-5xl bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Understanding "Greetings"</h3>
                            <p className="text-slate-500 max-w-xl">
                                This chapter focuses on the initial approach when meeting someone.
                                Pay close attention to facial expressions as they contribute significantly to the tone of the sign.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline">Download Transcript</Button>
                            <Button>Practice Now</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LessonViewer;
