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
  AlertCircle
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
  const [languageFilter, setLanguageFilter] = useState<string>('all');
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
          // Select first available date
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

  // Filtered advisors list
  const filteredAdvisors = advisors.filter((adv) => {
    if (specialtyFilter !== 'all') {
      const hasSpecialty = adv.specialties?.some((s) =>
        s.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
      if (!hasSpecialty) return false;
    }
    return true;
  });

  const handleConfirmBooking = async () => {
    if (!currentSlot) {
      setErrorMessage('Please select an available date and appointment slot.');
      return;
    }
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage('Please enter your full name, email address, and phone number.');
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
      // Fallback appointment code
      const fallbackAppt: Appointment = {
        id: Date.now(),
        appointment_code: `LW-APT-${Math.floor(100000 + Math.random() * 900000)}`,
        advisor_id: selectedAdvisorId,
        advisor_name: currentAdvisor?.name || 'Priya Sharma',
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-xl font-bold text-[#0B132B]">
                  Schedule a Consultation
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] text-[10px] font-mono font-bold">
                  Certified Fiduciary
                </span>
              </div>
              <p className="text-xs text-slate-500">
                15 SEBI-registered &amp; CFP® Advisors &bull; Zero Commission Incentives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!confirmedAppt ? (
          <div className="space-y-6">
            
            {/* Step 1: Select Advisor */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider flex items-center space-x-1.5">
                  <span>1. Choose Certified Advisor</span>
                  <span className="text-slate-400 font-normal">({filteredAdvisors.length} available)</span>
                </label>

                {/* Filter */}
                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white outline-none"
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
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#0B132B] truncate">{adv.name}</span>
                        <div className="flex items-center space-x-0.5 text-amber-500 text-[10px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold">{adv.rating}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{adv.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {adv.experience_years} yrs exp &bull; {adv.specialties?.[0] || 'Life Cover'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Available Dates & Time Slots */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3 border-t border-slate-100">
              
              {/* Dates Column (6 cols) */}
              <div className="md:col-span-6 space-y-2">
                <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider block">
                  2. Select Consultation Date (Oct 29 – Nov 7, 2026)
                </label>
                {slotsLoading ? (
                  <div className="text-xs text-slate-400 py-4 font-mono animate-pulse">
                    Loading slots from advisor_slots.csv...
                  </div>
                ) : uniqueDates.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
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
                          className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold border transition-all text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span>{dateStr}</span>
                          <Calendar className="w-3.5 h-3.5 opacity-80" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3">
                    No future open slots found for this advisor.
                  </div>
                )}
              </div>

              {/* Time Slots Column (6 cols) */}
              <div className="md:col-span-6 space-y-2">
                <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider block">
                  3. Select 30-Minute Time Slot
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
                              ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot.time_str}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-3">
                    Select a date on the left to view available 30-minute intervals.
                  </div>
                )}

                {/* Consultation Mode */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Consultation Format
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationMode('video')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                        consultationMode === 'video'
                          ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Consultation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationMode('phone')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all ${
                        consultationMode === 'phone'
                          ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone Call</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Client Info Inputs */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-[#0B132B] font-mono uppercase tracking-wider block">
                4. Your Contact Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <input
                type="text"
                placeholder="Consultation Topic (e.g. Life Insurance Needs & Home Loan Coverage)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
              />
            </div>

            {/* Hackathon Demonstration Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Hackathon Demonstration Notice: </strong>
              This consultation workflow simulates digital booking for TalentAP Mega Hackathon 2026 (Problem B2). No real-world external advisor is contacted. You can immediately enter the simulated video room upon confirmation.
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
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Booking Slot...' : 'Confirm Appointment'}</span>
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
                Your appointment with <span className="font-bold">{confirmedAppt.advisor_name || currentAdvisor?.name}</span> is scheduled for <span className="font-bold">{confirmedAppt.slot_time}</span>.
              </p>
              <div className="mt-2 font-mono text-xs font-bold text-emerald-900 bg-white/80 py-1.5 px-3.5 rounded-lg inline-block border border-emerald-200 shadow-xs">
                Booking Reference: {confirmedAppt.appointment_code}
              </div>
            </div>

            <div className="p-3 bg-white/70 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
              <div><strong>Client:</strong> {confirmedAppt.client_name} ({confirmedAppt.client_email})</div>
              <div><strong>Topic:</strong> {confirmedAppt.topic}</div>
              <div><strong>Format:</strong> {confirmedAppt.consultation_mode === 'video' ? 'Simulated HD Video Room' : 'Direct Phone Consultation'}</div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onJoinVideoRoom(
                    confirmedAppt.appointment_code, 
                    confirmedAppt.advisor_name || currentAdvisor?.name || 'Priya Sharma', 
                    confirmedAppt.topic
                  );
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Join Simulated Video Room (Demo)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
