import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function QrScannerModal({ 
  isOpen, 
  onClose, 
  onScanSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onScanSuccess: (text: string) => void; 
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // We delay slightly to allow DOM to render the #reader div
    const timer = setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
          onScanSuccess(decodedText);
        },
        (error) => {
          // Ignore warnings (e.g. no QR found in current frame)
        }
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-800">Scan QR Warga</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-emerald-200"></div>
          <p className="text-center text-sm font-medium text-slate-500 mt-4">
            Arahkan kamera ke QR Code milik Warga
          </p>
        </div>
      </div>
    </div>
  );
}
