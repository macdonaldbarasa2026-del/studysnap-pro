import React from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare, Users, Phone, Plus, Search, MoreVertical, ArrowLeft,
  Send, X, UserPlus, UsersRound, Video, Bell, CheckCheck, CirclePlus,
  MoreHorizontal, Trash2, Paperclip, Image as ImageIcon, Reply, Copy, Flag,
  Smile, ShieldCheck, Hash, UserRoundPlus
} from 'lucide-react';
import { auth } from '../../lib/firebase';

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
}

interface MessageItem {
  id: string;
  sender_name: string;
  text: string;
  created_at: string;
  room_id?: string | null;
  reply_to?: { id: string; sender_name: string; text: string };
  reactions?: Record<string, number>;
  attachment?: MessageAttachment;
}

const makeId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

const formatTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const StudySnapHeader = ({
  title,
  subtitle,
  onBack,
  onSearch,
  onMore,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
  showBack?: boolean;
}) => (
  <header className="shrink-0 bg-app-card/95 backdrop-blur-xl border-b border-app-border px-4 sm:px-6 pt-[calc(.8rem+var(--safe-top))] pb-3 flex items-center justify-between z-10">
    <div className="flex items-center gap-3 min-w-0">
      {showBack && onBack && (
        <button aria-label="Go back" onClick={onBack} className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-app-bg text-app-text-muted hover:text-app-text transition-colors shrink-0">
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-black text-app-text truncate">{title}</h2>
        {subtitle && <p className="text-[11px] font-semibold text-app-text-muted truncate">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      {onSearch && <button aria-label="Search" onClick={onSearch} className="w-11 h-11 rounded-2xl flex items-center justify-center text-app-text-muted hover:bg-app-bg hover:text-app-text"><Search size={20} /></button>}
      {onMore && <button aria-label="More options" onClick={onMore} className="w-11 h-11 rounded-2xl flex items-center justify-center text-app-text-muted hover:bg-app-bg hover:text-app-text"><MoreVertical size={20} /></button>}
    </div>
  </header>
);

const EmptyState = ({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) => (
  <div className="flex-1 flex items-center justify-center p-8 text-center">
    <div className="max-w-sm">
      <div className="mx-auto w-20 h-20 rounded-[2rem] bg-app-bg text-app-accent flex items-center justify-center mb-5">{icon}</div>
      <h3 className="text-xl font-black text-app-text">{title}</h3>
      <p className="text-sm text-app-text-muted mt-2 leading-relaxed">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  </div>
);

const Composer = ({ value, onChange, onSend, placeholder, replyTo, onCancelReply, onAttach, attachment, onRemoveAttachment }: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  replyTo?: MessageItem['reply_to'];
  onCancelReply?: () => void;
  onAttach?: () => void;
  attachment?: MessageAttachment;
  onRemoveAttachment?: () => void;
}) => (
  <div className="shrink-0 px-3 sm:px-5 pt-3 pb-[calc(.75rem+var(--safe-bottom))] bg-app-card border-t border-app-border">
    <div className="max-w-4xl mx-auto">
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-app-border bg-app-bg px-3 py-2">
          <Reply size={14} className="mt-0.5 text-app-accent shrink-0" />
          <div className="min-w-0 flex-1"><p className="text-[10px] font-black text-app-accent">Replying to {replyTo.sender_name}</p><p className="text-xs text-app-text-muted truncate">{replyTo.text}</p></div>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply" className="w-8 h-8 rounded-lg hover:bg-app-card"><X size={14}/></button>
        </div>
      )}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-app-border bg-app-bg px-3 py-2">
          {attachment.previewUrl ? <img src={attachment.previewUrl} alt="Attached image preview" className="w-10 h-10 rounded-lg object-cover"/> : <ImageIcon size={17} className="text-app-accent"/>}
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-app-text truncate">{attachment.name}</p><p className="text-[10px] text-app-text-muted">{Math.max(1, Math.round(attachment.size / 1024))} KB</p></div>
          <button type="button" onClick={onRemoveAttachment} aria-label="Remove attachment" className="w-8 h-8 rounded-lg hover:bg-app-card"><X size={14}/></button>
        </div>
      )}
      <div className="flex items-end gap-2">
        {onAttach && <button type="button" aria-label="Attach image" onClick={onAttach} className="w-11 h-11 rounded-2xl bg-app-bg border border-app-border text-app-text-muted hover:text-app-text flex items-center justify-center shrink-0"><Paperclip size={18}/></button>}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, 4000))}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          aria-label={placeholder}
          placeholder={placeholder}
          className="flex-1 max-h-36 min-h-12 resize-none rounded-2xl bg-app-bg border border-app-border px-4 py-3 text-sm text-app-text outline-none focus:border-app-accent placeholder:text-app-text-muted/70"
        />
        <button type="button" aria-label="Send message" onClick={onSend} disabled={!value.trim() && !attachment} className="w-12 h-12 rounded-2xl bg-app-accent text-white flex items-center justify-center shadow-lg disabled:opacity-40 disabled:shadow-none transition-all">
          <Send size={19} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-1 px-1"><span className="text-[10px] text-app-text-muted">Enter to send · Shift+Enter for a new line</span><span className="text-[10px] text-app-text-muted">{value.length}/4000</span></div>
    </div>
  </div>
);

const MessageBubble = ({ msg, own, onReply, onCopy, onReport, onReact }: { msg: MessageItem; own: boolean; onReply?: () => void; onCopy?: () => void; onReport?: () => void; onReact?: () => void }) => {
  // The action row (Reply/Copy/React/Report) used to only appear on
  // `:hover`, which never fires on touch screens. That made these actions
  // completely unreachable on phones/tablets. We now also toggle it on tap,
  // and only fall back to hover as a bonus for mouse users.
  const [actionsOpen, setActionsOpen] = React.useState(false);
  return (
  <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
    <div className="group max-w-[92%] sm:max-w-[72%]">
      <div
        className={`relative rounded-3xl px-4 py-3 shadow-sm ${own ? 'bg-app-accent text-white rounded-br-lg' : 'bg-app-card border border-app-border text-app-text rounded-bl-lg'}`}
        onClick={() => setActionsOpen(v => !v)}
      >
        {!own && <p className="text-[10px] font-black text-app-accent mb-1">{msg.sender_name}</p>}
        {msg.reply_to && <div className={`mb-2 rounded-xl px-3 py-2 text-xs ${own ? 'bg-white/10' : 'bg-app-bg border border-app-border'}`}><p className="font-bold">{msg.reply_to.sender_name}</p><p className="opacity-70 truncate">{msg.reply_to.text}</p></div>}
        {msg.attachment?.previewUrl && <img src={msg.attachment.previewUrl} alt={msg.attachment.name} className="mb-2 max-h-72 w-full rounded-2xl object-cover"/>}
        <p className="text-sm leading-relaxed break-words">{msg.text || (msg.attachment ? msg.attachment.name : '')}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${own ? 'text-white/65' : 'text-app-text-muted'}`}>
          <span>{formatTime(msg.created_at)}</span>{own && <CheckCheck size={12} />}
        </div>
        <div className={`absolute -bottom-9 ${own ? 'right-0' : 'left-0'} ${actionsOpen ? 'flex' : 'hidden'} group-hover:flex items-center gap-1 rounded-xl border border-app-border bg-app-card shadow-lg p-1 z-10`}>
          {onReply && <button type="button" aria-label="Reply" title="Reply" onClick={(e) => { e.stopPropagation(); onReply(); setActionsOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-app-bg text-app-text-muted"><Reply size={14}/></button>}
          {onCopy && <button type="button" aria-label="Copy message" title="Copy" onClick={(e) => { e.stopPropagation(); onCopy(); setActionsOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-app-bg text-app-text-muted"><Copy size={14}/></button>}
          {onReact && <button type="button" aria-label="React" title="React" onClick={(e) => { e.stopPropagation(); onReact(); setActionsOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-app-bg text-app-text-muted"><Smile size={14}/></button>}
          {!own && onReport && <button type="button" aria-label="Report message" title="Report" onClick={(e) => { e.stopPropagation(); onReport(); setActionsOpen(false); }} className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500"><Flag size={14}/></button>}
        </div>
      </div>
    </div>
  </div>
  );
};

const useRealtimeRoom = (roomId: string | null, onMessage: (message: MessageItem) => void) => {
  const socketRef = React.useRef<Socket | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    if (!roomId) return;
    const connect = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (cancelled || !token) return;
      const socket = io(window.location.origin, { transports: ['websocket', 'polling'], auth: { token } });
      socketRef.current = socket;
      socket.on('connect_error', (error) => console.warn('StudySnap chat connection error:', error.message));
      socket.emit('join-room', roomId);
      const handle = (message: MessageItem) => {
        if (message?.room_id === roomId && (message?.text || message?.attachment)) onMessage(message);
      };
      socket.on('new-message', handle);
      socket.on('room-error', (payload) => console.warn('StudySnap room error:', payload?.error));
      (socket as any).__studysnapCleanup = () => socket.off('new-message', handle);
    };
    void connect();
    return () => {
      cancelled = true;
      const socket = socketRef.current as any;
      if (socket) { socket.__studysnapCleanup?.(); socket.disconnect(); }
      socketRef.current = null;
    };
  }, [roomId, onMessage]);
  return React.useCallback((message: MessageItem) => {
    socketRef.current?.emit('send-message', roomId, message);
  }, [roomId]);
};

export const ChatsView: React.FC<{ messages: MessageItem[]; userName: string; onBack: () => void; onSendMessage: (msg: MessageItem) => void }> = ({ messages, userName, onBack, onSendMessage }) => {
  const [selectedChat, setSelectedChat] = React.useState<string | null>(null);
  const [text, setText] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [contacts, setContacts] = React.useState<{ id: string; name: string }[]>([]);
  const [replyTo, setReplyTo] = React.useState<MessageItem['reply_to']>();
  const [attachment, setAttachment] = React.useState<MessageAttachment>();
  const [notice, setNotice] = React.useState('');
  const [blockedUsers, setBlockedUsers] = React.useState<string[]>([]);
  const [readMap, setReadMap] = React.useState<Record<string, string>>({});
  const [liveMessages, setLiveMessages] = React.useState<MessageItem[]>([]);

  React.useEffect(() => {
    try {
      setContacts(JSON.parse(localStorage.getItem('studysnap-contacts') || '[]'));
      setBlockedUsers(JSON.parse(localStorage.getItem('studysnap-blocked-users') || '[]'));
      setReadMap(JSON.parse(localStorage.getItem('studysnap-chat-read') || '{}'));
    } catch {}
  }, []);

  const publishRealtime = useRealtimeRoom(selectedChat, React.useCallback((message) => {
    setLiveMessages(prev => prev.some(item => item.id === message.id) ? prev : [...prev, message]);
  }, []));

  const markRead = (chatId: string) => {
    const next = { ...readMap, [chatId]: new Date().toISOString() };
    setReadMap(next);
    localStorage.setItem('studysnap-chat-read', JSON.stringify(next));
  };

  const baseChats = [
    { id: 'global', name: 'Global Study Group', lastMsg: messages.filter(m => !m.room_id).at(-1)?.text || 'Start a study conversation', time: formatTime(messages.filter(m => !m.room_id).at(-1)?.created_at) || 'Now', kind: 'community' },
    { id: 'ai-twin', name: 'StudySnap AI', lastMsg: 'Your adaptive study companion', time: 'AI', kind: 'ai' },
    { id: 'math-help', name: 'Math Doubt Solver', lastMsg: 'Step-by-step help when you need it', time: 'AI', kind: 'ai' },
    ...contacts.map(c => ({ id: `contact-${c.id}`, name: c.name, lastMsg: 'Start a study chat', time: 'New', kind: 'person' }))
  ];
  const chats = baseChats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const active = baseChats.find(c => c.id === selectedChat);
  const chatMessages = selectedChat ? [...messages.filter(m => m.room_id === selectedChat || (!m.room_id && selectedChat === 'global')), ...liveMessages.filter(m => m.room_id === selectedChat && !messages.some(existing => existing.id === m.id))].filter(m => !m.sender_name || !blockedUsers.includes(m.sender_name)) : [];

  const openChat = (chatId: string) => { setSelectedChat(chatId); setReplyTo(undefined); setAttachment(undefined); setText(''); markRead(chatId); };

  const chooseAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { setNotice('Images must be 2 MB or smaller.'); return; }
      const reader = new FileReader();
      reader.onload = () => setAttachment({ id: makeId(), name: file.name, type: file.type, size: file.size, previewUrl: String(reader.result) });
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const send = async () => {
    const clean = text.trim();
    if ((!clean && !attachment) || !selectedChat) return;
    const message: MessageItem = {
      id: makeId(), sender_name: userName || 'You', text: clean, created_at: new Date().toISOString(), room_id: selectedChat,
      reply_to: replyTo, attachment, reactions: {}
    };
    onSendMessage(message);
    publishRealtime(message);
    setText(''); setReplyTo(undefined); setAttachment(undefined);

    if (selectedChat === 'ai-twin' || selectedChat === 'math-help') {
      try {
        const sys = selectedChat === 'math-help'
          ? "You are StudySnap's Math Doubt Solver. Explain mathematics step by step at the learner's level. Do not invent product ownership or user qualifications."
          : "You are StudySnap AI, a friendly adaptive study companion. Match the learner's requested depth and never invent identity, qualifications, or product ownership.";
        const res = await fetch('/api/gemini/reason', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: clean || 'Please inspect the attached study image and help me understand it.', systemInstruction: sys }) });
        if (res.ok) {
          const data = await res.json();
          const replyMsg: MessageItem = { id: makeId(), sender_name: selectedChat === 'math-help' ? 'Math Doubt Solver' : 'StudySnap AI', text: data.text || "I'm here to help you study.", created_at: new Date().toISOString(), room_id: selectedChat };
          onSendMessage(replyMsg); publishRealtime(replyMsg);
        }
      } catch (err) { console.warn('StudySnap AI chat response error:', err); }
    }
  };

  const reportMessage = async (msg: MessageItem) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sign-in required');
      const response = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messageId: msg.id, roomId: msg.room_id || 'global', category: 'other' })
      });
      if (!response.ok) throw new Error('Report failed');
      setNotice('Report submitted for moderation.');
      return;
    } catch {
      try {
        const reports = JSON.parse(localStorage.getItem('studysnap-message-reports') || '[]');
        reports.push({ id: makeId(), message_id: msg.id, room_id: msg.room_id || null, sender_name: msg.sender_name, created_at: new Date().toISOString() });
        localStorage.setItem('studysnap-message-reports', JSON.stringify(reports.slice(-100)));
      } catch {}
      setNotice('Report saved locally and will be retried when the service is available.');
    }
  };

  const blockUser = (name: string) => {
    const next = Array.from(new Set([...blockedUsers, name]));
    setBlockedUsers(next); localStorage.setItem('studysnap-blocked-users', JSON.stringify(next));
    setMenuOpen(false);
  };

  if (selectedChat) {
    return (
      <div className="min-h-[100dvh] bg-app-bg flex flex-col overflow-visible">
        <StudySnapHeader title={active?.name || 'Chat'} subtitle={active?.kind === 'ai' ? 'StudySnap AI workspace' : 'Private study conversation'} onBack={() => setSelectedChat(null)} onSearch={() => setSearching(v => !v)} onMore={() => setMenuOpen(v => !v)} />
        {searching && <div className="px-4 py-2 bg-app-card border-b border-app-border"><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search this chat" className="w-full h-11 rounded-2xl bg-app-bg px-4 text-sm outline-none border border-app-border focus:border-app-accent" /></div>}
        {menuOpen && <div className="absolute right-4 top-20 z-30 w-56 rounded-2xl bg-app-card border border-app-border shadow-2xl p-2">
          <button onClick={() => { navigator.clipboard?.writeText(chatMessages.map(m => `${m.sender_name}: ${m.text}`).join('\n')); setMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-app-bg text-sm font-bold">Copy conversation</button>
          {active?.kind === 'person' && <button onClick={() => { const name = active.name; if (name) blockUser(name); }} className="w-full text-left p-3 rounded-xl hover:bg-app-bg text-sm font-bold text-red-600">Block this person</button>}
          <button onClick={() => { setText(''); setReplyTo(undefined); setAttachment(undefined); setMenuOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-app-bg text-sm font-bold">Clear draft</button>
        </div>}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 space-y-5">
          {chatMessages.length ? chatMessages.map(msg => <MessageBubble key={msg.id} msg={msg} own={msg.sender_name === userName || msg.sender_name === 'You'} onReply={() => setReplyTo({ id: msg.id, sender_name: msg.sender_name, text: msg.text })} onCopy={() => navigator.clipboard?.writeText(msg.text)} onReport={() => reportMessage(msg)} onReact={() => { const reaction = '👍'; const next = { ...msg, reactions: { ...(msg.reactions || {}), [reaction]: ((msg.reactions || {})[reaction] || 0) + 1 } }; onSendMessage(next); }} />) : <EmptyState icon={<MessageSquare size={30}/>} title="Start the conversation" text="Ask a question, share a note, or invite your study partner." />}
        </div>
        {notice && <div role="status" className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border-y border-amber-200">{notice}</div>}
        <Composer value={text} onChange={setText} onSend={send} placeholder={active?.kind === 'ai' ? 'Ask StudySnap AI…' : 'Write a message…'} replyTo={replyTo} onCancelReply={() => setReplyTo(undefined)} onAttach={active?.kind === 'ai' ? undefined : chooseAttachment} attachment={attachment} onRemoveAttachment={() => setAttachment(undefined)} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-app-bg flex flex-col overflow-visible">
      <StudySnapHeader title="Chats" subtitle="Study together or ask StudySnap AI" showBack={false} onSearch={() => setSearching(v => !v)} onMore={() => setNewChatOpen(true)} />
      {searching && <div className="px-4 py-3 bg-app-card border-b border-app-border"><div className="relative"><Search size={17} className="absolute left-4 top-3.5 text-app-text-muted"/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chats" className="w-full h-11 rounded-2xl bg-app-bg pl-11 pr-4 text-sm outline-none border border-app-border focus:border-app-accent" /></div></div>}
      {newChatOpen && <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setNewChatOpen(false)}><div className="w-full max-w-md rounded-[2rem] bg-app-card border border-app-border shadow-2xl p-5" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-4"><div><h3 className="text-xl font-black text-app-text">Start a chat</h3><p className="text-xs text-app-text-muted">Choose a study assistant or a saved contact.</p></div><button onClick={() => setNewChatOpen(false)} className="w-10 h-10 rounded-xl hover:bg-app-bg"><X size={19}/></button></div><div className="grid gap-2">{baseChats.filter(c => c.kind !== 'community').map(chat => <button key={chat.id} onClick={() => { setNewChatOpen(false); openChat(chat.id); }} className="w-full p-4 rounded-2xl border border-app-border bg-app-bg flex items-center gap-3 text-left hover:border-app-accent"><div className="w-10 h-10 rounded-xl bg-app-accent/10 text-app-accent flex items-center justify-center">{chat.kind === 'ai' ? <SparklesIcon/> : <UserPlus size={18}/>}</div><div className="min-w-0"><p className="font-bold text-app-text truncate">{chat.name}</p><p className="text-xs text-app-text-muted truncate">{chat.lastMsg}</p></div></button>)}</div></div></div>}
      <div className="flex-1 overflow-y-auto pb-24 sm:pb-28">
        {chats.length ? chats.map(chat => {
          const lastRead = readMap[chat.id] ? Date.parse(readMap[chat.id]) : 0;
          const unread = messages.filter(m => (m.room_id === chat.id || (!m.room_id && chat.id === 'global')) && Date.parse(m.created_at) > lastRead && m.sender_name !== userName).length;
          return <button key={chat.id} onClick={() => openChat(chat.id)} className="w-full text-left flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-app-border/60 hover:bg-app-card transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">{chat.kind === 'ai' ? <SparklesIcon/> : chat.kind === 'community' ? <Users size={22}/> : <UserPlus size={21}/>}</div>
            <div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-3"><h3 className="font-black text-app-text truncate">{chat.name}</h3><div className="flex items-center gap-2 shrink-0"><span className="text-[10px] text-app-text-muted">{chat.time}</span>{unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-app-accent text-white text-[10px] font-black flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}</div></div><p className="text-sm text-app-text-muted truncate mt-1">{chat.lastMsg}</p></div>
          </button>;
        }) : <EmptyState icon={<Search size={30}/>} title="No chats found" text="Try a different search term or start a new chat." />}
      </div>
    </div>
  );
};

const SparklesIcon = () => <span className="text-lg" aria-hidden="true">✦</span>;

export const CommunitiesView: React.FC<{ onBack: () => void; onGoLive: () => void; messages?: MessageItem[]; userName?: string; onSendMessage?: (msg: MessageItem) => void }> = ({ onBack, onGoLive, messages = [], userName = '', onSendMessage = () => {} }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [text, setText] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  const [name, setName] = React.useState('');
  const [tab, setTab] = React.useState<'your' | 'discover'>('your');
  const [joined, setJoined] = React.useState<string[]>(['biology', 'exam']);
  const [attachment, setAttachment] = React.useState<MessageAttachment>();
  const [notice, setNotice] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<MessageItem['reply_to']>();
  const [liveMessages, setLiveMessages] = React.useState<MessageItem[]>([]);
  const [communities, setCommunities] = React.useState<{id:string;name:string;members:number;online:number}[]>([
    { id: 'biology', name: 'Biology Study Group', members: 24, online: 3 },
    { id: 'math', name: 'Math Wizards', members: 18, online: 4 },
    { id: 'exam', name: 'Exam Prep 2026', members: 8, online: 2 },
    { id: 'biochem', name: 'Biochemistry Study Hub', members: 31, online: 5 },
  ]);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('studysnap-communities') || '[]');
      const savedJoined = JSON.parse(localStorage.getItem('studysnap-joined-communities') || '[]');
      if (Array.isArray(saved) && saved.length) setCommunities(prev => [...prev, ...saved.filter((x:any) => !prev.some(p => p.id === x.id))]);
      if (Array.isArray(savedJoined) && savedJoined.length) setJoined(savedJoined);
    } catch {}
  }, []);

  const current = communities.find(c => c.id === selected);
  const publishRealtime = useRealtimeRoom(selected, React.useCallback((message) => {
    setLiveMessages(prev => prev.some(item => item.id === message.id) ? prev : [...prev, message]);
  }, []));
  const roomMessages = [...messages.filter(m => m.room_id === selected), ...liveMessages.filter(m => m.room_id === selected && !messages.some(existing => existing.id === m.id))];
  const visible = communities.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (tab === 'your' ? joined.includes(c.id) : !joined.includes(c.id)));

  const openCommunity = (id: string) => {
    if (!joined.includes(id)) {
      const next = [...joined, id]; setJoined(next); localStorage.setItem('studysnap-joined-communities', JSON.stringify(next));
    }
    setSelected(id); setText(''); setReplyTo(undefined); setAttachment(undefined);
  };

  const chooseAttachment = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      if (file.size > 2 * 1024 * 1024) { setNotice('Images must be 2 MB or smaller.'); return; }
      const reader = new FileReader(); reader.onload = () => setAttachment({ id: makeId(), name: file.name, type: file.type, size: file.size, previewUrl: String(reader.result) }); reader.readAsDataURL(file);
    }; input.click();
  };

  const send = () => {
    const clean = text.trim(); if ((!clean && !attachment) || !selected) return;
    const message: MessageItem = { id: makeId(), sender_name: userName || 'You', text: clean, created_at: new Date().toISOString(), room_id: selected, reply_to: replyTo, attachment, reactions: {} };
    onSendMessage(message); publishRealtime(message); setText(''); setReplyTo(undefined); setAttachment(undefined);
  };

  const reportMessage = async (msg: MessageItem) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sign-in required');
      const response = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messageId: msg.id, roomId: msg.room_id || 'community', category: 'other' })
      });
      if (!response.ok) throw new Error('Report failed');
      setNotice('Report submitted for moderation.');
      return;
    } catch {
      try { const reports = JSON.parse(localStorage.getItem('studysnap-message-reports') || '[]'); reports.push({ id: makeId(), message_id: msg.id, room_id: msg.room_id, sender_name: msg.sender_name, created_at: new Date().toISOString(), context: 'community' }); localStorage.setItem('studysnap-message-reports', JSON.stringify(reports.slice(-100))); } catch {}
      setNotice('Report saved locally and will be retried when the service is available.');
    }
  };

  const create = () => {
    const clean = name.trim().replace(/\s+/g, ' ').slice(0, 80); if (!clean) return;
    const item = { id: `community-${makeId()}`, name: clean, members: 1, online: 1 };
    const nextCommunities = [...communities, item]; setCommunities(nextCommunities);
    localStorage.setItem('studysnap-communities', JSON.stringify(nextCommunities.filter(c => c.id.startsWith('community-'))));
    const nextJoined = [...joined, item.id]; setJoined(nextJoined); localStorage.setItem('studysnap-joined-communities', JSON.stringify(nextJoined));
    setName(''); setShowCreate(false); setSelected(item.id); setTab('your');
  };

  if (selected && current) return (
    <div className="min-h-[100dvh] bg-app-bg flex flex-col overflow-visible">
      <StudySnapHeader title={current.name} subtitle={`${current.members} members · ${current.online} active now`} onBack={() => setSelected(null)} onMore={onGoLive} />
      <div className="px-3 sm:px-5 py-2 bg-app-card border-b border-app-border"><div className="max-w-4xl mx-auto flex items-center gap-2 text-[11px] text-app-text-muted"><ShieldCheck size={14} className="text-emerald-600"/><span>Study-only community · use Report on harmful or inappropriate messages.</span></div></div>
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 space-y-5">
        {roomMessages.length ? roomMessages.map(msg => <MessageBubble key={msg.id} msg={msg} own={msg.sender_name === userName || msg.sender_name === 'You'} onReply={() => setReplyTo({ id: msg.id, sender_name: msg.sender_name, text: msg.text })} onCopy={() => navigator.clipboard?.writeText(msg.text)} onReport={() => reportMessage(msg)} onReact={() => { const reaction='👍'; const copy={...msg,reactions:{...(msg.reactions||{}),[reaction]:((msg.reactions||{})[reaction]||0)+1}}; onSendMessage(copy); }} />) : <EmptyState icon={<Hash size={30}/>} title="Start the discussion" text="Ask a study question, share a useful resource, or post a short explanation." />}
      </div>
      {notice && <div role="status" className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border-y border-amber-200">{notice}</div>}
      <Composer value={text} onChange={setText} onSend={send} placeholder="Post to the community…" replyTo={replyTo} onCancelReply={() => setReplyTo(undefined)} onAttach={chooseAttachment} attachment={attachment} onRemoveAttachment={() => setAttachment(undefined)} />
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-app-bg flex flex-col overflow-visible">
      <StudySnapHeader title="Community" subtitle="Learn with people who get it" showBack={false} onSearch={() => setSearching(v => !v)} onMore={() => setShowCreate(true)} />
      {searching && <div className="px-4 py-3 bg-app-card border-b border-app-border"><div className="relative"><Search size={17} className="absolute left-4 top-3.5 text-app-text-muted"/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search study communities" className="w-full h-11 rounded-2xl bg-app-bg pl-11 pr-4 text-sm outline-none border border-app-border focus:border-app-accent" /></div></div>}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28">
        <section className="reference-card p-5 sm:p-6 mb-5">
          <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0"><UsersRound size={23}/></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.22em] text-app-text-muted">Study together</p><h3 className="text-xl sm:text-2xl font-black text-app-text mt-1">Focused communities, less noise.</h3><p className="text-sm text-app-text-muted mt-2">Join a subject space, ask questions, share resources and keep discussions organized.</p></div></div>
          <div className="flex flex-wrap gap-2 mt-4"><button onClick={() => setTab('your')} className={`min-h-10 px-4 rounded-xl text-sm font-bold ${tab==='your'?'bg-app-text text-app-bg':'bg-app-bg text-app-text-muted'}`}>Your spaces</button><button onClick={() => setTab('discover')} className={`min-h-10 px-4 rounded-xl text-sm font-bold ${tab==='discover'?'bg-app-text text-app-bg':'bg-app-bg text-app-text-muted'}`}>Discover</button><button onClick={onGoLive} className="min-h-10 px-4 rounded-xl bg-app-accent text-white text-sm font-bold flex items-center gap-2"><Video size={16}/> Go Live</button></div>
        </section>
        <div className="flex items-center justify-between mb-4"><div><h3 className="font-black text-app-text">{tab === 'your' ? 'Your communities' : 'Suggested communities'}</h3><p className="text-xs text-app-text-muted mt-1">{tab === 'your' ? 'Your joined spaces.' : 'Join a focused study space in one tap.'}</p></div><button onClick={() => setShowCreate(true)} className="w-11 h-11 rounded-2xl bg-app-accent text-white flex items-center justify-center" aria-label="Create community"><Plus size={20}/></button></div>
        <div className="grid gap-3">{visible.map(c => <button key={c.id} onClick={() => openCommunity(c.id)} className="reference-card p-4 flex items-center gap-4 text-left hover:border-app-accent/30 transition-colors"><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Users size={22}/></div><div className="min-w-0 flex-1"><h4 className="font-black text-app-text truncate">{c.name}</h4><p className="text-xs text-app-text-muted mt-1">{c.members} members · {c.online} active now</p></div>{tab === 'discover' ? <span className="text-xs font-black text-app-accent">Join</span> : <MoreHorizontal size={19} className="text-app-text-muted"/>}</button>)}</div>
        {!visible.length && <EmptyState icon={<Search size={30}/>} title={tab === 'your' ? 'No communities yet' : 'Nothing found'} text={tab === 'your' ? 'Discover a subject group or create your own study space.' : 'Try another topic or create a new community.'} action={tab === 'your' ? <button onClick={() => setTab('discover')} className="min-h-11 px-4 rounded-xl bg-app-accent text-white font-bold">Discover communities</button> : undefined}/>}
      </div>
      {showCreate && <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowCreate(false)}><div className="w-full max-w-md rounded-[2rem] bg-app-card border border-app-border shadow-2xl p-5" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between mb-5"><div><h3 className="text-xl font-black text-app-text">Create community</h3><p className="text-xs text-app-text-muted mt-1">Keep it focused on a subject or study goal.</p></div><button onClick={() => setShowCreate(false)} className="w-10 h-10 rounded-xl hover:bg-app-bg" aria-label="Close"><X size={19}/></button></div><input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} maxLength={80} placeholder="e.g. Biochemistry 2026" className="w-full h-12 rounded-2xl bg-app-bg border border-app-border px-4 outline-none focus:border-app-accent text-app-text"/><div className="text-[10px] text-app-text-muted mt-2 text-right">{name.length}/80</div><button onClick={create} disabled={!name.trim()} className="w-full h-12 mt-3 rounded-2xl bg-app-accent text-white font-black disabled:opacity-40">Create community</button></div></div>}
    </div>
  );
};

export const CallsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notice, setNotice] = React.useState('');
  const createCallLink = async () => {
    const link = `${window.location.origin}/?studysnap-call=${makeId()}`;
    try {
      if (navigator.share) await navigator.share({ title: 'StudySnap study call', text: 'Join my StudySnap study call', url: link });
      else { await navigator.clipboard?.writeText(link); setNotice('Call link copied.'); }
    } catch { setNotice('Call link ready to share.'); }
  };
  return (
    <div className="min-h-[100dvh] bg-app-bg flex flex-col overflow-visible">
      <StudySnapHeader title="Calls" subtitle="Study calls" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28">
        <button onClick={createCallLink} className="w-full reference-card p-5 flex items-center gap-4 text-left mb-6 hover:border-emerald-500/40 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center"><CirclePlus size={25}/></div>
          <div className="flex-1"><h3 className="font-black text-app-text">Create call link</h3><p className="text-xs text-app-text-muted mt-1">Invite study partners to a call.</p>{notice && <p className="text-xs text-emerald-600 font-bold mt-2">{notice}</p>}</div>
          <Send size={18} className="text-emerald-600"/>
        </button>
        <div className="reference-card p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-app-bg text-app-text-muted flex items-center justify-center"><Phone size={22}/></div>
          <h3 className="font-black text-app-text mt-4">No call history yet</h3>
          <p className="text-sm text-app-text-muted mt-1">StudySnap will show completed calls here once a call session is connected.</p>
        </div>
      </div>
    </div>
  );
};
