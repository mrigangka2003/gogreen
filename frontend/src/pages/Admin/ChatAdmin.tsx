import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../stores/auth";
import api from "../../api";
import {
  MessageCircle,
  Send,
  Search,
  Mic,
  CheckCheck,
  Trash2,
  Play,
  Pause,
  User,
  Building2,
  Briefcase,
  X,
  ExternalLink,
} from "lucide-react";

interface ChatMessage {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  sender: "user" | "support";
  senderName: string;
  createdAt: Timestamp | null;
}

interface ChatDoc {
  id: string;
  participants: string[];
  userName: string;
  userRole: "user" | "employee" | "organization";
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unreadByAdmin: number;
  unreadByUser: number;
  status: "open" | "resolved";
}

function VoicePlayer({ audioUrl, duration }: { audioUrl: string; duration: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<number | null>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      audio.play();
      setPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setProgress(audio.currentTime / (audio.duration || 1));
      }, 100);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("ended", onEnd);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-[#38B000]/10 flex items-center justify-center flex-shrink-0">
        {playing ? <Pause className="w-3.5 h-3.5 text-[#38B000]" /> : <Play className="w-3.5 h-3.5 ml-0.5 text-[#38B000]" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#38B000] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">{fmt(duration)}</p>
      </div>
    </div>
  );
}

const roleIcon = (role: string) => {
  switch (role) {
    case "organization": return <Building2 className="w-3.5 h-3.5" />;
    case "employee": return <Briefcase className="w-3.5 h-3.5" />;
    default: return <User className="w-3.5 h-3.5" />;
  }
};

export default function ChatAdmin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const basePath = user?.role === "super-admin" ? "/dashboard/super-admin" : "/dashboard/admin";
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"open" | "resolved" | "all">("open");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingTimeRef = useRef(0);

  // Listen to all chats
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("lastMessageAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs: ChatDoc[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatDoc));
      setChats(docs);
    });
    return unsub;
  }, []);

  // Listen to messages of selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, "chats", selectedChatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
    });

    // Reset unread count for admin
    updateDoc(doc(db, "chats", selectedChatId), { unreadByAdmin: 0 });

    return unsub;
  }, [selectedChatId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const filteredChats = chats.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery && !c.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedChatId) return;
    setInput("");

    await addDoc(collection(db, "chats", selectedChatId, "messages"), {
      text,
      sender: "support",
      senderName: user?.name || "Support",
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "chats", selectedChatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      unreadByUser: (selectedChat?.unreadByUser || 0) + 1,
    });
  };

  const navigateToProfile = (chat: ChatDoc) => {
    const userId = chat.id.replace("chat_", "");
    if (chat.userRole === "employee") {
      navigate(`${basePath}/employee/${userId}`);
    } else {
      navigate(`${basePath}/account-detail/${userId}`);
    }
  };

  const handleResolve = async () => {
    if (!selectedChatId) return;
    const chat = chats.find((c) => c.id === selectedChatId);
    const newStatus = chat?.status === "resolved" ? "open" : "resolved";
    await updateDoc(doc(db, "chats", selectedChatId), { status: newStatus });
  };

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const duration = recordingTimeRef.current;

        if (!selectedChatId) return;

        // Convert blob to base64 and upload to Cloudinary via backend
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const { data } = await api.post("/chat/upload-audio", { audio: base64 }) as { data: { url: string } };
        const audioUrl = data.url;

        await addDoc(collection(db, "chats", selectedChatId, "messages"), {
          audioUrl,
          audioDuration: duration,
          sender: "support",
          senderName: user?.name || "Support",
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "chats", selectedChatId), {
          lastMessage: "🎤 Voice message",
          lastMessageAt: serverTimestamp(),
          unreadByUser: (selectedChat?.unreadByUser || 0) + 1,
        });
      };

      mediaRecorder.start();
      timerRef.current = window.setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      alert("Could not access microphone.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    chunksRef.current = [];
  };

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const fmtRec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-[calc(100vh-57px)] bg-gray-50">
      {/* Left panel - Chat list */}
      <div className={`${selectedChatId ? "hidden md:flex" : "flex"} flex-col w-full md:w-96 border-r border-gray-200 bg-white`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#38B000]" />
            Customer Support
          </h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#38B000]/30"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["open", "resolved", "all"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? "bg-[#38B000] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
                {status === "open" && (
                  <span className="ml-1 bg-white/20 px-1.5 rounded-full">
                    {chats.filter((c) => c.status === "open").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full flex items-start gap-3 p-4 border-b border-gray-50 text-left transition-colors hover:bg-gray-50 ${
                  selectedChatId === chat.id ? "bg-[#38B000]/5 border-l-2 border-l-[#38B000]" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38B000] to-[#2d8c00] flex items-center justify-center text-white text-sm font-bold">
                    {chat.userName?.[0]?.toUpperCase() || "?"}
                  </div>
                  {chat.status === "open" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">{chat.userName}</p>
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500">
                        {roleIcon(chat.userRole)}
                        {chat.userRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(chat.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage || "No messages yet"}</p>
                </div>

                {/* Unread badge */}
                {chat.unreadByAdmin > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#38B000] text-white text-[10px] font-bold flex items-center justify-center">
                    {chat.unreadByAdmin}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel - Chat messages */}
      <div className={`${selectedChatId ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white`}>
        {!selectedChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-16 h-16 mb-3 opacity-20" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a chat from the left panel to start responding</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => selectedChat && navigateToProfile(selectedChat)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  title="View profile"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#38B000] to-[#2d8c00] flex items-center justify-center text-white text-sm font-bold">
                    {selectedChat?.userName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      {selectedChat?.userName}
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      {roleIcon(selectedChat?.userRole || "user")}
                      <span className="capitalize">{selectedChat?.userRole}</span>
                      <span className="mx-1">•</span>
                      <span className={selectedChat?.status === "open" ? "text-green-500" : "text-gray-400"}>
                        {selectedChat?.status}
                      </span>
                    </p>
                  </div>
                </button>
              </div>
              <button
                onClick={handleResolve}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedChat?.status === "resolved"
                    ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {selectedChat?.status === "resolved" ? "Reopen" : "Mark Resolved"}
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "support"
                        ? "bg-[#38B000] text-white rounded-2xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" && (
                      <p className={`text-[10px] font-medium mb-1 text-[#38B000]`}>{msg.senderName}</p>
                    )}
                    {msg.audioUrl ? (
                      <VoicePlayer audioUrl={msg.audioUrl} duration={msg.audioDuration || 0} />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === "support" ? "justify-end" : ""}`}>
                      <p className={`text-[9px] ${msg.sender === "support" ? "text-white/50" : "text-gray-400"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                      {msg.sender === "support" && <CheckCheck className="w-3 h-3 text-white/50" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recording overlay */}
            {isRecording && (
              <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600">Recording {fmtRec(recordingTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={cancelRecording} className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={stopRecording} className="w-8 h-8 rounded-full bg-[#38B000] flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Input bar */}
            {!isRecording && (
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#38B000]/30"
                />
                {!input.trim() && (
                  <button
                    onClick={startRecording}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#38B000]/10 hover:text-[#38B000] transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full bg-[#38B000] flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
