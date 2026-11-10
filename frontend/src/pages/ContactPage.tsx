import React, { useState } from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    pilotName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <SectionHeading
        tag="RADIO COMMUNICATOR"
        title="PIT STOP SUPPORT"
        subtitle="Need advice on scale sizing, model allocations, or track delivery status? Hail our crew."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#131720] border-2 border-[#242c3d] p-6 sm:p-10 clip-corner-tr">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#00e676]/20 border border-[#00e676] rounded-full mx-auto flex items-center justify-center text-[#00e676]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black italic uppercase text-white font-condensed">
                TRANSMISSION RECEIVED
              </h3>
              <p className="text-[#8e9bb0] max-w-md mx-auto font-body">
                Our pit crew engineer will review your message and reply via encrypted radio / email within 2-4 business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ pilotName: '', email: '', subject: '', message: '' });
                }}
              >
                SEND ANOTHER TRANSMISSION
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[#1f2635]">
                <MessageSquare className="w-5 h-5 text-[#e10600]" />
                <span className="text-xs font-mono-telemetry uppercase text-white font-bold">
                  PILOT TRANSMISSION CONSOLE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono-telemetry uppercase text-[#8e9bb0] mb-2">
                    PILOT CALLSIGN / NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pilotName}
                    onChange={(e) => setFormData({ ...formData, pilotName: e.target.value })}
                    placeholder="e.g. Lewis / Peter"
                    className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-2.5 text-white focus:outline-none focus:border-[#e10600] font-body"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-telemetry uppercase text-[#8e9bb0] mb-2">
                    PILOT EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pilot@speedway.com"
                    className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-2.5 text-white focus:outline-none focus:border-[#e10600] font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-telemetry uppercase text-[#8e9bb0] mb-2">
                  SUBJECT / TOPIC
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Custom 1:18 Livery Request"
                  className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-2.5 text-white focus:outline-none focus:border-[#e10600] font-body"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-telemetry uppercase text-[#8e9bb0] mb-2">
                  MESSAGE BRIEF *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your request..."
                  className="w-full bg-[#0b0d10] border border-[#2d3748] px-4 py-2.5 text-white focus:outline-none focus:border-[#e10600] font-body"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth>
                <Send className="w-4 h-4" />
                <span>TRANSMIT TO PIT CREW</span>
              </Button>
            </form>
          )}
        </div>

        {/* Paddock HQ Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#131720] border border-[#242c3d] p-8 clip-corner-tr space-y-6">
            <h3 className="text-2xl font-black italic uppercase text-white font-condensed border-b border-[#1f2635] pb-4">
              PADDOCK DIRECTORY
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#e10600]/10 border border-[#e10600]/30 clip-racing-tag flex items-center justify-center text-[#e10600] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    PADDOCK HEADQUARTERS
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Banani High Street, Block 11, Dhaka 1213, Bangladesh
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#ffe600]/10 border border-[#ffe600]/30 clip-racing-tag flex items-center justify-center text-[#ffe600] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    HOTLINE COMMUNICATOR
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    +880 1700-000000
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#00d2ff]/10 border border-[#00d2ff]/30 clip-racing-tag flex items-center justify-center text-[#00d2ff] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono-telemetry uppercase text-[#8e9bb0]">
                    DIRECT EMAIL DISPATCH
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    pitcrew@spiderverse.toys
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0d10] border border-[#242c3d] p-6 clip-corner-tr text-xs font-mono-telemetry text-[#8e9bb0] space-y-2">
            <div className="text-white font-bold uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00e676] rounded-full animate-pulse" />
              OPERATIONAL TIMING
            </div>
            <div>SATURDAY – THURSDAY: 10:00 AM – 08:00 PM (BST)</div>
            <div>FRIDAY: PIT LANE RACEDAY TESTING (ONLINE ORDERS ONLY)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
