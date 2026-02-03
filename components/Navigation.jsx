
import React from 'react';
import { Home, PlayCircle, MessageSquare, Folder, UploadCloud } from 'lucide-react';

const Navigation = ({ currentView, setView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'learn', label: 'Learn', icon: PlayCircle },
        { id: 'query', label: 'Ask (Sign)', icon: MessageSquare },
        { id: 'content', label: 'My Content', icon: Folder },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setView('dashboard')}
            >
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <span className="text-xl font-bold tracking-tighter">S</span>
                </div>
                <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    SignAI
                </span>
            </div>

            <div className="flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={18} />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    );
                })}
                <button
                    onClick={() => setView('upload')}
                    className="ml-4 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <UploadCloud size={18} />
                    <span className="hidden lg:inline">Upload</span>
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
