import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { apiRequest } from '../../api/client';

const memoryCache = new Map();
const sessionMessagesCache = new Map();
const getGlobalCache = () => {
  if (typeof window === 'undefined') return null;
  if (!window.__AS_CHAT_CACHE__) {
    window.__AS_CHAT_CACHE__ = {};
  }
  return window.__AS_CHAT_CACHE__;
};

const ChatLayout = ({ sidebar, header, children }) => (
    <div className="min-h-screen bg-[#0f1115] text-slate-100">
    {header}
    <div className="flex w-full max-w-[1400px]">
      {sidebar}
      <main className="relative flex flex-1 flex-col">{children}</main>
    </div>
  </div>
);

const Sidebar = ({ sessions, activeSessionId, onSelect, onDelete, isLoading, t }) => (
  <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[260px] flex-col border-r border-[#1e2026] bg-[#0b0d12] lg:flex">
    <div className="px-4 pb-4 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10a37f] text-sm font-semibold">
          IA
        </div>
        <div>
          <p className="text-base font-semibold text-slate-100">{t.assistantName}</p>
          <p className="text-xs font-semibold text-emerald-300">{t.assistantStatus}</p>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-3 pb-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {t.navHistory}
      </div>
      {isLoading ? (
        <p className="px-2 text-sm text-slate-500">{t.historyLoading}</p>
      ) : sessions.length === 0 ? (
        <p className="px-2 text-sm text-slate-500">{t.historyEmpty}</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((item) => {
            const isActive = item._id === activeSessionId;
            return (
              <div
                key={item._id}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#1f222b] text-slate-100'
                    : 'text-slate-400 hover:bg-[#171a21] hover:text-slate-100'
                }`}
              >
                <button type="button" onClick={() => onSelect(item._id)} className="min-w-0 flex-1 truncate text-left">
                  {item.title || t.currentSession}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(item._id);
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-slate-500 transition hover:border-rose-500/40 hover:text-rose-300"
                  aria-label={t.deleteChat}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="M6 6.5h8m-7 0 .5 8m5.5-8-.5 8M8 6.5V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 6.5h10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <div className="border-t border-[#1e2026] px-4 py-4 text-sm text-slate-500">{t.settings}</div>
  </aside>
);

const ChatHeader = ({
  title,
  t,
  onClear,
  language,
  onToggleLanguage,
  onToggleMobileMenu,
}) => (
  <header className="sticky top-0 z-20 border-b border-[#1e2026] bg-[#0f1115]/80 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-[980px] items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden rounded-full border border-[#24272f] bg-[#151821] px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-[#353944] sm:inline"
        >
          {t.home}
        </Link>
        <h1 className="text-base font-semibold text-slate-100">{title || t.currentSession}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#24272f] bg-[#151821] text-slate-200 transition hover:border-[#353944] lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClear}
          className="hidden rounded-full border border-[#24272f] bg-[#151821] px-3 py-1 text-sm font-semibold text-slate-200 transition hover:border-[#353944] sm:inline-flex"
        >
          {t.clearChat}
        </button>
        <button
          type="button"
          onClick={onToggleLanguage}
          className="hidden h-8 w-8 items-center justify-center rounded-full border border-[#24272f] bg-[#151821] text-xs font-semibold text-slate-200 transition hover:border-[#353944] sm:flex"
          aria-label={t.changeLanguage}
        >
          {language.toUpperCase()}
        </button>
        <SignedIn>
          <div className="hidden sm:block">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 rounded-full border border-[#24272f]',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </SignedIn>
        <SignedOut>
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-slate-300 transition hover:text-slate-100 sm:inline"
          >
            {t.login}
          </Link>
          <Link
            to="/register"
            className="hidden rounded-full border border-[#24272f] bg-[#151821] px-3 py-1 text-sm font-semibold text-slate-200 transition hover:border-[#353944] sm:inline"
          >
            {t.register}
          </Link>
        </SignedOut>
      </div>
    </div>
  </header>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
  </div>
);

const SourcesPanel = ({ citations = [] }) => {
  const [open, setOpen] = useState(true);
  if (!citations.length) return null;
  return (
    <div className="mt-3 border-t border-[#2a2d36] pt-2 text-xs text-slate-300">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-slate-100"
      >
        Sources
        <span className="text-[11px] text-slate-400">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <div className="mt-2 space-y-2">
          {citations.map((citation, idx) => {
            if (citation.kind === 'govuk') {
              const domain = citation.url ? new URL(citation.url).hostname : '';
              return (
                <div key={`cite-${idx}`} className="rounded-lg border border-[#2a2d36] bg-[#1b1e26] px-3 py-2">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    {citation.title}
                  </a>
                  <div className="mt-1 text-[11px] text-slate-500">{domain}</div>
                </div>
              );
            }
            const pageLabel = citation.pageStart
              ? `pp.${citation.pageStart}-${citation.pageEnd || citation.pageStart}`
              : 'uploaded text';
            return (
              <div key={`cite-${idx}`} className="rounded-lg border border-[#2a2d36] bg-[#1b1e26] px-3 py-2">
                <div className="text-xs font-semibold text-slate-200">{citation.filename}</div>
                <div className="mt-1 text-[11px] text-slate-500">{pageLabel}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const MessageRow = ({ role, content, citations, userLabel, assistantLabel, isTyping, copiedLabel }) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };
  return (
    <div className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10a37f] text-xs font-semibold text-white">
          A
        </div>
      )}
      <div
        className={`rounded-[18px] px-4 py-3 text-[16px] leading-[1.6] ${
          isUser
            ? 'max-w-[85%] bg-[#1f222b] text-slate-100'
            : 'max-w-[90%] bg-[#151821] text-slate-100'
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
          <span>{isUser ? userLabel : assistantLabel}</span>
          <div className="flex items-center gap-2">
            {copied ? <span className="text-[11px] text-emerald-300">{copiedLabel}</span> : null}
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-[#2a2d36] hover:text-slate-200"
              aria-label="Copy message"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M7 7h7a2 2 0 0 1 2 2v7H9a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 13H4a2 2 0 0 1-2-2V4h7a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {isTyping ? <TypingIndicator /> : <p className="whitespace-pre-line">{content}</p>}
        {!isUser && !isTyping ? <SourcesPanel citations={citations} /> : null}
      </div>
      {isUser ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f3340] text-xs font-semibold text-slate-200">
          U
        </div>
      ) : null}
    </div>
  );
};

const MessageList = ({ messages, citations, userLabel, assistantLabel, isTyping, copiedLabel }) => (
    <div className="mx-auto flex w-full max-w-[780px] flex-col gap-4 px-4">
    {messages.map((message) => (
      <MessageRow
        key={message.id}
        role={message.role}
        content={message.content}
        citations={message.citations}
        userLabel={userLabel}
        assistantLabel={assistantLabel}
        copiedLabel={copiedLabel}
      />
    ))}
    {isTyping ? (
      <MessageRow
        role="assistant"
        content=""
        citations={citations}
        userLabel={userLabel}
        assistantLabel={assistantLabel}
        isTyping
        copiedLabel={copiedLabel}
      />
    ) : null}
  </div>
);

const Composer = ({
  input,
  onChange,
  onSend,
  isLoading,
  placeholder,
  t,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [input]);

  return (
    <div className="pointer-events-none fixed bottom-9 left-0 right-0 z-30 bg-[#0f1115]">
      <div className="w-full max-w-[1400px] px-4 pb-3 lg:pl-[260px]">
        <div className="mx-auto w-full max-w-[780px]">
        <div className="pointer-events-auto rounded-[28px] border border-[#2a2d36] bg-[#171a21] px-3 py-1 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="max-h-[140px] min-h-[40px] flex-1 resize-none rounded-2xl border border-transparent bg-[#171a21] px-2 py-1.5 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
            />
            <button
              type="button"
              onClick={() => onSend()}
              disabled={isLoading || !input.trim()}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                isLoading || !input.trim()
                  ? 'bg-[#22242b] text-slate-600'
                  : 'bg-[#10a37f] text-white hover:bg-emerald-500'
              }`}
              aria-label={t.sendMessage}
            >
              {isLoading ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path
                    d="m5 15 10-5L5 5l2.5 5L5 15Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">{t.aiMistakes}</p>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { getToken, userId } = useAuth();
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const [language, setLanguage] = useState('tr');
  const [officialOnly, setOfficialOnly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const translations = useMemo(
    () => ({
      en: {
        assistantName: 'Immigration Assistant',
        assistantStatus: 'Online · AI Support',
        navNewChat: 'New Chat',
        navHistory: 'History',
        navSaved: 'Saved Documents',
        settings: 'Settings',
        home: 'Home',
        currentSession: 'Current Session',
        clearChat: 'New chat',
        historyEmpty: 'No conversations yet.',
        historyLoading: 'Loading...',
        deleteChat: 'Delete chat',
        deleteChatSuccess: 'Chat deleted.',
        login: 'Log in',
        register: 'Register',
        changeLanguage: 'Change language',
        newChat: 'New chat',
        help: 'Help',
        disclaimer:
          'Your conversation is private. I am an AI assistant, not a lawyer. Please verify legal advice with a professional.',
        userLabel: 'You',
        assistantLabel: 'Assistant',
        inputLabel: 'Ask about your asylum case, documents, or next steps',
        inputPlaceholder: 'Ask about your asylum case, documents, or next steps...',
        sendMessage: 'Send message',
        quickReplies: ['What documents do I need?', 'How long does it take?', 'After the interview?'],
        thinking: 'Assistant is thinking...',
        aiMistakes: 'AI can make mistakes. Please check important information.',
        noAnswer: 'I could not find an answer right now.',
        unauthorized: 'Please sign in again to continue chatting.',
        contactError: 'Sorry, I had trouble reaching the assistant. Please try again.',
        officialOnly: 'Official Sources Only',
        uploadTitle: 'Upload a document',
        uploadHint: 'Drag and drop a PDF or TXT file, or click to upload.',
        uploadButton: 'Upload',
        uploadPlanLocked: 'Document upload is available on Plus/Pro plans.',
        documentInsights: 'Document Insights',
        explainTab: 'Explain',
        deadlinesTab: 'Deadlines & actions',
        nextStepsTab: 'Possible next steps',
        guidanceDisclaimer: 'This tool provides guidance only and is not legal advice.',
        noDocuments: 'No documents uploaded yet.',
        analyze: 'Analyze',
        deleteDoc: 'Delete',
        analyzing: 'Analyzing...',
        uploadSuccess: 'Document uploaded.',
        uploadError: 'Upload failed.',
        deleteSuccess: 'Document deleted.',
        deleteError: 'Delete failed.',
        analyzeError: 'Analysis failed.',
        uploading: 'Uploading...',
        removeAttachment: 'Remove',
        copiedLabel: 'Copied',
        initialMessages: [
          {
            id: 'm-1',
            role: 'assistant',
            content:
              'Hello. I am here to help with your asylum case and immigration questions.\n\nI can help you understand documents, prepare for interviews, or explain the next steps in your process. How can I assist you today?',
          },
        ],
      },
      tr: {
        assistantName: 'Gocmenlik Asistani',
        assistantStatus: 'Cevrimici · Yapay Zeka Destegi',
        navNewChat: 'Yeni Sohbet',
        navHistory: 'Gecmis',
        navSaved: 'Kaydedilen Belgeler',
        settings: 'Ayarlar',
        home: 'Ana Sayfa',
        currentSession: 'Mevcut Oturum',
        clearChat: 'Yeni Sohbet',
        historyEmpty: 'Henuz konusma yok.',
        historyLoading: 'Yukleniyor...',
        deleteChat: 'Sohbeti sil',
        deleteChatSuccess: 'Sohbet silindi.',
        login: 'Giris yap',
        register: 'Kayit ol',
        changeLanguage: 'Dili degistir',
        newChat: 'Yeni Sohbet',
        help: 'Yardim',
        disclaimer:
          'Konusmaniz gizlidir. Ben bir yapay zeka asistanim, avukat degilim. Lutfen hukuki tavsiyeyi bir uzmandan dogrulayin.',
        userLabel: 'Siz',
        assistantLabel: 'Asistan',
        inputLabel: 'Siginma dosyaniz, belgeleriniz veya sonraki adimlar hakkinda sorun',
        inputPlaceholder: 'Siginma dosyaniz, belgeleriniz veya sonraki adimlar hakkinda sorun...',
        sendMessage: 'Mesaj gonder',
        quickReplies: ['Hangi belgelere ihtiyacim var?', 'Ne kadar surer?', 'Gorusmeden sonra?'],
        thinking: 'Asistan dusunuyor...',
        aiMistakes: 'Yapay zeka hata yapabilir. Lutfen onemli bilgileri kontrol edin.',
        noAnswer: 'Su anda bir yanit bulamadim.',
        unauthorized: 'Sohbete devam etmek icin lutfen tekrar giris yapin.',
        contactError: 'Uzgunum, asistana ulasamiyorum. Lutfen tekrar deneyin.',
        officialOnly: 'Yalnizca Resmi Kaynaklar',
        uploadTitle: 'Belge yukle',
        uploadHint: 'PDF veya TXT dosyasini surukleyip birakin ya da tiklayin.',
        uploadButton: 'Yukle',
        uploadPlanLocked: 'Belge yukleme sadece Plus/Pro planlarda kullanilabilir.',
        documentInsights: 'Belge Ozetleri',
        explainTab: 'Acikla',
        deadlinesTab: 'Tarihler ve islemler',
        nextStepsTab: 'Olası sonraki adimlar',
        guidanceDisclaimer: 'This tool provides guidance only and is not legal advice.',
        noDocuments: 'Henuz belge yuklenmedi.',
        analyze: 'Analiz et',
        deleteDoc: 'Sil',
        analyzing: 'Analiz ediliyor...',
        uploadSuccess: 'Belge yuklendi.',
        uploadError: 'Yukleme basarisiz.',
        deleteSuccess: 'Belge silindi.',
        deleteError: 'Silme basarisiz.',
        analyzeError: 'Analiz basarisiz.',
        uploading: 'Yukleniyor...',
        removeAttachment: 'Kaldir',
        copiedLabel: 'Kopyalandi',
        initialMessages: [
          {
            id: 'm-1',
            role: 'assistant',
            content:
              'Merhaba. Siginma dosyaniz ve gocmenlik sorulariniz konusunda yardim etmek icin buradayim.',
          },
        ],
      },
    }),
    [],
  );
  const t = translations[language];
  const initialMessages = useMemo(() => t.initialMessages, [t]);

  const [messages, setMessages] = useState(initialMessages);

  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const hasHydratedRef = useRef(false);
  const lastLanguageRef = useRef(language);
  const hasServerSnapshotRef = useRef(false);
  const latestSessionsRef = useRef([]);
  const latestInitialMessagesRef = useRef(initialMessages);

  const disclaimer = t.disclaimer;
  const activeSession = useMemo(
    () => sessions.find((session) => session._id === activeSessionId),
    [sessions, activeSessionId],
  );

  useEffect(() => {
    latestSessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    latestInitialMessagesRef.current = initialMessages;
  }, [initialMessages]);

  const cacheKey = userId ? `chatCache:${userId}` : null;
  const loadMemoryCache = () => {
    if (!cacheKey) return null;
    const globalCache = getGlobalCache();
    return globalCache?.[cacheKey] || memoryCache.get(cacheKey) || null;
  };
  const loadCache = (storage) => {
    if (!cacheKey) return null;
    try {
      const raw = storage?.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  const writeCache = (payload) => {
    if (!cacheKey) return;
    memoryCache.set(cacheKey, payload);
    const globalCache = getGlobalCache();
    if (globalCache) {
      globalCache[cacheKey] = payload;
    }
    try {
      const serialized = JSON.stringify(payload);
      localStorage.setItem(cacheKey, serialized);
      sessionStorage.setItem(cacheKey, serialized);
    } catch (err) {
      console.log(err);
    }
  };

  const snapshotSessionMessages = () => {
    const entries = Array.from(sessionMessagesCache.entries());
    return entries.reduce((acc, [id, msgs]) => {
      acc[id] = msgs;
      return acc;
    }, {});
  };

  const mapMessage = (message) => ({
    id: message._id || message.id,
    role: message.role,
    content: message.content,
    citations: message.citations || [],
  });

  const loadSessions = async () => {
    const response = await apiRequest({
      path: '/api/chat/sessions',
      getToken,
      userId,
    });
    const loaded = response?.sessions || [];
    hasServerSnapshotRef.current = true;
    setSessions(loaded);
    writeCache({
      timestamp: Date.now(),
      sessions: loaded,
      activeSessionId,
      messages,
      sessionMessages: snapshotSessionMessages(),
      hasServerSnapshot: true,
    });
    return loaded;
  };

  const createSession = async () => {
    const response = await apiRequest({
      path: '/api/chat/sessions',
      method: 'POST',
      body: {
        title: language === 'tr' ? 'Yeni Sohbet' : 'New chat',
        language,
        initialMessage: initialMessages?.[0]?.content,
      },
      getToken,
      userId,
    });
    const conversation = response?.conversation;
    if (!conversation) return null;

    setActiveSessionId(conversation._id);
    setSessions((prev) => [conversation, ...prev.filter((item) => item._id !== conversation._id)]);
    return conversation._id;
  };

  const loadSession = async (id) => {
    try {
      const response = await apiRequest({
        path: `/api/chat/sessions/${id}`,
        getToken,
        userId,
      });
      const loadedMessages = response?.messages?.map(mapMessage) || [];
      const resolved = loadedMessages.length ? loadedMessages : initialMessages;
      setMessages(resolved);
      setActiveSessionId(id);
      sessionMessagesCache.set(id, resolved);
    } catch (err) {
      setError(err?.message || 'Failed to load chat session.');
      toast.error(err?.message || 'Failed to load chat session.');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await apiRequest({
        path: `/api/chat/sessions/${id}`,
        method: 'DELETE',
        getToken,
        userId,
      });
      setSessions((prev) => prev.filter((session) => session._id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages(initialMessages);
      }
      toast.success(t.deleteChatSuccess);
    } catch (err) {
      setError(err?.message || 'Failed to delete chat.');
    }
  };

  const handleSend = async (text) => {
    const explicitText = typeof text === 'string' ? text.trim() : '';
    const currentInput = typeof input === 'string' ? input.trim() : '';
    const value = explicitText || currentInput;
    if (!value || isLoading) return;

    setError(null);
    if (value) {
      setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: value }]);
    }
    setInput('');
    setIsLoading(true);

    try {
      const sessionId = activeSessionId || (await createSession());
      if (!sessionId) return;

      const response = value
        ? await apiRequest({
            path: `/api/chat/sessions/${sessionId}/messages`,
            method: 'POST',
            body: { content: value, officialOnly },
            getToken,
            userId,
          })
        : null;

      if (response) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response?.assistantMessage?.content || t.noAnswer,
            citations: response?.assistantMessage?.citations || response?.citations || [],
          },
        ]);
      }

      await loadSessions();
    } catch (err) {
      let fallback;
      if (err?.message === 'Unauthorized: Clerk user id missing') {
        fallback = t.unauthorized;
      } else if (err?.message) {
        fallback = err.message;
      } else {
        fallback = t.contactError;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fallback,
        },
      ]);
      setError(err?.message || 'Failed to contact the assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setInput('');
    setError(null);
    setIsLoading(false);
    setActiveSessionId(null);
    setMessages(initialMessages);
  };

  useEffect(() => {
    if (!userId) return;
    let isActive = true;

    const initSessions = async () => {
      setIsSessionsLoading(true);
      try {
        const cached = loadMemoryCache() || loadCache(sessionStorage) || loadCache(localStorage);
        const cachedSessions = Array.isArray(cached?.sessions) ? cached.sessions : [];
        if (cached && cachedSessions.length > 0) {
          setSessions(cachedSessions);
          setActiveSessionId(null);
          setMessages(initialMessages);
          hasServerSnapshotRef.current = Boolean(cached.hasServerSnapshot);
          setIsSessionsLoading(false);
          hasHydratedRef.current = true;
          return;
        }

        await loadSessions();
        if (!isActive) return;
        setMessages(initialMessages);
        setActiveSessionId(null);
      } catch (err) {
        if (isActive) {
          setError(err?.message || 'Failed to load conversations.');
        }
      } finally {
        if (isActive) {
          setIsSessionsLoading(false);
          hasHydratedRef.current = true;
        }
      }
    };

    initSessions();

    return () => {
      isActive = false;
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      // Leaving chat page should reset active conversation context for next visit.
      if (!cacheKey) return;
      const resetPayload = {
        timestamp: Date.now(),
        sessions: latestSessionsRef.current || [],
        activeSessionId: null,
        messages: latestInitialMessagesRef.current || [],
        sessionMessages: {},
        hasServerSnapshot: hasServerSnapshotRef.current,
      };
      memoryCache.set(cacheKey, resetPayload);
      const globalCache = getGlobalCache();
      if (globalCache) {
        globalCache[cacheKey] = resetPayload;
      }
      try {
        const serialized = JSON.stringify(resetPayload);
        localStorage.setItem(cacheKey, serialized);
        sessionStorage.setItem(cacheKey, serialized);
      } catch (err) {
        console.log(err);
      }
    };
  }, [cacheKey]);

  useEffect(() => {
    if (!hasHydratedRef.current || !activeSessionId || !userId) return;
    if (lastLanguageRef.current === language) return;
    lastLanguageRef.current = language;

    apiRequest({
      path: `/api/chat/sessions/${activeSessionId}`,
      method: 'PATCH',
      body: { language },
      getToken,
      userId,
    }).catch(() => {});
  }, [activeSessionId, language, getToken, userId]);

  useEffect(() => {
    if (!userId || !hasHydratedRef.current) return;
    if (!hasServerSnapshotRef.current && sessions.length === 0) return;
    if (activeSessionId) {
      sessionMessagesCache.set(activeSessionId, messages);
    }
    writeCache({
      timestamp: Date.now(),
      sessions,
      activeSessionId,
      messages,
      sessionMessages: snapshotSessionMessages(),
      hasServerSnapshot: hasServerSnapshotRef.current,
    });
  }, [userId, sessions, activeSessionId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 8);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={loadSession}
          onDelete={handleDeleteSession}
          isLoading={isSessionsLoading}
          t={t}
        />
      }
      header={
        <ChatHeader
          title={activeSession?.title}
          t={t}
          onClear={handleClear}
          officialOnly={officialOnly}
          onToggleOfficial={() => setOfficialOnly((prev) => !prev)}
          language={language}
          onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'tr' : 'en'))}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      }
    >
      <Toaster
        position="top-left"
        containerStyle={{
          top: '88px',
          left: '24px',
        }}
      />

      <div className="flex flex-1 flex-col">
        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-[280px] bg-[#0b0d12] px-4 py-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-100">{t.assistantName}</div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#24272f] bg-[#151821] text-slate-200"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block w-full rounded-xl border border-[#24272f] bg-[#151821] px-3 py-2 text-center text-sm font-semibold text-slate-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.home}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleClear();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border border-[#24272f] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  {t.newChat}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage((prev) => (prev === 'en' ? 'tr' : 'en'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border border-[#24272f] bg-[#151821] px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  {language === 'en' ? 'Türkçe' : 'English'}
                </button>
              </div>
              <div className="mt-6 border-t border-[#1e2026] pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t.navHistory}
              </div>
              <div className="mt-3 space-y-2 overflow-y-auto pr-1">
                {sessions.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      item._id === activeSessionId
                        ? 'bg-[#1f222b] text-slate-100'
                        : 'text-slate-400 hover:bg-[#171a21] hover:text-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        loadSession(item._id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 truncate text-left"
                    >
                      {item.title || t.currentSession}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(item._id)}
                      className="ml-2 flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300"
                      aria-label={t.deleteChat}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-0 pb-[160px] pt-6"
        >
          <div className="mx-auto w-full max-w-[780px] px-4">
            <div className="mb-5 flex justify-center">
              <div className="rounded-full border border-[#2a2d36] bg-[#151821] px-4 py-2 text-xs text-slate-400">
                {disclaimer}
              </div>
            </div>
            <p className="mb-5 text-center text-xs text-slate-500">
              Not legal advice.{' '}
              <Link to="/disclaimer" className="font-semibold text-slate-300 underline underline-offset-2 hover:text-slate-100">
                See Disclaimer.
              </Link>
            </p>
          </div>

          <MessageList
            messages={messages}
            userLabel={t.userLabel}
            assistantLabel={t.assistantLabel}
            isTyping={isLoading}
            copiedLabel={t.copiedLabel}
          />
          <div ref={messagesEndRef} />
        </div>

        {showScrollToBottom ? (
          <button
            type="button"
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-28 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2d36] bg-[#151821] text-slate-300 transition hover:border-[#3a3d47]"
            aria-label="Scroll to latest message"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d="m5 8 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <Composer
        input={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        placeholder={t.inputPlaceholder}
        t={t}
      />
    </ChatLayout>
  );
};

export default Chat;
