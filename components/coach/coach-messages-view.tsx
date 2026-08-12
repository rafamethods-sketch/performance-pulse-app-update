"use client";

import { X } from "lucide-react";
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
  id: string;
  read?: boolean;
  sender: "athlete" | "coach";
  text: string;
  timestamp: string;
};

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
  clients
}: {
  client?: CoachMessagesClient | null;
  clients: CoachMessagesClient[];
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

  const visibleThreads: Array<CoachMessageThread & { lastTimestamp: number; status: string; unread: number; lastMessage: string }> = (client ? [client] : clients).map((listedClient) => {
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
    const messages = storedThread?.messages?.length ? storedThread.messages : fallbackMessages;
    const lastMessage = messages[messages.length - 1]?.text ?? note;

    return {
      clientId: listedClient.id,
      clientName: listedClient.name,
      id: storedThread?.id ?? `thread-${listedClient.id}`,
      lastTimestamp: getMessageTimestampValue(messages[messages.length - 1]?.timestamp ?? ""),
      lastMessage,
      messages,
      status: listedClient.status,
      unread: messages.filter((message) => message.sender === "athlete" && !message.read).length
    };
  })
    .filter((thread) => visibleClientIds.has(thread.clientId))
    .filter((thread) => {
      const query = messageSearch.trim().toLowerCase();
      if (!query) return true;
      return [thread.clientName, thread.lastMessage, ...thread.messages.map((message) => message.text)]
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
      read: true,
      sender: "coach",
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
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="coach-surface rounded-md p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Conversaciones</h2>
          <span className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
            {visibleThreads.reduce((total, thread) => total + thread.unread, 0)} sin leer
          </span>
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
        <div className="mt-4 space-y-2">
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

      <section className="coach-surface rounded-md p-4">
        {selectedThread ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{selectedThread.clientName}</h2>
                <p className="text-sm text-ink/50">{selectedThread.status}</p>
              </div>
              <button
                className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white"
                onClick={() => setShowNewNoteModal(true)}
                type="button"
              >
                Nueva nota
              </button>
            </div>

            <div className="mt-4 space-y-3">
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
              {visibleMessages.map((message) => (
                <div
                  className={`flex ${message.sender === "coach" ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  <div
                    className={`max-w-[80%] rounded-md border px-4 py-3 text-sm ${
                      message.sender === "coach"
                        ? "border-moss/20 bg-ink text-white"
                        : "border-line bg-panel/60 text-ink"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-2 text-xs ${message.sender === "coach" ? "text-white/60" : "text-ink/45"}`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-line bg-panel/35 p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Plantillas rápidas</h3>
                  <p className="text-xs text-ink/50">Inserta respuestas habituales cuando las necesites.</p>
                </div>
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

            <div className="mt-5 flex gap-2 rounded-md border border-line bg-panel/35 p-2">
              <input
                className="h-11 flex-1 rounded-md border border-line bg-panel/45 px-3 text-ink outline-none placeholder:text-ink/35 focus:border-moss"
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
            <h2 className="text-lg font-semibold text-ink">No hay conversaciones todavía.</h2>
            <p className="mt-2 text-sm text-ink/55">
              Las conversaciones aparecerán cuando exista un cliente o una nota asociada.
            </p>
          </div>
        )}
      </section>
      {showNewNoteModal && selectedThread ? (
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
    </div>
  );
}
