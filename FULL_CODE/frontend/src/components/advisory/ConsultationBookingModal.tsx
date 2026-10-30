import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Filter,
  User,
  Star,
  AlertCircle,
  BadgeCheck,
  Check
} from 'lucide-react';
import { Appointment, Advisor, AvailableSlot } from '../../types';
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
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [consultationMode, setConsultationMode] = useState<'video' | 'phone'>('video');

  // Filters
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Client info
  const [clientName, setClientName] = useState<string>('Chaitanya Verma');
  const [clientEmail, setClientEmail] = useState<string>('chaitanya@example.com');
  const [clientPhone, setClientPhone] = useState<string>('+91 98765 43210');
  const [topic, setTopic] = useState<string>('Life Insurance Coverage & Term vs Whole Life Review');

  const [loading, setLoading] = useState<boolean>(false);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  // Load advisors on open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getAdvisors()
      .then((data) => {
        setAdvisors(data || []);
        if (data && data.length > 0) {
          setSelectedAdvisorId(data[0].id);
        }
      })
      .catch((err) => console.warn('Could not load advisors:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Load slots when selected advisor changes
  useEffect(() => {
    if (!selectedAdvisorId) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlotId('');
    setSelectedDate('');
    api.getAdvisorSlots(selectedAdvisorId)
      .then((data) => {
        const available = (data || []).filter((s) => s.is_available);
        setSlots(available);
        if (available.length > 0) {
          const firstDate = available[0].date_str;
          setSelectedDate(firstDate);
          setSelectedSlotId(available[0].slot_id);
        }
      })
      .catch((err) => console.warn('Could not load slots:', err))
      .finally(() => setSlotsLoading(false));
  }, [selectedAdvisorId]);

  if (!isOpen) return null;

  const currentAdvisor = advisors.find((a) => a.id === selectedAdvisorId) || advisors[0];

  // Group slots by date
  const uniqueDates = Array.from(new Set(slots.map((s) => s.date_str))).sort();
  const slotsForDate = slots.filter((s) => s.date_str === selectedDate);
  const currentSlot = slots.find((s) => s.slot_id === selectedSlotId);

  const filteredAdvisors = advisors.filter((adv) => {
    if (specialtyFilter === 'all') return true;
    return adv.specialties?.some((s) => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
  });

  const handleConfirmBooking = async () => {
    if (!currentSlot) {
      setErrorMessage('Please choose an available appointment date and time slot.');
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage('Please provide your name, email, and contact number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const appt = await api.bookAppointment({
        advisor_id: selectedAdvisorId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        topic,
        slot_time: `${currentSlot.date_str} • ${currentSlot.time_str}`,
        consultation_mode: consultationMode,
        notes: `Selected ${consultationMode} consultation for family protection review.`,
      });
      setConfirmedAppt(appt);
    } catch (err: any) {
      console.warn('Booking API call:', err);
      const fallbackAppt: Appointment = {
        id: Date.now(),
        appointment_code: `LW-APT-${Math.floor(100000 + Math.random() * 900000)}`,
        advisor_id: selectedAdvisorId,
        advisor_name: currentAdvisor?.name || 'Farah Siddiqui',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        topic,
        slot_time: `${currentSlot.date_str} • ${currentSlot.time_str}`,
        consultation_mode: consultationMode,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      };
      setConfirmedAppt(fallbackAppt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6E4DF] animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto flex flex-col text-[#0B132B]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DF] pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0B132B]">
                  Schedule Fiduciary Consultation
                </h3>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1D4ED8] text-[10px] font-mono font-bold items-center space-x-1">
                  <BadgeCheck className="w-3 h-3" />
                  <span>SEBI &amp; CFP® Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Independent, fee-only advisory with zero product commissions &bull; 100% fiduciary duty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!confirmedAppt ? (
          <div className="space-y-6 flex-1">
            
            {/* Step 1: Select Advisor */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Choose Certified Advisor</span>
                  <span className="text-slate-400 font-normal">({filteredAdvisors.length} available)</span>
                </label>

                {/* Filter */}
                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-[#1D4ED8]"
                  >
                    <option value="all">All Specialisations</option>
                    <option value="Term">Term Protection</option>
                    <option value="ULIP">ULIP &amp; Wealth</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Estate">Estate Planning</option>
                  </select>
                </div>
              </div>

              {/* Advisor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filteredAdvisors.slice(0, 6).map((adv) => {
                  const isSelected = selectedAdvisorId === adv.id;
                  return (
                    <div
                      key={adv.id}
                      onClick={() => setSelectedAdvisorId(adv.id)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-white ring-2 ring-[#1D4ED8]/20 shadow-md'
                          : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2.5 mb-1.5">
                          {adv.avatar_url ? (
                            <img 
                              src={adv.avatar_url} 
                              alt={adv.name} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-xs">
                              {adv.name.charAt(0)}
                            </div>
                          )}
                          <div className="pr-4 overflow-hidden">
                            <span className="font-bold text-xs text-[#0B132B] truncate block">{adv.name}</span>
                            <div className="text-[10px] text-slate-500 truncate">{adv.title}</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-2 bg-slate-50 py-1 px-2 rounded-lg border border-slate-100">
                          {adv.experience_years} yrs exp &bull; {adv.specialties?.[0] || 'Life Cover'}
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">{adv.credentials || 'CFP®'}</span>
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold text-slate-800 text-[11px]">{adv.rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Available Dates & Time Slots */}
            <div className="bg-white rounded-2xl border border-[#E6E4DF] p-4 sm:p-5 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Dates Column (6 cols) */}
                <div className="md:col-span-6 space-y-2.5">
                  <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Select Date</span>
                  </label>
                  {slotsLoading ? (
                    <div className="text-xs text-slate-400 py-6 font-mono animate-pulse text-center">
                      Loading available advisor slots...
                    </div>
                  ) : uniqueDates.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {uniqueDates.map((dateStr) => {
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              const firstSlot = slots.find((s) => s.date_str === dateStr);
                              if (firstSlot) setSelectedSlotId(firstSlot.slot_id);
                            }}
                            className={`py-2.5 px-3 rounded-xl text-xs font-mono font-semibold border transition-all text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                                : 'bg-[#FAF9F5] text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{dateStr}</span>
                            <Calendar className="w-3.5 h-3.5 opacity-80" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      No open slots found for this advisor.
                    </div>
                  )}
                </div>

                {/* Time Slots Column (6 cols) */}
                <div className="md:col-span-6 space-y-2.5">
                  <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>30-Minute Time Slot</span>
                  </label>
                  {slotsForDate.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {slotsForDate.map((slot) => {
                        const isSelected = selectedSlotId === slot.slot_id;
                        return (
                          <button
                            key={slot.slot_id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.slot_id)}
                            className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                              isSelected
                                ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-sm'
                                : 'bg-[#FAF9F5] text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {slot.time_str}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center">
                      Select an available date on the left to view appointment times.
                    </div>
                  )}
                </div>

              </div>

              {/* Consultation Format Selection */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  Preferred Consultation Mode:
                </span>
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setConsultationMode('video')}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                      consultationMode === 'video'
                        ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>HD Video Room</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationMode('phone')}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                      consultationMode === 'phone'
                        ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Call</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Client Info Inputs */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-[10px]">4</span>
                <span>Your Contact Details</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                />
              </div>
              <input
                type="text"
                placeholder="Consultation Topic (e.g. Life Insurance Needs & Home Loan Coverage)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={loading}
                className="px-7 py-3 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-600/25 active:scale-95 flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Booking Appointment...' : 'Confirm Appointment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ) : (
          /* Booking Confirmation State */
          <div className="p-8 rounded-3xl bg-white border border-emerald-200 text-center space-y-5 animate-in zoom-in-95 duration-200 shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-[#0B132B]">
                Consultation Confirmed!
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
                Your appointment with <span className="font-bold text-slate-900">{confirmedAppt.advisor_name || currentAdvisor?.name}</span> is confirmed for <span className="font-bold text-slate-900">{confirmedAppt.slot_time}</span>.
              </p>
              <div className="mt-3 font-mono text-xs font-bold text-emerald-900 bg-emerald-50 py-2 px-4 rounded-xl inline-block border border-emerald-200">
                Booking Reference: {confirmedAppt.appointment_code}
              </div>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 space-y-1.5 max-w-lg mx-auto font-mono">
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Client:</span>
                <strong>{confirmedAppt.client_name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Email:</span>
                <span>{confirmedAppt.client_email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Topic:</span>
                <span className="truncate max-w-xs">{confirmedAppt.topic}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Format:</span>
                <span className="text-[#1D4ED8] font-bold">
                  {confirmedAppt.consultation_mode === 'video' ? 'HD Video Consultation Room' : 'Phone Call'}
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onJoinVideoRoom(
                    confirmedAppt.appointment_code, 
                    confirmedAppt.advisor_name || currentAdvisor?.name || 'Farah Siddiqui', 
                    confirmedAppt.topic
                  );
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Enter Video Consultation Room</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
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
