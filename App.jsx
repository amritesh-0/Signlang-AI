
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import LessonViewer from './pages/LessonViewer';
import QueryInterface from './pages/QueryInterface';
import UploadPage from './pages/Upload';

const App = () => {
    const [currentView, setCurrentView] = useState('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setView={setCurrentView} />;
            case 'learn':
                return <LessonViewer />;
            case 'query':
                return <QueryInterface />;
            case 'upload':
                return <UploadPage />;
            case 'content':
                return (
                    <div className="max-w-7xl mx-auto px-6 py-12 text-center space-y-8">
                        <h1 className="text-3xl font-bold">My Archive</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                                    <div className="aspect-video bg-slate-100 rounded-2xl mb-4 overflow-hidden">
                                        <img src={`https://picsum.photos/seed/${i}/400/225`} className="w-full h-full object-cover" alt="Saved material" />
                                    </div>
                                    <h3 className="font-bold text-lg">Biology Chapter {i}</h3>
                                    <p className="text-slate-500 text-sm mb-4">Converted 2 days ago • 12:00 duration</p>
                                    <button className="text-indigo-600 font-semibold text-sm hover:underline">Watch Lesson</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <Dashboard setView={setCurrentView} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
            <Navigation currentView={currentView} setView={setCurrentView} />
            <main className="transition-all duration-300">
                {renderView()}
            </main>

            {/* Footer (Simplified & Accessible) */}
            <footer className="w-full py-12 px-6 border-t border-slate-100 mt-20 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
                    <span className="font-bold tracking-tight text-slate-900">SignAI</span>
                </div>
                <p className="text-slate-500 text-sm">
                    Designed for accessibility. Compliance: WCAG 2.1 AA.
                </p>
                <div className="flex justify-center gap-6 text-slate-400 font-medium text-sm">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Accessibility Policy</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
                </div>
            </footer>
        </div>
    );
};

export default App;
