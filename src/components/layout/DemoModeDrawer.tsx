import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Check 
} from 'lucide-react';

export const DemoModeDrawer: React.FC = () => {
  const { resetDemoData, currentUser } = useEcoNexus();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Small, unobtrusive floating button at bottom-left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-xs transition-all hover:scale-105"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase System Status</span>
        </button>
      </div>

      {/* System Status Drawer */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Live Firebase Database Status"
        subtitle="Connected to production Firebase Project: econexus-25f65"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Real Firestore Collections Active</span>
            </div>
            <p className="text-emerald-700">
              All mock/fake data seeding has been disabled. The application reads and persists live documents directly to Cloud Firestore.
            </p>
            {currentUser && (
              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-slate-800 font-medium">
                <span>Active User: {currentUser.company}</span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">{currentUser.uid}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Refresh live collections from Firestore</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemoData();
                setIsOpen(false);
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Re-sync Collections
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
