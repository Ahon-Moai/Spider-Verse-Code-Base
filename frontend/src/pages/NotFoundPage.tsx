import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <div className="w-20 h-20 bg-[#e10600]/20 border-2 border-[#e10600] clip-corner-tr mx-auto flex items-center justify-center text-[#e10600]">
        <AlertOctagon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-mono-telemetry uppercase text-[#e10600] font-bold tracking-widest">
          ERROR 404 // OFF-TRACK INCIDENT
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase text-white font-condensed">
          OFF THE RACING LINE
        </h1>
        <p className="text-base sm:text-lg text-[#8e9bb0] max-w-md mx-auto font-body">
          You've taken a detour into the gravel trap. The requested paddock page or vehicle telemetry cannot be found on the circuit.
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-4">
        <Link to="/">
          <Button variant="primary" size="lg">
            <ArrowLeft className="w-5 h-5" />
            <span>RETURN TO MAIN GRID</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
