
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, List, ChevronLeft, Sparkles, Download } from 'lucide-react';
import Button from '../components/Button';
import AvatarViewer from '../components/AvatarViewer';
import { useLocation, useNavigate } from 'react-router-dom';

const MOCK_LESSON = {
    id: '1',
    title: 'Introduction to Conversational ASL',
    duration: '15:20',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/seed/lesson/800/450',
    chapters: [
        { id: 'c1', title: 'Welcome and Basic Greetings', timestamp: 0 },
        { id: 'c2', title: 'The Alphabet and Numbers', timestamp: 120 },
    ]
};

const LessonViewer = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine data source: Real Pipeline or Mock
    const pipelineData = location.state?.pipelineResult?.pipeline_summary?.final_output;

    const [lessonData, setLessonData] = useState(null);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    useEffect(() => {
        if (pipelineData) {
            // Transform Pipeline Data to Lesson Format
            const chapters = pipelineData.video_chapters.map((ch, idx) => ({
                id: `ch_${idx}`,
                title: ch.chapter_title,
                timestamp: idx * 60, // approximate since we don't have absolute timestamps yet
                duration: ch.duration_seconds,
                video_url: ch.video_url,
                raw_data: ch
            }));

            const totalSeconds = pipelineData.metadata?.total_duration_seconds || 0;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

            setLessonData({
                id: 'generated_1',
                title: location.state?.pipelineResult?.pipeline_summary?.original_filename || "Generated Lesson",
                duration: `${minutes}:${seconds}`,
                thumbnail: 'https://picsum.photos/seed/ai_avatar/800/450', // Placeholder for now
                chapters: chapters
            });
            setCurrentChapter(chapters[0]);
        } else {
            // Fallback to Mock
            setLessonData(MOCK_LESSON);
            setCurrentChapter(MOCK_LESSON.chapters[0]);
        }
    }, [pipelineData]);

    if (!lessonData || !currentChapter) return <div className="p-10 text-center">Loading Lesson...</div>;

    const isGenerated = !!pipelineData;

    return (
        <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-white">
            {/* Chapter Sidebar */}
            <aside className="w-full lg:w-96 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-medium"
                    >
                        <ChevronLeft size={20} />
                        Back to Upload
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{lessonData.title}</h2>
                    <p className="text-slate-500 text-sm mt-1">Instructor: AI Avatar "Zephyr"</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
                        <List size={14} />
                        Lesson Chapters
                    </div>
                    {lessonData.chapters.map((chapter) => (
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
                                    {chapter.duration ? `${chapter.duration.toFixed(1)}s` : '02:00'}
                                </span>
                            </div>
                            <div className={`text-xs ${currentChapter.id === chapter.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                                {currentChapter.id === chapter.id ? 'Currently Selected' : 'Click to jump'}
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
                        <Sparkles className="absolute -bottom-4 -right-4 text-indigo-400/20 w-24 h-24" />
                    </div>
                </div>
            </aside>

            {/* Video Content Area */}
            <main className="flex-1 flex flex-col p-6 lg:p-10 bg-slate-50/30">
                {/* Main Video Player */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">

                    {isGenerated ? (
                        <div className="w-full max-w-5xl aspect-video relative">
                            <AvatarViewer motionUrl={currentChapter.video_url} />
                        </div>
                    ) : (
                        // Fallback Video Player for Mock
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-[40px] shadow-2xl relative overflow-hidden group ring-8 ring-white">
                            <img
                                src={lessonData.thumbnail}
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
                        </div>
                    )}

                    {/* Context Info */}
                    <div className="w-full max-w-5xl bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Active Chapter: {currentChapter.title}</h3>
                            <p className="text-slate-500 max-w-xl">
                                {isGenerated
                                    ? "This lesson was AI-generated from your uploaded document. The 3D movements are calculated in real-time from our pose engine."
                                    : "This is a sample chapter demonstrating the lesson viewer interface."}
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
