'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, Loader2, Plus, Camera, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

type Ticket = { id: string; title: string; created_at: string; status: string };
type ChatMessage = { id: string; sender_type: string; message: string; attachment_data: string | null; created_at: string };

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const [msgText, setMsgText] = useState('');
    
    const [isLoadingText, setIsLoadingText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [pendingScreenshot, setPendingScreenshot] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-refresh messages when in chat view
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && view === 'chat' && activeTicketId) {
            interval = setInterval(() => {
                // Background update without showing "Carregando..." blocker
                fetch(`/api/support/${activeTicketId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.messages && data.messages.length > 0) {
                            setMessages(data.messages);
                        }
                    })
                    .catch(console.error);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen, view, activeTicketId]);

    // Fetch tickets when opened list
    useEffect(() => {
        if (isOpen && view === 'list') {
            fetchTickets();
        }
    }, [isOpen, view]);

    const fetchTickets = async () => {
        setIsLoadingText('Carregando chats...');
        try {
            const res = await fetch('/api/support');
            if (res.ok) {
                const data = await (res as any).json();
                setTickets(data.tickets || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingText('');
        }
    };

    const fetchMessages = async (ticketId: string) => {
        setIsLoadingText('Carregando mensagens...');
        try {
            const res = await fetch(`/api/support/${ticketId}`);
            if (res.ok) {
                const data = await (res as any).json();
                setMessages(data.messages || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingText('');
        }
    };

    const handleCreateChat = async () => {
        setIsSending(true);
        try {
            const title = `Chat de Suporte - ${new Date().toLocaleDateString('pt-BR')}`;
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                const data = await (res as any).json();
                setActiveTicketId(data.ticketId);
                setView('chat');
                setMessages([]);
                fetchTickets(); // refresh background list
            }
        } catch (e) {
             console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    const handleOpenChat = (ticketId: string) => {
        setActiveTicketId(ticketId);
        setView('chat');
        fetchMessages(ticketId);
    };

    const handleBackToList = () => {
        setView('list');
        setActiveTicketId(null);
    };

    const handleSendMessage = async (e?: React.FormEvent, attachmentData?: string | null) => {
        if (e) e.preventDefault();
        if (!activeTicketId) return;
        
        const finalAttachment = attachmentData || pendingScreenshot;
        const textToSend = msgText.trim();
        if (!textToSend && !finalAttachment) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/support/${activeTicketId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: textToSend || 'Captura de tela enviada.', attachment_data: finalAttachment || null })
            });

            if (res.ok) {
                setMsgText('');
                setPendingScreenshot(null);
                // re-fetch to get accurate time and ID, or just optimism. Let's re-fetch.
                await fetchMessages(activeTicketId);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendScreenshot = async () => {
        setIsSending(true);
        try {
            // Temporarily hide chat window so it doesn't block the screen
            const chatUI = document.getElementById('chat-widget-ui');
            if (chatUI) chatUI.style.opacity = '0';
            
            await new Promise(r => setTimeout(r, 450)); // wait for DOM to reflect animation

            const canvas = await html2canvas(document.body, { useCORS: true, allowTaint: true });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality

            if (chatUI) chatUI.style.opacity = '1';

            // Set the screenshot to preview state instead of sending immediately
            setPendingScreenshot(dataUrl);

        } catch (e) {
            console.error('Screenshot failed', e);
            const chatUI = document.getElementById('chat-widget-ui');
            if (chatUI) chatUI.style.opacity = '1';
        } finally {
            setIsSending(false);
        }
    };

    const widgetContent = isOpen ? (
        <div id="chat-widget-ui" className="fixed bottom-20 right-6 w-[320px] sm:w-[350px] h-[550px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 z-[99999] transition-opacity">
            
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-2">
                            {view === 'chat' && (
                                <button onClick={handleBackToList} className="hover:bg-emerald-700 p-1 rounded-full transition-colors mr-1">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-bold text-sm">{view === 'chat' ? 'Chat Atual' : 'Histórico de Atendimento'}</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-700 p-1 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 flex-1 overflow-y-auto flex flex-col h-[320px]">
                        {isLoadingText && !isSending && (
                            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            </div>
                        )}

                        {view === 'list' && (
                            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                                <button 
                                    onClick={handleCreateChat}
                                    disabled={isSending}
                                    className="w-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    INICIAR NOVO CHAT
                                </button>
                                
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2">Chats Anteriores</h4>
                                    {tickets.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic text-center py-4">Nenhum chat anterior encontrado.</p>
                                    ) : (
                                        tickets.map(t => (
                                            <button 
                                                key={t.id} 
                                                onClick={() => handleOpenChat(t.id)}
                                                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-sm text-left transition-all"
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.title}</p>
                                                    <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${t.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {t.status === 'CLOSED' ? 'Encerrado' : 'Aberto'}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {view === 'chat' && (
                            <div className="flex flex-col flex-1 p-4 space-y-3">
                                {messages.map((m, idx) => (
                                    <div key={m.id || idx} className={`flex ${m.sender_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex flex-col gap-2 ${
                                            m.sender_type === 'USER' 
                                            ? 'bg-emerald-600 text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm rounded-tl-sm'
                                        }`}>
                                            {m.attachment_data && (
                                                <div className="relative rounded-lg overflow-hidden border border-black/10">
                                                    <img src={m.attachment_data} alt="Screenshot" className="max-w-full object-cover" />
                                                </div>
                                            )}
                                            {m.message && <span>{m.message}</span>}
                                            <span className={`text-[9px] font-medium opacity-60 text-right ${m.sender_type === 'USER' ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {view === 'chat' && (
                        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-col">
                            {pendingScreenshot && (
                                <div className="p-3 pb-0">
                                    <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                                        <img src={pendingScreenshot} alt="Preview" className="h-20 w-auto object-cover opacity-80" />
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                            <ImageIcon className="text-white w-6 h-6 opacity-70" />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setPendingScreenshot(null)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                                            title="Remover captura"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 ml-1">Imagem pronta. Adicione uma mensagem e aperte Enviar.</p>
                                </div>
                            )}
                            <div className="p-3">
                                <form onSubmit={handleSendMessage}>
                                <div className="flex items-center gap-2 relative">
                                    <button 
                                        type="button"
                                        onClick={handleSendScreenshot}
                                        disabled={isSending || !!pendingScreenshot}
                                        title="Enviar Captura da Tela"
                                        className="w-10 h-[40px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    
                                    <textarea
                                        placeholder="Sua mensagem..."
                                        value={msgText}
                                        onChange={(e) => setMsgText(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-12 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-[40px] scrollbar-hide flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (msgText.trim() || pendingScreenshot) {
                                                    handleSendMessage(e);
                                                }
                                            }
                                        }}
                                    />
                                    
                                    <button
                                        type="submit"
                                        disabled={isSending || (!msgText.trim() && !pendingScreenshot && !isSending)}
                                        className="absolute right-1 top-1 bottom-1 w-9 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                    >
                                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </div>
            ) : null;

    return (
        <>
            {mounted && createPortal(widgetContent, document.body)}

            <div className="relative">
                {/* O Botão original flutuante ou fixo */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 transition-colors relative"
                    title="Suporte"
                    aria-label="Abrir Chat de Suporte"
                >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    {!isOpen && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse" />
                    )}
                </button>
            </div>
        </>
    );
}
