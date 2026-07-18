"use client";

import { calculateSessionLoad } from "@/lib/client-metrics";
import type { CoachClientForViews, CoachSessionRecordForViews, TargetTrainingSession } from "./types";

function hasDisplayValue(value: unknown) {
  return value !== null && value !== undefined && `${value}`.trim() !== "";
}

function parseDateValue(value?: string | null) {
  if (!value || value === "sin fecha") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateShort(value?: string | null) {
  const date = parseDateValue(value);
  if (!date) return value ?? "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysUntil(value?: string | null) {
  const date = parseDateValue(value);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

function getSessionDateTime(session: CoachSessionRecordForViews) {
  return parseDateValue(session.date)?.getTime() ?? 0;
}

function getLatestSession(client: CoachClientForViews) {
  return [...(client.sessionRecords ?? [])].sort((a, b) => getSessionDateTime(b) - getSessionDateTime(a))[0] ?? null;
}

function isSameReferenceWeek(date: Date | null, referenceDate: Date | null) {
  if (!date || !referenceDate) return false;
  const start = new Date(referenceDate);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function getClientEvent(client: CoachClientForViews) {
  const eventName = client.planning.eventName ?? client.nextEvent?.split(" - ")[0] ?? "";
  const eventDate = client.planning.eventDate ?? client.nextEvent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] ?? "";

  if (!eventName && !eventDate) return null;

  return {
    date: eventDate,
    daysUntil: getDaysUntil(eventDate),
    name: eventName || "Evento sin nombre"
  };
}

function getWeeklySessionStatus(session: CoachSessionRecordForViews) {
  if (hasDisplayValue(session.duration) && hasDisplayValue(session.rpe) && hasDisplayValue(session.notes)) {
    return "Pendiente de revisar";
  }
  if (hasDisplayValue(session.duration) && hasDisplayValue(session.rpe)) return "Completada";
  return "Pendiente";
}

function hasRealSessionData(session: CoachSessionRecordForViews) {
  return Boolean(
    session.completed ||
    hasDisplayValue(session.duration) ||
    hasDisplayValue(session.rpe) ||
    hasDisplayValue(session.finalRpe) ||
    hasDisplayValue(session.actualDurationMinutes) ||
    hasDisplayValue(session.sRPE) ||
    hasDisplayValue(session.srpe) ||
    hasDisplayValue(session.finalNotes) ||
    hasDisplayValue(session.notes) ||
    (session.performedExercises?.length ?? 0) > 0
  );
}

function isSessionPendingReview(session: CoachSessionRecordForViews) {
  if (session.reviewStatus === "reviewed") return false;
  return hasRealSessionData(session);
}

function TodaySummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4 shadow-soft">
      <p className="text-sm font-semibold text-ink/65">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-moss">{value}</p>
    </article>
  );
}

function ClientInfoCard({ className = "", label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={`rounded-md bg-panel/45 px-3 py-2 ${className}`}>
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function isSameCalendarDay(date: Date | null, referenceDate: Date) {
  if (!date) return false;
  return getDateKey(date) === getDateKey(referenceDate);
}

type CoachTodayViewProps = {
  clients: CoachClientForViews[];
  onOpenTrainingSession: (clientId: string, target?: TargetTrainingSession) => void;
};

export function CoachTodayView({ clients, onOpenTrainingSession }: CoachTodayViewProps) {
  const allSessions = clients.flatMap((client) =>
    (client.sessionRecords ?? []).map((session, sessionIndex) => ({ client, session, sessionIndex }))
  );
  const today = new Date();
  const weeklySessions = allSessions.filter(({ session }) =>
    isSameReferenceWeek(parseDateValue(session.date), today)
  );
  const todaySessions = allSessions.filter(({ session }) =>
    isSameCalendarDay(parseDateValue(session.date), today)
  );
  const pendingReviews = allSessions
    .filter(({ session }) => isSessionPendingReview(session))
    .sort((a, b) => getSessionDateTime(b.session) - getSessionDateTime(a.session))
    .slice(0, 6);
  const alerts = clients.flatMap((client) => {
    const latestSession = getLatestSession(client);
    const clientAlerts: { client: CoachClientForViews; label: string; tone: string }[] = [];
    const event = getClientEvent(client);
    const hasPendingReview = (client.sessionRecords ?? []).some((session) =>
      isSessionPendingReview(session)
    );

    if (hasPendingReview) {
      clientAlerts.push({ client, label: "Sesión pendiente de revisar", tone: "revisar" });
    }
    if (latestSession && Number(latestSession.rpe) >= 8) {
      clientAlerts.push({ client, label: "RPE final alto", tone: "vigilar" });
    }
    if (latestSession && calculateSessionLoad(Number(latestSession.rpe), Number(latestSession.duration)) >= 450) {
      clientAlerts.push({ client, label: "sRPE alto en la última sesión", tone: "carga" });
    }
    if (client.injuries && !client.injuries.toLowerCase().includes("sin lesiones")) {
      clientAlerts.push({ client, label: "Revisar molestias / limitaciones", tone: "salud" });
    }
    if (event?.daysUntil !== null && event?.daysUntil !== undefined && event.daysUntil >= 0 && event.daysUntil <= 14) {
      clientAlerts.push({ client, label: "Evento próximo", tone: "evento" });
    }
    if (!latestSession || Math.abs(getDaysUntil(latestSession.date) ?? 999) > 7) {
      clientAlerts.push({ client, label: "Cliente sin sesiones registradas recientemente", tone: "pendiente" });
    }

    return clientAlerts;
  }).slice(0, 6);
  const upcomingEvents = clients
    .map((client) => ({ client, event: getClientEvent(client) }))
    .filter((item): item is { client: CoachClientForViews; event: NonNullable<ReturnType<typeof getClientEvent>> } => Boolean(item.event))
    .sort((a, b) => (a.event.daysUntil ?? 9999) - (b.event.daysUntil ?? 9999))
    .slice(0, 5);

  return (
    <div className="mt-6 grid gap-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TodaySummaryCard label="Clientes activos" value={`${clients.length}`} />
        <TodaySummaryCard label="Sesiones planificadas esta semana" value={`${weeklySessions.length}`} />
        <TodaySummaryCard label="Sesiones pendientes de revisar" value={`${pendingReviews.length}`} />
        <TodaySummaryCard label="Alertas rápidas" value={`${alerts.length}`} />
      </section>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Sesiones de hoy</h2>

        {todaySessions.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todaySessions.map(({ client, session, sessionIndex }, index) => (
              <div className="rounded-md border border-line bg-panel/35 p-3" key={`${client.id}-${session.date}-${index}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{client.name}</p>
                  <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-moss">
                    {getWeeklySessionStatus(session)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink/70">{session.type}</p>
                <p className="mt-1 text-sm text-ink/55">{session.summary}</p>
                <button
                  className="mt-3 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                  onClick={() =>
                    onOpenTrainingSession(client.id, {
                      clientId: client.id,
                      sessionDate: session.date,
                      sessionIndex
                    })
                  }
                  type="button"
                >
                  Ver sesión
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-sm font-semibold text-ink/55">
            No hay sesiones con fecha real para hoy.
          </div>
        )}
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Pendientes de revisar</h2>

        {pendingReviews.length > 0 ? (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {pendingReviews.map(({ client, session, sessionIndex }, index) => {
              const srpe = calculateSessionLoad(Number(session.rpe), Number(session.duration));

              return (
                <div className="rounded-md border border-line bg-panel/35 p-3" key={`${client.id}-${session.date}-${index}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{client.name}</p>
                      <p className="mt-1 text-sm font-semibold text-ink/70">{session.type}</p>
                      <p className="mt-1 text-sm text-ink/60">{session.summary}</p>
                      <p className="mt-1 text-xs font-semibold uppercase text-ink/45">{formatDateShort(session.date)}</p>
                    </div>
                    <button
                      className="w-fit rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
                      onClick={() =>
                        onOpenTrainingSession(client.id, {
                          clientId: client.id,
                          sessionDate: session.date,
                          sessionIndex
                        })
                      }
                      type="button"
                    >
                      Revisar
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <ClientInfoCard label="RPE" value={`${session.rpe}/10`} />
                    <ClientInfoCard label="Duración" value={`${session.duration} min`} />
                    <ClientInfoCard label="sRPE" value={`${srpe} UA`} />
                  </div>
                  <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-ink/60">
                    {session.notes || "Sin notas registradas"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-sm font-semibold text-ink/55">
            No hay sesiones pendientes de revisar.
          </div>
        )}
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Alertas rápidas</h2>

        {alerts.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((alert, index) => (
              <button
                className="rounded-md border border-line bg-panel/35 p-3 text-left transition hover:border-moss"
                key={`${alert.client.id}-${alert.label}-${index}`}
                onClick={() => onOpenTrainingSession(alert.client.id)}
                type="button"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{alert.client.name}</p>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">{alert.tone}</span>
                </div>
                <p className="mt-2 text-sm text-ink/60">{alert.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-sm font-semibold text-ink/55">
            No hay alertas rápidas ahora.
          </div>
        )}
      </article>

      <article className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Próximos eventos</h2>

        {upcomingEvents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcomingEvents.map(({ client, event }) => (
              <div className="rounded-md border border-line bg-panel/35 p-3" key={`${client.id}-${event.name}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{client.name}</p>
                    <p className="mt-1 text-sm text-ink/60">{event.name}</p>
                  </div>
                  <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-moss">
                    {event.daysUntil === null ? "Sin fecha" : event.daysUntil >= 0 ? `${event.daysUntil} días` : "Fecha pasada"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase text-ink/45">{formatDateShort(event.date)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-line bg-panel/35 p-6 text-sm font-semibold text-ink/55">
            No hay eventos próximos registrados.
          </div>
        )}
      </article>
    </div>
  );
}
