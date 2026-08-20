import React, { useState } from 'react';
import { 
  ChevronLeft, Zap, Mic, MicOff, Users, MessageSquare, 
  HelpCircle as QuestionIcon, FileUp, Trophy, Settings, 
  User, CheckCircle2, FileText, Camera as CameraIcon, ArrowRight,
  Coffee
} from 'lucide-react';
import { MindRefreshModal } from '../MindRefreshModal';

interface StudyRoomViewProps {
  currentRoom: any;
  setView: (view: any) => void;
  setIsGameZoneOpen: (open: boolean) => void;
  toggleVoice: () => void;
  isVoiceEnabled: boolean;
  activeVoiceUsers: any[];
  roomTab: 'chat' | 'questions' | 'resources' | 'quiz' | 'settings';
  setRoomTab: (tab: 'chat' | 'questions' | 'resources' | 'quiz' | 'settings') => void;
  roomMessages: any[];
  userName: string;
  postRoomQuestion: (q: string) => void;
  roomQuestions: any[];
  answerRoomQuestion: (id: string, a: string) => void;
  selectedNote: any;
  shareRoomResource: (title: string, type: string, content: string) => void;
  roomResources: any[];
  setSelectedNote: (note: any) => void;
  startGroupQuiz: () => void;
  roomQuizScores: any[];
  roomSettings: any;
  achievements: any[];
  sendRoomMessage: (msg: string) => void;
  updateRoomSettings: (settings: any) => void;
}

export const StudyRoomView: React.FC<StudyRoomViewProps> = ({
  currentRoom,
  setView,
  setIsGameZoneOpen,
  toggleVoice,
  isVoiceEnabled,
  activeVoiceUsers,
  roomTab,
  setRoomTab,
  roomMessages,
  userName,
  postRoomQuestion,
  roomQuestions,
  answerRoomQuestion,
  selectedNote,
  shareRoomResource,
  roomResources,
  setSelectedNote,
  startGroupQuiz,
  roomQuizScores,
  roomSettings,
  achievements,
  sendRoomMessage,
  updateRoomSettings
}) => {
  const [showBreakModal, setShowBreakModal] = useState(false);
  if (!currentRoom) return null;

  return (
    <div className="min-h-full flex flex-col bg-app-bg">
      {/* Header */}
      <div className="p-6 bg-app-card border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
            <ChevronLeft size={28} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-app-text">{currentRoom.name}</h1>
            <div className="flex items-center gap-2 text-xs text-app-text-muted">
              <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md font-bold">{currentRoom.code}</span>
              <span>•</span>
              <span>{currentRoom.subject}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBreakModal(true)}
            className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-2 hover:bg-amber-100 transition-colors"
            title="Mind Refresh Break"
          >
            <Coffee size={20} />
            <span className="text-xs font-bold hidden sm:inline">Break Lo-Fi</span>
          </button>
          <button 
            onClick={() => setIsGameZoneOpen(true)}
            className="p-3 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center gap-2 hover:bg-amber-200 transition-colors"
          >
            <Zap size={20} />
            <span className="text-xs font-bold hidden sm:inline">Game Zone</span>
          </button>
          <button 
            onClick={toggleVoice}
            className={`p-3 rounded-2xl flex items-center gap-2 transition-all ${
              isVoiceEnabled 
                ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                : 'bg-app-bg text-app-text-muted border border-app-border'
            }`}
          >
            {isVoiceEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            <span className="text-xs font-bold hidden sm:inline">{isVoiceEnabled ? 'Voice On' : 'Join Voice'}</span>
          </button>
          <div className="flex items-center gap-2 text-app-text-muted">
            <Users size={20} />
            <span className="text-sm font-bold">{activeVoiceUsers.length + (isVoiceEnabled ? 1 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-app-border bg-app-card">
        {[
          { id: 'chat', icon: <MessageSquare size={18} />, label: 'Chat' },
          { id: 'questions', icon: <QuestionIcon size={18} />, label: 'Questions' },
          { id: 'resources', icon: <FileUp size={18} />, label: 'Resources' },
          { id: 'quiz', icon: <Trophy size={18} />, label: 'Group Quiz' },
          { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoomTab(tab.id as any)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              roomTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-app-text-muted'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 pb-32">
        {roomTab === 'chat' && (
          <div className="space-y-4">
            {roomMessages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.user_name === userName ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-app-text-muted uppercase">{msg.user_name}</span>
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] ${
                  msg.user_name === userName ? 'bg-indigo-600 text-white' : 'bg-app-card border border-app-border text-app-text'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {roomTab === 'questions' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-app-card border border-app-border mb-6">
              <h3 className="font-bold text-app-text mb-4">Ask a Question</h3>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 p-4 bg-app-bg rounded-2xl outline-none text-app-text"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      postRoomQuestion(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
            {roomQuestions.map(q => (
              <div key={q.id} className="p-6 rounded-3xl bg-app-card border border-app-border space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User size={16} />
                    </div>
                    <span className="font-bold text-app-text">{q.user_name}</span>
                  </div>
                  <span className="text-[10px] text-app-text-muted uppercase">{new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-app-text font-medium">{q.question}</p>
                {q.answer ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-bold uppercase">Answered by {q.answered_by}</span>
                    </div>
                    <p className="text-sm text-emerald-900">{q.answer}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Type your answer..."
                      className="flex-1 p-3 bg-app-bg rounded-xl text-sm outline-none text-app-text"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          answerRoomQuestion(q.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {roomTab === 'resources' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => {
                  if (selectedNote) {
                    shareRoomResource(selectedNote.title, 'note', selectedNote.content);
                  } else {
                    console.log("Select a note from your library first!");
                  }
                }}
                className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex flex-col items-center gap-2"
              >
                <FileText size={24} />
                <span className="text-xs font-bold uppercase">Share Note</span>
              </button>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        shareRoomResource(file.name, 'image', base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex flex-col items-center gap-2"
              >
                <CameraIcon size={24} />
                <span className="text-xs font-bold uppercase">Share Image</span>
              </button>
            </div>
            {roomResources.map(res => (
              <div key={res.id} className="p-5 rounded-3xl bg-app-card border border-app-border flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  res.type === 'note' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {res.type === 'note' ? <FileText size={24} /> : <CameraIcon size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-app-text">{res.title}</h4>
                  <p className="text-xs text-app-text-muted">Shared by {res.user_name}</p>
                </div>
                <button 
                  onClick={() => {
                    if (res.type === 'note') {
                      setSelectedNote({ id: res.id, title: res.title, content: res.content, subject_id: '', summary: '', created_at: res.created_at });
                      setView('note');
                    }
                  }}
                  className="p-2 text-indigo-600"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {roomTab === 'quiz' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[40px] bg-indigo-600 text-white shadow-xl shadow-indigo-200 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-white/50" />
              <h2 className="text-2xl font-bold mb-2">Group Challenge</h2>
              <p className="text-white/80 text-sm mb-6">Start a quiz for everyone in the room. Who will get the highest score?</p>
              <button 
                onClick={startGroupQuiz}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg"
              >
                Start Group Quiz
              </button>
            </div>

            {roomQuizScores.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest mb-4">Leaderboard</h3>
                <div className="space-y-2">
                  {roomQuizScores.map((score, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-app-card border border-app-border">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-600' : 
                        i === 1 ? 'bg-slate-100 text-slate-600' :
                        i === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-app-bg text-app-text-muted'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="flex-1 font-bold text-app-text">{score.user_name}</span>
                      <span className="text-indigo-600 font-bold">{score.score} pts</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {roomTab === 'settings' && roomSettings && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest">Room Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-app-card border border-app-border">
                  <div>
                    <div className="font-bold text-app-text">Game Zone</div>
                    <div className="text-xs text-app-text-muted">Enable games during breaks</div>
                  </div>
                  <button 
                    onClick={() => {
                      updateRoomSettings({ games_enabled: !roomSettings.games_enabled });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${roomSettings.games_enabled ? 'bg-indigo-600' : 'bg-app-border'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${roomSettings.games_enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-app-card border border-app-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-app-text">Study Duration</div>
                    <div className="text-indigo-600 font-bold">{roomSettings.study_duration || 30}m</div>
                  </div>
                  <input 
                    type="range" min="5" max="60" step="5"
                    value={roomSettings.study_duration || 30}
                    onChange={(e) => {
                      updateRoomSettings({ study_duration: parseInt(e.target.value) });
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-app-card border border-app-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-app-text">Break Duration</div>
                    <div className="text-emerald-600 font-bold">{roomSettings.break_duration || 5}m</div>
                  </div>
                  <input 
                    type="range" min="1" max="15" step="1"
                    value={roomSettings.break_duration || 5}
                    onChange={(e) => {
                      updateRoomSettings({ break_duration: parseInt(e.target.value) });
                    }}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest">Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center text-center gap-2">
                    <Trophy size={24} className="text-amber-500" />
                    <div className="text-xs font-bold text-amber-900">{a.badge}</div>
                    <div className="text-[10px] text-amber-700">{a.user_name}</div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-app-text-muted text-sm italic">
                    No achievements yet. Start playing to earn badges!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar (only for chat tab) */}
      {roomTab === 'chat' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-app-card border-t border-app-border backdrop-blur-lg">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-4 bg-app-bg rounded-2xl outline-none text-app-text"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  sendRoomMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Mind Refresh Break Modal */}
      <MindRefreshModal
        isOpen={showBreakModal}
        onClose={() => setShowBreakModal(false)}
      />
    </div>
  );
};
