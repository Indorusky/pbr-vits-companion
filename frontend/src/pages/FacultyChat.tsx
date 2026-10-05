import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeaders, cachedFetch, invalidateApiCache } from '../config';
import { MessageSquare, Send, User, Building, ChevronRight, RefreshCw, AlertCircle, Clock, CheckCheck, Sparkles } from 'lucide-react';

interface FacultyListItem {
  id: number;
  username: string;
  name: string;
  department?: string;
  designation?: string;
  email?: string;
  profile_photo?: string;
}

interface StudentInfoSummary {
  id: number;
  name: string;
  username: string;
  roll_number?: string;
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
}

interface FacultyInfoSummary {
  id: number;
  name: string;
  username: string;
  department?: string;
  designation?: string;
  email?: string;
}

interface ConversationOut {
  id: number;
  student_id: number;
  faculty_id: number;
  department?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_by_student: number;
  unread_by_faculty: number;
  student?: StudentInfoSummary;
  faculty?: FacultyInfoSummary;
}

interface MessageOut {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const FacultyChat: React.FC = () => {
  const { user } = useAuth();

  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [facultyList, setFacultyList] = useState<FacultyListItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');

  const [conversations, setConversations] = useState<ConversationOut[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationOut | null>(null);
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);
  const [loadingFaculty, setLoadingFaculty] = useState<boolean>(false);
  const [loadingConvs, setLoadingConvs] = useState<boolean>(true);
  const [loadingMsgs, setLoadingMsgs] = useState<boolean>(false);
  const [startingChat, setStartingChat] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch departments and existing conversation list
  useEffect(() => {
    fetchDepartments();
    fetchConversations();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepts(true);
      const res = await cachedFetch(`${API_BASE_URL}/faculty-chat/departments`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
        if (data.length > 0) {
          setSelectedDepartment(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching departments:', e);
    } finally {
      setLoadingDepts(false);
    }
  };

  // 2. Fetch faculty list when selected department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchFacultyByDept(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchFacultyByDept = async (dept: string) => {
    try {
      setLoadingFaculty(true);
      setSelectedFacultyId('');
      const res = await cachedFetch(`${API_BASE_URL}/faculty-chat/faculty?department=${encodeURIComponent(dept)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data);
        if (data.length > 0) {
          setSelectedFacultyId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching faculty list:', e);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await cachedFetch(`${API_BASE_URL}/faculty-chat/conversations`, {
        headers: getAuthHeaders()
      }, 10000); // 10s TTL
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // If active conversation exists, update its details
        if (activeConversation) {
          const updated = data.find((c: ConversationOut) => c.id === activeConversation.id);
          if (updated) setActiveConversation(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadConversationMessages = async (conv: ConversationOut) => {
    setActiveConversation(conv);
    setErrorMsg('');
    try {
      setLoadingMsgs(true);
      const res = await fetch(`${API_BASE_URL}/faculty-chat/conversations/${conv.id}/messages`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Mark as read if unread
        if (conv.unread_by_student > 0) {
          markAsRead(conv.id);
        }
      } else {
        setErrorMsg('Failed to load conversation messages.');
      }
    } catch (e) {
      console.error('Error loading messages:', e);
      setErrorMsg('Network error loading messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const markAsRead = async (convId: number) => {
    try {
      await fetch(`${API_BASE_URL}/faculty-chat/conversations/${convId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      invalidateApiCache('/faculty-chat/conversations');
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_by_student: 0 } : c));
    } catch (e) {
      console.error('Error marking read:', e);
    }
  };

  const handleStartOrOpenChat = async () => {
    if (!selectedFacultyId) {
      setErrorMsg('Please select a faculty member.');
      return;
    }
    setErrorMsg('');
    try {
      setStartingChat(true);
      const res = await fetch(`${API_BASE_URL}/faculty-chat/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ faculty_id: selectedFacultyId })
      });
      if (res.ok) {
        const conv: ConversationOut = await res.json();
        invalidateApiCache('/faculty-chat/conversations');
        await fetchConversations();
        loadConversationMessages(conv);
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to start chat session.');
      }
    } catch (e) {
      console.error('Error starting chat:', e);
      setErrorMsg('Error connecting to backend server.');
    } finally {
      setStartingChat(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/faculty-chat/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const sentMsg: MessageOut = await res.json();
        setMessages(prev => [...prev, sentMsg]);
        invalidateApiCache('/faculty-chat/conversations');
        
        // Update local conversation preview
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              last_message_preview: textToSend,
              last_message_at: sentMsg.created_at,
              updated_at: sentMsg.created_at
            };
          }
          return c;
        }));
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to send message.');
        setNewMessage(textToSend); // Restore text on failure
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setErrorMsg('Network error sending message.');
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const parseIsoDate = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      let str = isoStr;
      if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-')) {
        str = str + 'Z';
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const formatTimeAgo = (isoStr?: string) => {
    const d = parseIsoDate(isoStr);
    if (!d) return isoStr || '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const formatMsgTime = (isoStr?: string) => {
    const d = parseIsoDate(isoStr);
    if (!d) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Faculty Chat</h1>
              <p className="text-xs text-slate-500 font-medium">Direct 1-on-1 messaging with your department professors & advisors</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Persistent Messaging</span>
          </span>
          <button
            onClick={() => {
              invalidateApiCache('/faculty-chat');
              fetchConversations();
              if (selectedDepartment) fetchFacultyByDept(selectedDepartment);
            }}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh Conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Panel (Department & Selector + Conversation List) & Right Panel (Chat Window) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Selector & Recent Chats (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Department & Faculty Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Start New Conversation</span>
            </h2>

            {/* Department Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Department</label>
              {loadingDepts ? (
                <div className="h-10 bg-slate-100 animate-pulse rounded-xl"></div>
              ) : (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Faculty Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Faculty Member</label>
              {loadingFaculty ? (
                <div className="h-10 bg-slate-100 animate-pulse rounded-xl"></div>
              ) : facultyList.length === 0 ? (
                <div className="p-2.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
                  No faculty listed for this department.
                </div>
              ) : (
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation || 'Faculty'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Start Chat Button */}
            <button
              onClick={handleStartOrOpenChat}
              disabled={startingChat || !selectedFacultyId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {startingChat ? (
                <span>Starting Conversation...</span>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Chat Window</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: My Faculty Chats List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                My Faculty Chats
              </h2>
              {conversations.length > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                </span>
              )}
            </div>

            {loadingConvs ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No faculty conversations yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Select a department and faculty member above to start your first chat.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {conversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  const facName = conv.faculty?.name || 'Faculty Member';
                  const facDept = conv.faculty?.department || conv.department || 'Department';

                  return (
                    <div
                      key={conv.id}
                      onClick={() => loadConversationMessages(conv)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                          : 'bg-white border-slate-150 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                          {facName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-bold text-slate-900 truncate">{facName}</h3>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatTimeAgo(conv.last_message_at || conv.updated_at)}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 truncate">{facDept}</p>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5 font-normal">
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      {conv.unread_by_student > 0 && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                          {conv.unread_by_student}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Window (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
            {activeConversation ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-slate-150 bg-slate-50/60 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {activeConversation.faculty?.name?.charAt(0) || 'F'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold text-slate-900 truncate">
                        {activeConversation.faculty?.name || 'Faculty Member'}
                      </h2>
                      <p className="text-xs font-semibold text-blue-600 truncate">
                        {activeConversation.faculty?.designation || 'Faculty'} • {activeConversation.faculty?.department || activeConversation.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Connected</span>
                    </span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {loadingMsgs ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-500">Loading conversation history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No messages exchanged yet</p>
                      <p className="text-[11px] text-slate-400">Type your query below to start the conversation with your professor.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === user?.id || m.sender_role === 'student';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                            {isMe ? 'You' : m.sender_name}
                          </div>
                          <div
                            className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-xs ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {m.message}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium mt-1 px-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{formatMsgTime(m.created_at)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Controls */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to faculty..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 flex items-center justify-center shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/20">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm border border-blue-150">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">No Chat Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Select a faculty member from the dropdown or click a previous conversation from the list on the left to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyChat;
