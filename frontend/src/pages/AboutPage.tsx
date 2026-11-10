import React from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Award, Flame, Target } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Mission */}
      <div className="relative bg-[#131720] border-2 border-[#242c3d] p-8 sm:p-14 clip-corner-both overflow-hidden">
        <div className="absolute inset-0 bg-halftone-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="red" size="md">
            PADDOCK MANIFESTO
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase text-white tracking-tight font-condensed">
            THE SPIDER VERSE <br />
            <span className="text-[#ffe600]">ENGINEERING STORY</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#a0aec0] font-body leading-relaxed">
            Born out of a relentless passion for Grand Prix aerodynamic excellence and the boundless imagination of superhero comic universes, <strong className="text-white">Spider Verse</strong> builds Formula 1 scale diecast toys that belong on the winner’s podium.
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div>
        <SectionHeading
          tag="CORE DOCTRINE"
          title="HOW WE FORGE THE GRID"
          subtitle="Three engineering pillars behind every single model that rolls out of our workshop."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#131720] border border-[#242c3d] p-8 clip-corner-tr space-y-4">
            <div className="w-12 h-12 bg-[#e10600]/20 border border-[#e10600] clip-racing-tag flex items-center justify-center text-[#e10600]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white font-condensed">
              WIND-TUNNEL PRECISION
            </h3>
            <p className="text-sm text-[#8e9bb0] font-body leading-relaxed">
              Every curve, floor vortex generator, front splitter, and rear diffuser is cast to mirror full-scale telemetry physics.
            </p>
          </div>

          <div className="bg-[#131720] border border-[#242c3d] p-8 clip-corner-tr space-y-4">
            <div className="w-12 h-12 bg-[#ffe600]/20 border border-[#ffe600] clip-racing-tag flex items-center justify-center text-[#ffe600]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white font-condensed">
              COMIC HERO ENERGY
            </h3>
            <p className="text-sm text-[#8e9bb0] font-body leading-relaxed">
              We break traditional motorsport minimalism by injecting vibrant Marvel-inspired graphic liveries, halftone textures, and electric accents.
            </p>
          </div>

          <div className="bg-[#131720] border border-[#242c3d] p-8 clip-corner-tr space-y-4">
            <div className="w-12 h-12 bg-[#00d2ff]/20 border border-[#00d2ff] clip-racing-tag flex items-center justify-center text-[#00d2ff]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white font-condensed">
              ZAMAK-5 HEAVY DIECAST
            </h3>
            <p className="text-sm text-[#8e9bb0] font-body leading-relaxed">
              No flimsy hollow plastics. We utilize automotive grade Zamak-5 zinc diecast alloy for authentic collector weight and durability.
            </p>
          </div>
        </div>
      </div>

      {/* Workshop & HQ */}
      <div className="bg-[#0e121a] border border-[#242c3d] p-8 sm:p-12 clip-corner-tr flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <h3 className="text-3xl font-black italic uppercase text-white font-condensed">
            READY TO JOIN THE CHAMPIONSHIP?
          </h3>
          <p className="text-base text-[#8e9bb0] font-body">
            Browse our full fleet of scale vehicles or speak with our pit crew for special collection queries.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/products">
            <Button variant="primary" size="lg">
              VIEW FLEET
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">
              CONTACT CREW
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
