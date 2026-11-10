import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Clock, ArrowLeft } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  taskPhase: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  taskPhase,
  description,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="bg-[#131720] border-2 border-[#242c3d] p-10 sm:p-14 clip-corner-both space-y-6">
        <Badge variant="yellow" size="md">
          {taskPhase}
        </Badge>

        <div className="w-16 h-16 bg-[#0b0d10] border border-[#2d3748] clip-racing-tag mx-auto flex items-center justify-center text-[#ffe600]">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black italic uppercase text-white font-condensed">
          {title}
        </h1>

        <p className="text-base text-[#8e9bb0] max-w-lg mx-auto font-body leading-relaxed">
          {description}
        </p>

        <div className="pt-4 flex justify-center">
          <Link to="/">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO STOREFRONT GRID</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
