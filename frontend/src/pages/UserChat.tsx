import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../stores/auth";
import api from "../api";
import {
  Send,
  Mic,
  Trash2,
  Leaf,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  CheckCheck,
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

function VoicePlayer({ audioUrl, duration, isUser }: { audioUrl: string; duration: number; isUser: boolean }) {
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
      <button
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-white/20" : "bg-[#38B000]/10"
        }`}
      >
        {playing ? (
          <Pause className={`w-3.5 h-3.5 ${isUser ? "text-white" : "text-[#38B000]"}`} />
        ) : (
          <Play className={`w-3.5 h-3.5 ml-0.5 ${isUser ? "text-white" : "text-[#38B000]"}`} />
        )}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${isUser ? "bg-white/30" : "bg-gray-200"}`}>
          <div
            className={`h-full rounded-full transition-all ${isUser ? "bg-white" : "bg-[#38B000]"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className={`text-[10px] mt-0.5 ${isUser ? "text-white/50" : "text-gray-400"}`}>{fmt(duration)}</p>
      </div>
    </div>
  );
}

export default function UserChat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingTimeRef = useRef(0);

  // Map app roles to chat roles
  const chatUserRole = (() => {
    switch (user?.role) {
      case "emp": return "employee";
      case "org": return "organization";
      default: return "user";
    }
  })();

  // Initialize or find existing chat for this user
  useEffect(() => {
    if (!user?.id) return;
    const id = `chat_${user.id}`;
    setChatId(id);

    // Check if chat doc exists, if not it'll be created on first message
    getDoc(doc(db, "chats", id)).then((snap) => {
      if (!snap.exists()) {
        // Create the chat document
        setDoc(doc(db, "chats", id), {
          participants: [user.id, "support"],
          userName: user.name,
          userRole: chatUserRole,
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          unreadByAdmin: 0,
          unreadByUser: 0,
          status: "open",
        });
      }
    });
  }, [user?.id, user?.name, chatUserRole]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
    });

    // Reset unread count for user
    updateDoc(doc(db, "chats", chatId), { unreadByUser: 0 }).catch(() => {});

    return unsub;
  }, [chatId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !chatId || !user) return;
    setInput("");

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      sender: "user",
      senderName: user.name,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      unreadByAdmin: (messages.filter((m) => m.sender === "user").length > 0 ? 1 : 0) + 1,
    });
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

        if (!chatId || !user) return;

        // Convert blob to base64 and upload to Cloudinary via backend
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const { data } = await api.post("/chat/upload-audio", { audio: base64 }) as { data: { url: string } };
        const audioUrl = data.url;

        await addDoc(collection(db, "chats", chatId, "messages"), {
          audioUrl,
          audioDuration: duration,
          sender: "user",
          senderName: user.name,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: "🎤 Voice message",
          lastMessageAt: serverTimestamp(),
          unreadByAdmin: 1,
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
    return ts.toDate().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const fmtRec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#38B000] to-[#2d8c00] px-5 py-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 border-2 border-[#38B000] rounded-full" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">GoGreen Support</p>
            <p className="text-[10px] text-white/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              Online • Typically replies in {"<"}5 min
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-2 relative">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <Clock className="w-3 h-3 text-white/70" />
            <span className="text-[10px] text-white/80 font-medium">24/7 Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <ShieldCheck className="w-3 h-3 text-white/70" />
            <span className="text-[10px] text-white/80 font-medium">Secure Chat</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Welcome message if empty */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-[#38B000]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Leaf className="w-3.5 h-3.5 text-[#38B000]" />
              </div>
              <div className="max-w-[75%] px-4 py-2.5 text-sm bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                <p>Welcome to GoGreen Support! How can we help you today?</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "support" && (
              <div className="w-7 h-7 rounded-full bg-[#38B000]/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Leaf className="w-3.5 h-3.5 text-[#38B000]" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#38B000] text-white rounded-2xl rounded-br-md"
                  : "bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm"
              }`}
            >
              {msg.audioUrl ? (
                <VoicePlayer audioUrl={msg.audioUrl} duration={msg.audioDuration || 0} isUser={msg.sender === "user"} />
              ) : (
                <p>{msg.text}</p>
              )}
              <div className={`flex items-center gap-1 mt-1 ${msg.sender === "user" ? "justify-end" : ""}`}>
                <p className={`text-[9px] ${msg.sender === "user" ? "text-white/50" : "text-gray-400"}`}>
                  {formatTime(msg.createdAt)}
                </p>
                {msg.sender === "user" && <CheckCheck className="w-3 h-3 text-white/50" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recording bar */}
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
            placeholder="Type your message..."
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
    </div>
  );
}
