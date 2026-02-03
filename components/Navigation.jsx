
import React from 'react';
import { Home, PlayCircle, MessageSquare, Folder, UploadCloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
        { id: 'learn', label: 'Learn', icon: PlayCircle, path: '/lesson' },
        { id: 'query', label: 'Ask (Sign)', icon: MessageSquare, path: '/query' },
        { id: 'content', label: 'My Content', icon: Folder, path: '/content' },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => navigate('/')}
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
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${active
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon size={18} />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    );
                })}
                <button
                    onClick={() => navigate('/upload')}
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
