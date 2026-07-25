import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PwaInstallBanner({ appName = "SIPO" }: { appName?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a few seconds before showing to not overwhelm the user immediately
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white/95 backdrop-blur-md dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex items-center gap-4 sm:max-w-md w-full">
        <div className="w-12 h-12 flex-shrink-0 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center">
          <img src="/favicon.svg" alt="Logo" className="w-8 h-8 drop-shadow-sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Pasang {appName} di HP</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            Akses lebih cepat, layar penuh, & hemat kuota layaknya aplikasi asli!
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-violet-600/20"
          >
            Pasang
          </button>
          <button 
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
