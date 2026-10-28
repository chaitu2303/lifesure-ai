import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  User,
  Shield,
  Sparkles,
  MessageSquare,
  Share2,
  FileText,
  Clock
} from 'lucide-react';

interface RoomProps {
  appointmentCode: string;
  advisorName?: string;
  topic?: string;
  onLeaveRoom: () => void;
}

interface ChatMsg {
  sender: 'advisor' | 'user';
  name: string;
  text: string;
  time: string;
}

export const SimulatedVideoRoom: React.FC<RoomProps> = ({
  appointmentCode,
  advisorName = 'Priya Sharma',
  topic = 'Comprehensive Financial Protection Review',
  onLeaveRoom,
}) => {
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [screenShareActive, setScreenShareActive] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(75); // e.g. 10:15 min

  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [inputMsg, setInputMsg] = useState<string>('');

  // Initial messages matching Screen 8 in reference image
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'advisor',
      name: 'Priya Sharma',
      text: 'Based on your profile, a term cover for 20 years looks suitable.',
      time: '10:14 AM',
    },
    {
      sender: 'user',
      name: 'Chaitanya',
      text: 'What if I increase my cover to ₹1.5 crore?',
      time: '10:15 AM',
    },
    {
      sender: 'advisor',
      name: 'Priya Sharma',
      text: 'That would provide additional security for your long-term goals. Let me show you an updated projection.',
      time: '10:15 AM',
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg.trim();
    const newMsg: ChatMsg = {
      sender: 'user',
      name: 'Chaitanya',
      text: userText,
      time: 'Now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Dynamic advisor simulated reply
    setTimeout(() => {
      let reply = 'Great question. With your current ₹60,000 monthly living budget, that will ensure zero shortfall even under 7% inflation.';
      if (userText.toLowerCase().includes('rider') || userText.toLowerCase().includes('health') || userText.toLowerCase().includes('critical')) {
        reply = 'Adding a Critical Illness rider gives you an accelerated lump-sum payout without disturbing your basic family life cover.';
      } else if (userText.toLowerCase().includes('ulip') || userText.toLowerCase().includes('investment')) {
        reply = 'A Term + Mutual Fund strategy typically yields better compounding than ULIPs due to lower recurring mortality and management fees.';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'advisor',
          name: 'Priya Sharma',
          text: reply,
          time: 'Now',
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070C18] text-white flex flex-col font-sans">
      
      {/* Top Video Header matching Screen 8 in Reference Image */}
      <header className="h-14 px-6 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-white">
              Consultation with Priya Sharma
            </span>
            <span className="text-slate-400 font-normal">
              (Certified Financial Advisor)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTimer(elapsedSec)}</span>
          </div>

          <button
            onClick={onLeaveRoom}
            className="px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Leave Call
          </button>
        </div>
      </header>

      {/* Main Split: Live Video (Left) + Chat Panel (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* LEFT: Live Video Feed & User Inset Video */}
        <div className="flex-1 relative bg-black flex flex-col items-center justify-center p-4">
          
          {/* Priya Sharma Main Video Container */}
          <div className="relative w-full h-full max-h-[750px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
            
            <img 
              src="./images/advisor_priya.jpg" 
              alt="Priya Sharma" 
              className="w-full h-full object-cover object-center" 
            />

            {/* Subtle name badge overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Priya Sharma (CFP®)</span>
            </div>

            {/* User Camera Inset Video (Bottom Right) matching Screen 8 */}
            <div className="absolute bottom-6 right-6 w-36 h-28 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl z-10 flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                C
              </div>
              <span className="text-[10px] text-slate-300 font-semibold mt-1">
                Chaitanya (You)
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">
                {videoActive ? 'HD Video Active' : 'Camera Muted'}
              </span>
            </div>

            {/* Bottom Call Controls Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-black/70 backdrop-blur-lg px-5 py-2.5 rounded-full border border-white/10 shadow-2xl z-10">
              
              {/* Mic toggle */}
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3 rounded-full transition-all ${
                  micActive 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Video toggle */}
              <button
                onClick={() => setVideoActive(!videoActive)}
                className={`p-3 rounded-full transition-all ${
                  videoActive 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* Screen share */}
              <button
                onClick={() => setScreenShareActive(!screenShareActive)}
                className={`p-3 rounded-full transition-all ${
                  screenShareActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* End Call Button (Red Circle) */}
              <button
                onClick={onLeaveRoom}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 transition-transform active:scale-95"
                title="End Consultation"
              >
                <PhoneOff className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT: Interactive Chat Panel matching Screen 8 */}
        <div className="w-full lg:w-96 bg-[#0B132B] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          
          {/* Chat Header Tabs */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Key Notes
              </button>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Encrypted</span>
            </span>
          </div>

          {activeTab === 'chat' ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0 text-xs">
                {messages.map((m, idx) => {
                  const isAdvisor = m.sender === 'advisor';
                  return (
                    <div 
                      key={idx}
                      className={`flex flex-col ${isAdvisor ? 'items-start' : 'items-end'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono mb-1 px-1">
                        {m.name} &bull; {m.time}
                      </span>
                      <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        isAdvisor
                          ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                          : 'bg-[#1D4ED8] text-white rounded-tr-sm'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-900/50 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
                <button
                  onClick={() => setInputMsg('What about inflation on education?')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
                >
                  Education Inflation?
                </button>
                <button
                  onClick={() => setInputMsg('Can I add a Critical Illness rider?')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
                >
                  Critical Illness Rider?
                </button>
                <button
                  onClick={() => setInputMsg('Why not endowment plans?')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap"
                >
                  Term vs Endowment?
                </button>
              </div>

              {/* Input Bar matching Screen 8 */}
              <div className="p-3 border-t border-slate-800 flex items-center space-x-2 bg-slate-900">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-800 text-white placeholder-slate-400 text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none focus:border-[#1D4ED8]"
                />
                <button
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Key Notes View */
            <div className="flex-1 p-4 space-y-4 text-xs text-slate-300 overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-blue-400">Baseline Cover</span>
                <div className="font-mono text-sm font-bold text-white">₹ 1,00,00,000 Total Need</div>
                <div className="text-[11px] text-slate-400">Net Additional Cover Gap: ₹ 65,00,000</div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-white">Advisor Takeaways</h5>
                <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                  <li>Pure term insurance is optimal for your age (28) and young family.</li>
                  <li>Mortgage payoff balance (₹ 25 Lakhs) should be ring-fenced.</li>
                  <li>Review cover every 3 years or after major life milestones.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
