import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProducts,
  getHomepageData,
  Product,
  HomepageData,
} from '../api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StatBar } from '../components/ui/StatBar';
import { ProductCard } from '../components/ui/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Zap,
  Gauge,
  ChevronRight,
  HelpCircle,
  Quote,
  Flame,
  ArrowRight,
  Flag,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cmsData, setCmsData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [prodList, homeCms] = await Promise.allSettled([
          getProducts(),
          getHomepageData(),
        ]);

        if (isMounted) {
          if (prodList.status === 'fulfilled') {
            setProducts(prodList.value);
          }
          if (homeCms.status === 'fulfilled') {
            setCmsData(homeCms.value);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load telemetry grid');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION: F1 Meets Marvel Comic Shockwave */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-28 border-b border-[#202838] bg-carbon-pattern">
        {/* Halftone Marvel Background Layer */}
        <div className="absolute inset-0 bg-halftone-pattern opacity-25 pointer-events-none" />

        {/* Angled Red Comic Strike */}
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-gradient-to-br from-[#e10600]/30 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#ffe600]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="red" size="md">
                  CHAMPIONSHIP APEX SPEC
                </Badge>
                <span className="text-xs font-mono-telemetry text-[#ffe600] uppercase font-bold tracking-widest flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> F1 DIECAST X HEROIC ACTION
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic tracking-tight text-white uppercase leading-[0.95]">
                UNLEASH THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e10600] via-[#ff3b36] to-[#ffe600] drop-shadow-[0_4px_16px_rgba(225,6,0,0.4)]">
                  SPEED DIMENSION
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#a0aec0] max-w-xl font-body font-medium leading-relaxed">
                Welcome to <strong className="text-white">Spider Verse</strong>. We craft and curate championship-grade Formula 1 scale diecast cars supercharged with pulse-pounding comic energy, authentic race telemetry, and heroic aerodynamics.
              </p>

              {/* Telemetry Action Cluster */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/products">
                  <Button variant="primary" size="lg">
                    <span>EXPLORE GRID</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/collections/hero-editions">
                  <Button variant="outline" size="lg">
                    <span>HERO EDITIONS</span>
                    <Flame className="w-5 h-5 text-[#ffe600]" />
                  </Button>
                </Link>
              </div>

              {/* Telemetry Micro Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#202736]">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono-telemetry text-white">
                    1:18
                  </div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    DIECAST RATIO
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono-telemetry text-[#ffe600]">
                    340+
                  </div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    KM/H SPEED SPEC
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono-telemetry text-[#00d2ff]">
                    100%
                  </div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    METAL CHASSIS
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual Panel: Comic-Angled Car Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-[#131722] border-2 border-[#2b3548] p-6 clip-corner-both shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {/* Comic Halftone Header Stripe */}
                <div className="flex items-center justify-between pb-4 border-b border-[#202736] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#e10600] inline-block clip-racing-tag" />
                    <span className="text-xs font-mono-telemetry font-bold text-white tracking-widest">
                      TELEMETRY V4.2 ACTIVE
                    </span>
                  </div>
                  <span className="text-xs font-mono-telemetry text-[#ffe600] font-bold">
                    P1 LEADER
                  </span>
                </div>

                {/* Stylized Hero Vehicle Graphic */}
                <div className="aspect-[16/10] bg-[#090b0e] border border-[#1b2230] p-4 flex flex-col items-center justify-center relative overflow-hidden clip-corner-tr group">
                  <div className="absolute inset-0 speed-stripes opacity-30 pointer-events-none" />

                  {/* SVG Hero F1 Car Drawing */}
                  <svg
                    viewBox="0 0 240 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-full h-auto text-white drop-shadow-[0_10px_20px_rgba(225,6,0,0.4)]"
                  >
                    {/* Front Aero Wing */}
                    <path d="M 10 65 L 45 60 L 55 55 L 25 55 Z" fill="#e10600" fillOpacity="0.8" stroke="#ff4d47" />
                    {/* Monocoque cockpit & Spider-accent livery */}
                    <path d="M 45 60 Q 95 55 135 40 Q 170 38 195 55 L 225 60 L 235 50 L 235 30 L 205 30" stroke="#00d2ff" strokeWidth="2.5" />
                    {/* Spider Web Pattern on Engine Cover */}
                    <path d="M 120 45 L 140 38 M 125 50 L 150 42 M 130 55 L 160 46" stroke="#ffe600" strokeWidth="1.5" />
                    {/* Halo Protection System */}
                    <path d="M 100 48 Q 115 35 125 46" stroke="#ffffff" strokeWidth="3" />
                    {/* Rear DRS Wing */}
                    <rect x="215" y="24" width="22" height="8" fill="#e10600" stroke="#ff4d47" />
                    <line x1="226" y1="32" x2="226" y2="60" stroke="#ffffff" strokeWidth="3" />
                    {/* Tires */}
                    <circle cx="60" cy="70" r="18" fill="#0b0d10" stroke="#333d4e" strokeWidth="5" />
                    <circle cx="60" cy="70" r="7" fill="#e10600" />
                    <circle cx="195" cy="70" r="19" fill="#0b0d10" stroke="#333d4e" strokeWidth="5" />
                    <circle cx="195" cy="70" r="8" fill="#ffe600" />
                  </svg>

                  <div className="absolute bottom-2 left-3 text-[10px] font-mono-telemetry text-[#8e9bb0]">
                    CHASSIS // SPIDER-APEX 01
                  </div>
                </div>

                {/* Telemetry Real-time Stat Bars */}
                <div className="mt-4 space-y-2.5">
                  <StatBar label="AERODYNAMIC DOWNFORCE" value={96} displayValue="1,650 KG" variant="red" />
                  <StatBar label="MAX ACCELERATION (0-100)" value={99} displayValue="1.95 SEC" variant="yellow" />
                  <StatBar label="DIECAST CASTING PURITY" value={94} displayValue="ZAMAK-5 ALLOY" variant="blue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY HIGHLIGHTS: Fast-Paced Track Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="RACE DIVISIONS"
          title="CHAMPIONSHIP CATEGORIES"
          subtitle="Explore miniature racing divisions engineered for serious diecast collectors and comic fans."
          action={
            <Link to="/products">
              <Button variant="ghost" size="sm">
                <span>VIEW ALL DIVISIONS</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '1:18 MASTER COLLECTOR',
              desc: 'High-detail cockpit, functional steering, serialized brass plaque.',
              tag: 'FLAGSHIP',
              category: '1:18 Scale',
              color: 'border-[#e10600] hover:border-[#ff3833]',
            },
            {
              title: '1:43 TRACK RACERS',
              desc: 'The official championship paddock scale with authentic race telemetry.',
              tag: 'PODIUM',
              category: '1:43 Scale',
              color: 'border-[#ffe600] hover:border-[#fff04d]',
            },
            {
              title: '1:64 POCKET SPEED',
              desc: 'Heavyweight zinc alloy pocket racers ready for high-speed play.',
              tag: 'STREET',
              category: '1:64 Scale',
              color: 'border-[#00d2ff] hover:border-[#38e0ff]',
            },
            {
              title: 'SPIDER-HERO LIVERY',
              desc: 'Exclusive superhero comic liveries forged on Formula 1 body chassis.',
              tag: 'SPECIAL SPEC',
              category: 'Hero Editions',
              color: 'border-[#e10600] hover:border-[#ffe600]',
            },
          ].map((cat, i) => (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(cat.category)}`}
              className={`p-6 bg-[#131720] border-2 ${cat.color} clip-corner-tr hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-8 h-8 speed-stripes opacity-40 pointer-events-none" />
              <div>
                <Badge variant={i % 2 === 0 ? 'red' : 'yellow'} size="sm">
                  {cat.tag}
                </Badge>
                <h3 className="mt-3 text-2xl font-black italic tracking-wide text-white group-hover:text-[#ffe600] transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm text-[#8e9bb0] font-body leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-mono-telemetry font-bold text-white group-hover:text-[#e10600]">
                <span>INSPECT FLEET</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED DIECAST PRODUCTS (API FETCHED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="STARTING GRID"
          title="FEATURED F1 MACHINES"
          subtitle="Precision diecast scale models hot off the paddock assembly line."
          action={
            <Link to="/products">
              <Button variant="outline" size="sm">
                <span>VIEW FULL CATALOG</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} variant="card" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#241315] border-2 border-[#e10600] p-8 text-center clip-corner-tr">
            <Flag className="w-10 h-10 text-[#e10600] mx-auto mb-3" />
            <h3 className="text-xl font-black italic text-white uppercase font-condensed">
              PADDOCK TELEMETRY WARNING
            </h3>
            <p className="text-sm text-[#a0aec0] mt-1">{error}</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                RETRY CONNECTION
              </Button>
            </div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-[#131720] border border-[#242c3d] p-12 text-center clip-corner-tr">
            <Gauge className="w-12 h-12 text-[#8e9bb0] mx-auto mb-3" />
            <h3 className="text-2xl font-black italic text-white uppercase font-condensed">
              NO MACHINES CURRENTLY ON GRID
            </h3>
            <p className="text-sm text-[#8e9bb0] mt-2">
              Our pit crew is assembling the next fleet of F1 toys. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. BRAND STATEMENT & MANIFESTO: F1 Meets Marvel */}
      <section className="bg-[#0e121a] border-y border-[#242c3d] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone-red opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ffe600] clip-racing-tag" />
              <span className="text-xs font-mono-telemetry uppercase tracking-widest text-[#ffe600] font-bold">
                THE SPIDER VERSE ORIGIN
              </span>
              <span className="w-2.5 h-2.5 bg-[#ffe600] clip-racing-tag" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black italic tracking-wide text-white uppercase">
              BRED FOR SPEED. <br />
              <span className="text-[#e10600]">POWERED BY HEROIC DRIVE.</span>
            </h2>

            <p className="text-[#8e9bb0] text-base sm:text-lg font-body leading-relaxed">
              We asked a simple question: What happens when the world’s most relentless engineering discipline—Formula 1—collides with the explosive, fearless dynamism of comic superheroes? Spider Verse is our answer: diecast collectables designed with authentic wind-tunnel downforce shapes, razor-sharp liveries, and uncompromising metal weight.
            </p>

            <div className="pt-4 flex justify-center">
              <Link to="/about">
                <Button variant="yellow" size="md">
                  <span>READ OUR FULL MANIFESTO</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PIT CREW FAQS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="PIT PROTOCOLS"
          title="FREQUENTLY ASKED QUESTIONS"
          subtitle="Everything you need to know about our F1 toys, materials, and delivery."
          align="center"
        />

        <div className="space-y-4">
          {(cmsData?.faqs && cmsData.faqs.length > 0
            ? cmsData.faqs
            : [
                {
                  id: 'faq-1',
                  question: 'ARE THESE TOYS MADE OF REAL DIECAST METAL?',
                  answer:
                    'Yes! Every F1 toy in our core collection is cast using high-purity Zamak-5 zinc alloy for heavy, substantial in-hand feel, combined with authentic rubber slick tires and ABS aerodynamic wings.',
                },
                {
                  id: 'faq-2',
                  question: 'WHAT SCALES ARE AVAILABLE IN THE SPIDER VERSE FLEET?',
                  answer:
                    'We offer three primary sizes: 1:18 Flagship Collector editions (25-30cm), 1:43 Grand Prix paddock racers (11-13cm), and 1:64 high-octane pocket speedsters (7-8cm).',
                },
                {
                  id: 'faq-3',
                  question: 'HOW FAST DOES THE PIT CREW DELIVER IN BANGLADESH?',
                  answer:
                    'Orders inside Dhaka city are delivered within 24 to 48 hours. Deliveries outside Dhaka take 2 to 4 business days via courier with real-time tracking.',
                },
                {
                  id: 'faq-4',
                  question: 'DO THE MODELS COME WITH COLLECTOR DISPLAY CASES?',
                  answer:
                    'All 1:18 and 1:43 models include an acrylic dust cover, custom telemetry timing plate, and serialized certificate of authenticity.',
                },
              ]
          ).map((faq) => (
            <details
              key={faq.id}
              className="group bg-[#131720] border border-[#242c3d] open:border-[#e10600] transition-colors clip-corner-tr p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-white font-condensed font-black italic uppercase text-lg sm:text-xl">
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-[#e10600] shrink-0" />
                  {faq.question}
                </span>
                <span className="text-[#8e9bb0] group-open:rotate-90 transition-transform font-mono-telemetry text-sm">
                  ▶
                </span>
              </summary>
              <p className="mt-4 text-[#8e9bb0] font-body text-base leading-relaxed pl-8 border-l border-[#242c3d]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. PILOT REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="PODIUM VERDICTS"
          title="COLLECTOR TESTIMONIALS"
          subtitle="Real reviews from Formula 1 aficionados and comic model builders."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(cmsData?.reviews && cmsData.reviews.length > 0
            ? cmsData.reviews.slice(0, 3)
            : [
                {
                  id: 'rev-1',
                  quote: 'INSANE WEIGHT AND TELEMETRY ACCURACY',
                  content:
                    'The 1:18 Spider-Apex model has incredible front-wing detailing. You can see the brake ducts and aerodynamic vortices. Superb collector item.',
                  author: 'Tariq A. // Dhaka',
                  rating: 5,
                  verified: 1,
                },
                {
                  id: 'rev-2',
                  quote: 'THE MARVEL ENERGY BLENDS PERFECTLY',
                  content:
                    'I collect both comic statues and motorsport diecasts. This is the first time someone nailed the crossover without making it look tacky. 10/10.',
                  author: 'Shaheen K. // Chittagong',
                  rating: 5,
                  verified: 1,
                },
                {
                  id: 'rev-3',
                  quote: 'SUPER FAST EXPRESS SHIPPING',
                  content:
                    'Arrived at my doorstep in Gulshan the next afternoon. The packaging had bubble corner guards—car arrived in mint condition.',
                  author: 'Farhan M. // Dhaka',
                  rating: 5,
                  verified: 1,
                },
              ]
          ).map((rev) => (
            <div
              key={rev.id}
              className="bg-[#131720] border border-[#242c3d] p-6 clip-corner-tr flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-[#e10600]/40 mb-3" />
                <h4 className="text-xl font-black italic uppercase text-white font-condensed">
                  "{rev.quote}"
                </h4>
                <p className="mt-3 text-sm text-[#8e9bb0] font-body leading-relaxed">
                  {rev.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1f2635] flex items-center justify-between text-xs font-mono-telemetry">
                <span className="text-white font-bold">{rev.author}</span>
                <span className="text-[#ffe600] flex items-center gap-1 font-bold">
                  ★ {rev.rating}.0 VERIFIED PILOT
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
