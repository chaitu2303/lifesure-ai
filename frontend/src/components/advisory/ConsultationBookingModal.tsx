import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Award,
  ArrowRight,
  Shield,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Appointment } from '../../types';
import { api } from '../../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinVideoRoom: (appointmentCode: string, advisorName: string, topic: string) => void;
}

export const ConsultationBookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onJoinVideoRoom,
}) => {
  // Calendar State matching Screen 5 in reference image
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [consultationMode, setConsultationMode] = useState<'video' | 'phone' | 'chat'>('video');
  
  // Client info
  const [clientName, setClientName] = useState<string>('Chaitanya Verma');
  const [clientEmail, setClientEmail] = useState<string>('chaitanya@example.com');
  const [clientPhone, setClientPhone] = useState<string>('+91 98765 43210');
  const [topic, setTopic] = useState<string>('Life Insurance Coverage & Term vs Whole Life Review');

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const timeSlots = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '04:00 PM',
    '06:00 PM',
  ];

  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const appt = await api.bookAppointment({
        advisor_id: 'adv-priya-sharma',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        topic,
        slot_time: `14 August 2024 &bull; ${selectedSlot}`,
        consultation_mode: consultationMode === 'chat' ? 'video' : consultationMode,
        notes: `Selected ${consultationMode} consultation for family protection review.`,
      });
      setConfirmedAppt(appt);
    } catch (err) {
      console.warn('Booking API fallback to simulation:', err);
      // Fallback local appointment
      const fakeAppt: Appointment = {
        id: Date.now(),
        appointment_code: `LS-AUG-${Math.floor(1000 + Math.random() * 9000)}`,
        advisor_id: 'adv-priya-sharma',
        advisor_name: 'Priya Sharma',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        topic,
        slot_time: `${selectedDay} August 2024 &bull; ${selectedSlot}`,
        consultation_mode: consultationMode === 'chat' ? 'video' : consultationMode,
        status: 'confirmed',
        notes: '',
        created_at: new Date().toISOString(),
      };
      setConfirmedAppt(fakeAppt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shrink-0">
              <img 
                src="./images/advisor_priya.jpg" 
                alt="Priya Sharma" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-xl font-bold text-[#0B132B]">
                  Book a Consultation
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] text-[10px] font-mono font-bold">
                  5/5
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Priya Sharma &bull; Certified Financial Advisor (CFP®)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!confirmedAppt ? (
          <div className="space-y-6">
            
            {/* Split Screen matching Screen 5 in Reference Image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* LEFT: August 2024 Calendar (7 cols) */}
              <div className="md:col-span-7 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[#0B132B]">
                    August 2024
                  </span>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 rounded hover:bg-slate-200 text-slate-500">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-slate-200 text-slate-500">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-[10px] font-mono font-semibold text-slate-400">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
                  {/* Empty offset days for Thursday start */}
                  <span />
                  <span />
                  <span />
                  <span />
                  
                  {daysInAugust.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#1D4ED8] text-white font-bold shadow-sm'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Available Slots & Mode (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#0B132B] block mb-2 font-mono">
                    Available Slots ({selectedDay} Aug)
                  </span>
                  <div className="space-y-1.5">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-semibold text-center border transition-all ${
                          selectedSlot === slot
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Mode Options matching reference */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#0B132B] block mb-2 font-mono">
                    Consultation Mode
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'video', label: 'Video Call', icon: Video },
                      { id: 'phone', label: 'Phone Call', icon: Phone },
                      { id: 'chat', label: 'Chat', icon: MessageSquare },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = consultationMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setConsultationMode(mode.id as any)}
                          className={`p-2 rounded-xl text-[10px] font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Client Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Full Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
              >
                <span>Confirm Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ) : (
          /* Booking Confirmation State */
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif text-xl font-bold text-emerald-950">
                Consultation Confirmed!
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Your appointment with <span className="font-bold">Priya Sharma</span> is scheduled for <span className="font-bold">{selectedDay} August 2024 at {selectedSlot}</span>.
              </p>
              <div className="mt-2 font-mono text-xs font-bold text-emerald-900 bg-white/70 py-1 px-3 rounded-lg inline-block border border-emerald-200">
                Code: {confirmedAppt.appointment_code}
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onJoinVideoRoom(confirmedAppt.appointment_code, 'Priya Sharma', topic);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Room Now (Demo)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
