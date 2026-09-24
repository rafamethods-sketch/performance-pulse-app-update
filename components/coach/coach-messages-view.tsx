"use client";

import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CoachMessagesClient = {
  coachNotes?: string;
  id: string;
  name: string;
  status: string;
};

type CoachMessageThread = {
  clientId: string;
  clientName: string;
  id: string;
  messages: CoachThreadMessage[];
};

type CoachThreadMessage = {
  deletedForEveryoneAt?: string;
  deletedForEveryoneBy?: "athlete" | "coach";
  hiddenForSenderAt?: string;
  id: string;
  read?: boolean;
  sender: "athlete" | "coach";
  text: string;
  timestamp: string;
};

type MessageDeletionAction = "everyone" | "sender";

const DELETE_FOR_EVERYONE_WINDOW_MS = 15 * 60 * 1000;

type CoachQuickMessageTemplate = {
  category: "General" | "Técnica" | "Seguimiento" | "Recuperación" | "Recordatorio";
  text: string;
  title: string;
};

const coachQuickMessageTemplates: CoachQuickMessageTemplate[] = [
  {
    category: "General",
    text: "Buen trabajo en la sesión de hoy. Mantén esta línea y revisamos sensaciones en la próxima.",
    title: "Buen trabajo"
  },
  {
    category: "Seguimiento",
    text: "Cuando puedas, completa el bienestar previo para ajustar mejor la planificación.",
    title: "Completa wellness"
  },
  {
    category: "Técnica",
    text: "Te he dejado feedback técnico en la sesión. Revísalo antes del próximo entrenamiento.",
    title: "Revisa feedback técnico"
  },
  {
    category: "Técnica",
    text: "Cuando hagas el ejercicio principal, si puedes, sube un enlace de vídeo para revisar la técnica.",
    title: "Sube vídeo de técnica"
  },
  {
    category: "Seguimiento",
    text: "He visto tus sensaciones y ajustaremos la carga en la próxima sesión.",
    title: "Ajustamos carga"
  },
  {
    category: "Recuperación",
    text: "Prioriza descanso, hidratación y recuperación antes de la próxima sesión.",
    title: "Recuperación"
  },
  {
    category: "Recordatorio",
    text: "Recuerda registrar la sesión cuando la completes para poder revisar carga y sensaciones.",
    title: "Sesión pendiente"
  },
  {
    category: "Recordatorio",
    text: "Si notas molestias durante la sesión, reduce intensidad y déjalo indicado en el registro.",
    title: "Molestias"
  }
];

export function CoachMessagesView({
  client,
  clients,
  mode = "coach"
}: {
  client?: CoachMessagesClient | null;
  clients: CoachMessagesClient[];
  mode?: "coach" | "athlete";
}) {
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageThreads, setMessageThreads] = useState<CoachMessageThread[]>([]);
  const [messagesHydrated, setMessagesHydrated] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(8);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteDraft, setNewNoteDraft] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState("");
  const [pendingMessageDeletion, setPendingMessageDeletion] = useState<{ action: MessageDeletionAction; messageId: string } | null>(null);
  const [messageActionNotice, setMessageActionNotice] = useState("");
  const visibleClientIds = new Set(clients.map((listedClient) => listedClient.id));

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedThreads = window.localStorage.getItem("coach_message_threads_v1");
      if (storedThreads) {
        const parsedThreads = JSON.parse(storedThreads);
        if (Array.isArray(parsedThreads)) setMessageThreads(parsedThreads);
      }
    } catch {
      setMessageThreads([]);
    } finally {
      setMessagesHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!messagesHydrated || typeof window === "undefined") return;
    window.localStorage.setItem("coach_message_threads_v1", JSON.stringify(messageThreads));
  }, [messageThreads, messagesHydrated]);

  function getMessageTimestampValue(timestamp: string) {
    if (timestamp === "Sistema" || timestamp === "Nota inicial") return 0;
    const parsed = new Date(timestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function canDeleteMessageForEveryone(message: CoachThreadMessage, now = Date.now()) {
    const sentAt = getMessageTimestampValue(message.timestamp);
    const age = now - sentAt;
    return sentAt > 0 && age >= 0 && age <= DELETE_FOR_EVERYONE_WINDOW_MS;
  }

  function isMessageVisibleToCurrentActor(message: CoachThreadMessage) {
    return !(message.sender === mode && message.hiddenForSenderAt);
  }

  function getMessagePreview(message?: CoachThreadMessage) {
    if (!message) return "Sin mensajes todavía.";
    return message.deletedForEveryoneAt ? "Mensaje eliminado" : message.text;
  }

  const allThreads: Array<CoachMessageThread & { lastTimestamp: number; status: string; unread: number; lastMessage: string }> = (client ? [client] : mode === "athlete" ? [] : clients).map((listedClient) => {
    const note = listedClient.coachNotes?.trim() || "Sin notas registradas todavía.";
    const storedThread = messageThreads.find((thread) => thread.clientId === listedClient.id);
    const fallbackMessages: CoachThreadMessage[] = [
      {
        id: `note-${listedClient.id}`,
        read: true,
        sender: "coach",
        text: note,
        timestamp: listedClient.coachNotes?.trim() ? "Nota inicial" : "Sistema"
      }
    ];
    const storedMessages = mode === "athlete"
      ? storedThread?.messages ?? []
      : storedThread ? storedThread.messages : fallbackMessages;
    const messages = storedMessages.filter(isMessageVisibleToCurrentActor);
    const lastVisibleMessage = messages[messages.length - 1];
    const lastMessage = lastVisibleMessage
      ? getMessagePreview(lastVisibleMessage)
      : storedThread ? "Sin mensajes todavía." : note;

    return {
      clientId: listedClient.id,
      clientName: listedClient.name,
      id: storedThread?.id ?? `thread-${listedClient.id}`,
      lastTimestamp: getMessageTimestampValue(lastVisibleMessage?.timestamp ?? ""),
      lastMessage,
      messages,
      status: listedClient.status,
      unread: storedMessages.filter((message) => message.sender === "athlete" && !message.read && !message.deletedForEveryoneAt).length
    };
  }).filter((thread) => visibleClientIds.has(thread.clientId));
  const visibleThreads = allThreads
    .filter((thread) => {
      if (mode === "athlete") return true;
      const query = messageSearch.trim().toLowerCase();
      if (!query) return true;
      return [thread.clientName, thread.lastMessage, ...thread.messages.map((message) => getMessagePreview(message))]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => {
      if (left.unread !== right.unread) return right.unread - left.unread;
      return right.lastTimestamp - left.lastTimestamp;
    });
  const selectedThread =
    visibleThreads.find((thread) => thread.id === selectedThreadId) ?? visibleThreads[0] ?? null;
  const totalUnread = allThreads.reduce((total, thread) => total + thread.unread, 0);

  useEffect(() => {
    if (mode !== "coach" || !messagesHydrated || !selectedThread) return;
    if (!selectedThreadId) setSelectedThreadId(selectedThread.id);
    if (selectedThread.unread === 0) return;
    setMessageThreads((currentThreads) => currentThreads.map((thread) => thread.clientId === selectedThread.clientId
      ? { ...thread, messages: thread.messages.map((message) => message.sender === "athlete" && !message.read && !message.deletedForEveryoneAt ? { ...message, read: true } : message) }
      : thread));
  }, [mode, messagesHydrated, selectedThread, selectedThreadId]);
  const visibleMessages = useMemo(() => {
    if (!selectedThread) return [];
    return selectedThread.messages.slice(Math.max(0, selectedThread.messages.length - visibleMessageCount));
  }, [selectedThread, visibleMessageCount]);
  const hasHiddenMessages = Boolean(selectedThread && selectedThread.messages.length > visibleMessages.length);

  useEffect(() => {
    setVisibleMessageCount(8);
  }, [selectedThread?.id]);

  function saveCoachMessage(thread: CoachMessageThread & { status: string; unread: number; lastMessage: string }, text: string) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const nextMessage: CoachThreadMessage = {
      id: `message-${Date.now()}`,
      read: mode === "coach",
      sender: mode,
      text: trimmedText,
      timestamp: new Date().toISOString()
    };

    setMessageThreads((currentThreads) => {
      const existingThread = currentThreads.find((listedThread) => listedThread.clientId === thread.clientId);
      const nextThread: CoachMessageThread = {
        clientId: thread.clientId,
        clientName: thread.clientName,
        id: existingThread?.id ?? thread.id,
        messages: [...(existingThread?.messages ?? []), nextMessage]
      };

      return existingThread
        ? currentThreads.map((listedThread) => listedThread.clientId === thread.clientId ? nextThread : listedThread)
        : [nextThread, ...currentThreads];
    });
    setSelectedThreadId(thread.id);
  }

  function sendCurrentMessage() {
    if (!selectedThread) return;
    saveCoachMessage(selectedThread, messageDraft);
    setMessageDraft("");
  }

  function requestMessageDeletion(message: CoachThreadMessage, action: MessageDeletionAction) {
    if (message.sender !== mode || message.deletedForEveryoneAt || message.hiddenForSenderAt) return;
    if (action === "everyone" && !canDeleteMessageForEveryone(message)) {
      setMessageActionNotice("Ya no está disponible la eliminación para todos.");
      setOpenMessageMenuId("");
      return;
    }
    setMessageActionNotice("");
    setOpenMessageMenuId("");
    setPendingMessageDeletion({ action, messageId: message.id });
  }

  function confirmMessageDeletion() {
    if (!selectedThread || !pendingMessageDeletion) return;
    const storedThread = messageThreads.find((thread) => thread.clientId === selectedThread.clientId);
    const message = (storedThread?.messages ?? selectedThread.messages).find((item) => item.id === pendingMessageDeletion.messageId);
    if (!message || message.sender !== mode || message.deletedForEveryoneAt || message.hiddenForSenderAt) {
      setPendingMessageDeletion(null);
      return;
    }
    if (pendingMessageDeletion.action === "everyone" && !canDeleteMessageForEveryone(message)) {
      setMessageActionNotice("Ya no está disponible la eliminación para todos.");
      setPendingMessageDeletion(null);
      return;
    }

    const changedAt = new Date().toISOString();
    const updatedMessages = (storedThread?.messages ?? selectedThread.messages).map((item) => item.id !== message.id
      ? item
      : pendingMessageDeletion.action === "everyone"
        ? { ...item, deletedForEveryoneAt: changedAt, deletedForEveryoneBy: mode }
        : { ...item, hiddenForSenderAt: changedAt });

    setMessageThreads((currentThreads) => {
      const existingThread = currentThreads.find((thread) => thread.clientId === selectedThread.clientId);
      const updatedThread: CoachMessageThread = {
        clientId: selectedThread.clientId,
        clientName: selectedThread.clientName,
        id: existingThread?.id ?? selectedThread.id,
        messages: updatedMessages
      };
      return existingThread
        ? currentThreads.map((thread) => thread.clientId === selectedThread.clientId ? updatedThread : thread)
        : [updatedThread, ...currentThreads];
    });
    setPendingMessageDeletion(null);
  }

  function applyQuickMessageTemplate(template: CoachQuickMessageTemplate) {
    if (messageDraft.trim() && typeof window !== "undefined") {
      const shouldReplace = window.confirm("Esto reemplazará el mensaje actual. ¿Quieres continuar?");
      if (!shouldReplace) return;
    }

    setMessageDraft(template.text);
  }

  function saveNewNote() {
    if (!selectedThread) return;
    saveCoachMessage(selectedThread, newNoteDraft);
    setNewNoteDraft("");
    setShowNewNoteModal(false);
  }

  function formatMessageTime(timestamp: string) {
    if (timestamp === "Sistema" || timestamp === "Nota inicial") return timestamp;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleString("es-ES", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" });
  }

  return (
    <div
      className={`grid h-[min(52rem,calc(100dvh-19rem))] min-h-[32rem] min-w-0 grid-rows-[minmax(9rem,0.35fr)_minmax(0,1fr)] gap-3 overflow-hidden md:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1.28fr)] md:grid-rows-1 md:gap-4 ${
        mode === "athlete"
          ? "mx-auto mt-5 w-full max-w-5xl xl:h-[min(52rem,calc(100dvh-10.5rem))] xl:min-h-[34rem]"
          : "mt-6 lg:h-[min(52rem,calc(100dvh-10.5rem))] lg:min-h-[34rem]"
      }`}
    >
      <section className="coach-surface flex min-h-0 min-w-0 flex-col rounded-md p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink sm:text-lg">Conversaciones</h2>
            {mode === "athlete" ? <p className="mt-0.5 text-xs text-ink/50">Tu entrenador y contactos disponibles.</p> : null}
          </div>
          {mode === "coach" ? (
            <span className="shrink-0 rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
              {totalUnread} sin leer
            </span>
          ) : null}
        </div>
        {!client ? (
          <label className="mt-4 block space-y-2 text-sm font-medium text-ink/75">
            Buscar conversación
            <input
              className="h-11 w-full rounded-md border border-line bg-panel/35 px-3 text-ink outline-none placeholder:text-ink/35 focus:border-moss"
              onChange={(event) => {
                setMessageSearch(event.target.value);
                setSelectedThreadId("");
              }}
              placeholder="Buscar conversación..."
              type="search"
              value={messageSearch}
            />
          </label>
        ) : null}
        <p className="mt-4 text-xs font-semibold uppercase text-ink/45">Conversaciones recientes</p>
        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
          {visibleThreads.length > 0 ? (
            visibleThreads.map((thread) => (
              <button
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedThread?.id === thread.id
                    ? "border-moss bg-panel"
                    : "border-line bg-panel/35 hover:bg-panel"
                }`}
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{thread.clientName}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/60">{thread.lastMessage}</p>
                  </div>
                  {thread.unread > 0 && (
                    <span className="grid size-6 place-items-center rounded-full bg-clay text-xs font-semibold text-white">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-line bg-panel/35 p-4 text-sm font-semibold text-ink/50">
              No hay conversaciones todavía.
            </p>
          )}
        </div>
      </section>

      <section className="coach-surface flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md p-3 sm:p-4">
        {selectedThread ? (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{mode === "athlete" ? "Chat con tu entrenador" : selectedThread.clientName}</h2>
                <p className="text-sm text-ink/50">{mode === "athlete" ? "Usa este espacio para dudas sobre tus sesiones y seguimiento." : selectedThread.status}</p>
              </div>
              {mode === "coach" ? (
              <button
                className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white"
                onClick={() => setShowNewNoteModal(true)}
                type="button"
              >
                Nueva nota
              </button>
              ) : null}
            </div>

            <div className={`mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 sm:mt-4 ${mode === "coach" ? "space-y-2" : "space-y-3"}`}>
              {messageActionNotice ? (
                <p className="rounded-md border border-line bg-panel/50 px-3 py-2 text-xs font-semibold text-ink/60">{messageActionNotice}</p>
              ) : null}
              {visibleMessages.length === 0 ? (
                <p className="rounded-md border border-dashed border-line bg-panel/35 p-5 text-sm text-ink/60">
                  {mode === "athlete" ? "Todavía no hay mensajes. Escribe a tu entrenador cuando lo necesites." : "Todavía no hay mensajes."}
                </p>
              ) : null}
              {hasHiddenMessages ? (
                <div className="flex justify-center">
                  <button
                    className="rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/65 transition hover:bg-panel"
                    onClick={() => setVisibleMessageCount((current) => current + 8)}
                    type="button"
                  >
                    Ver mensajes anteriores
                  </button>
                </div>
              ) : null}
              {visibleMessages.map((message) => {
                const isOwnMessage = message.sender === mode;
                const isTombstone = Boolean(message.deletedForEveryoneAt);
                const canDeleteForEveryone = isOwnMessage && canDeleteMessageForEveryone(message);
                return (
                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  <div className="group relative flex max-w-[88%] items-start gap-1.5">
                    <div
                      className={`min-w-0 rounded-md border text-sm [overflow-wrap:anywhere] ${isTombstone ? "px-3 py-1.5 italic" : mode === "coach" ? "px-3 py-2" : "px-4 py-3"} ${
                        isTombstone
                          ? "border-line bg-panel/35 text-ink/45"
                          : isOwnMessage
                          ? mode === "athlete"
                            ? "border-moss/30 bg-moss/15 text-ink"
                            : "border-slate-700 bg-slate-900 text-slate-100"
                          : "border-line bg-panel/60 text-ink"
                      }`}
                    >
                      <p>{isTombstone ? "Mensaje eliminado" : message.text}</p>
                      <p className={`text-xs ${isTombstone ? "mt-0.5" : mode === "coach" ? "mt-1" : "mt-2"} ${mode === "coach" && isOwnMessage && !isTombstone ? "text-slate-300" : "text-ink/60"}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                    {isOwnMessage && !isTombstone ? (
                      <div className="relative shrink-0">
                        <button
                          aria-expanded={openMessageMenuId === message.id}
                          aria-label="Opciones del mensaje"
                          className="grid size-8 place-items-center rounded-md border border-line bg-white text-ink/50 transition hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                          onClick={() => setOpenMessageMenuId((current) => current === message.id ? "" : message.id)}
                          title="Opciones del mensaje"
                          type="button"
                        >
                          <MoreHorizontal aria-hidden="true" size={16} />
                        </button>
                        {openMessageMenuId === message.id ? (
                          <div className={`absolute top-9 z-20 min-w-44 rounded-md border border-line bg-white p-1 shadow-soft ${isOwnMessage ? "right-0" : "left-0"}`}>
                            {canDeleteForEveryone ? (
                              <button className="block w-full rounded px-3 py-2 text-left text-xs font-semibold text-clay hover:bg-coral/10" onClick={() => requestMessageDeletion(message, "everyone")} type="button">Eliminar para todos</button>
                            ) : null}
                            <button className="block w-full rounded px-3 py-2 text-left text-xs font-semibold text-ink/65 hover:bg-panel" onClick={() => requestMessageDeletion(message, "sender")} type="button">Eliminar de mi vista</button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                );
              })}
            </div>

            {mode === "coach" ? (
            <div className="mt-3 shrink-0 rounded-md border border-line bg-panel/35 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">Plantillas rápidas</h3>
                <button
                  className="w-fit rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:bg-panel"
                  onClick={() => setShowQuickTemplates((current) => !current)}
                  type="button"
                >
                  {showQuickTemplates ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {showQuickTemplates ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {coachQuickMessageTemplates.map((template) => (
                  <button
                    className="rounded-md border border-line bg-white px-3 py-2 text-left text-xs font-semibold text-ink/70 transition hover:bg-panel"
                    key={template.title}
                    onClick={() => applyQuickMessageTemplate(template)}
                    title={template.text}
                    type="button"
                  >
                    <span className="block text-ink">{template.title}</span>
                    <span className="mt-0.5 block text-[11px] text-ink/45">{template.category}</span>
                  </button>
                ))}
              </div>
              ) : null}
            </div>

            ) : null}
            <div className="mt-3 flex shrink-0 gap-2 rounded-md border border-line bg-panel/35 p-2">
              <input
                className="h-11 min-w-0 flex-1 rounded-md border border-line bg-panel/45 px-3 text-ink outline-none placeholder:text-ink/35 focus:border-moss"
                onChange={(event) => setMessageDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendCurrentMessage();
                }}
                placeholder="Escribe un mensaje"
                type="text"
                value={messageDraft}
              />
              <button
                className="rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-panel disabled:text-ink/35"
                disabled={!messageDraft.trim()}
                onClick={sendCurrentMessage}
                type="button"
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-line bg-panel/35 p-6 text-center">
            <h2 className="text-lg font-semibold text-ink">{mode === "athlete" ? "No hay deportista seleccionado." : "No hay conversaciones todavía."}</h2>
            {mode === "coach" ? <p className="mt-2 text-sm text-ink/55">
              Las conversaciones aparecerán cuando exista un cliente o una nota asociada.
            </p> : null}
          </div>
        )}
      </section>
      {mode === "coach" && showNewNoteModal && selectedThread ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
          onClick={() => setShowNewNoteModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-md border border-line bg-white p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Nueva nota</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{selectedThread.clientName}</h3>
              </div>
              <button
                className="grid size-9 place-items-center rounded-md border border-line bg-panel text-ink"
                onClick={() => setShowNewNoteModal(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              className="mt-4 min-h-32 w-full rounded-md border border-line bg-panel/45 px-3 py-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-moss"
              onChange={(event) => setNewNoteDraft(event.target.value)}
              placeholder={"Escribe una nota para esta conversación"}
              value={newNoteDraft}
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70"
                onClick={() => setShowNewNoteModal(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-panel disabled:text-ink/35"
                disabled={!newNoteDraft.trim()}
                onClick={saveNewNote}
                type="button"
              >
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingMessageDeletion ? (
        <div aria-labelledby="message-delete-dialog-title" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onClick={() => setPendingMessageDeletion(null)} role="dialog">
          <div className="w-full max-w-md rounded-md border border-line bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-semibold text-ink" id="message-delete-dialog-title">
              {pendingMessageDeletion.action === "everyone" ? "Eliminar para todos" : "Eliminar de mi vista"}
            </h3>
            <p className="mt-2 text-sm text-ink/60">
              {pendingMessageDeletion.action === "everyone"
                ? "Este mensaje dejará de estar disponible para ambos."
                : "El mensaje seguirá visible para la otra persona."}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/65" onClick={() => setPendingMessageDeletion(null)} type="button">Cancelar</button>
              <button className="rounded-md border border-coral/30 bg-coral/10 px-4 py-2 text-sm font-semibold text-clay" onClick={confirmMessageDeletion} type="button">
                {pendingMessageDeletion.action === "everyone" ? "Eliminar para todos" : "Eliminar de mi vista"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
