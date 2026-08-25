import { useState } from 'react';
import { Bot, Sparkles, Send, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function AiKaderAssistant() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      const res = await api.post('/ai/assistant', {
        task: 'kader_chat',
        prompt: prompt.trim()
      });
      setResponse(res.data.reply);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghubungi asisten AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 relative overflow-hidden mb-8 shadow-sm">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Bot className="w-32 h-32 text-indigo-500" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Si Posya (Asisten Ahli)</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tanya panduan Kemenkes/IDAI, mitos kesehatan, atau minta saran analisis balita secara cepat.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setPrompt("Analisis bayi laki-laki 8 bulan, BB 7.2kg, TB 68cm")} className="text-[10px] font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors">Analisis BB/TB</button>
            <button onClick={() => setPrompt("Bagaimana saran untuk ibu yang bayinya GTM saat tumbuh gigi?")} className="text-[10px] font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors">Tanya Gejala</button>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col">
          <form onSubmit={handleAsk} className="relative flex items-center mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ketik pertanyaan atau data pasien di sini..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-4 pr-14 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:text-white resize-none shadow-sm min-h-[50px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {(response || error) && (
            <div className={cn(
              "p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm border",
              error 
                ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" 
                : "bg-white text-slate-700 border-indigo-100 dark:bg-slate-900 dark:text-slate-300 dark:border-indigo-900/30"
            )}>
              {error || response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
