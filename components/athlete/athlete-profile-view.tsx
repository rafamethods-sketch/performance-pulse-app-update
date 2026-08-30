"use client";

import { useState } from "react";
import { AthleteIntakeQuestionnaire } from "@/components/athlete/athlete-intake-questionnaire";
import {
  getIntakeStatusLabel,
  type IntakeQuestionnaire
} from "@/lib/intake-questionnaire";
import {
  estimateMenstrualPhase,
  getLatestMenstrualEntry,
  getMenstrualSymptomSummary,
  menstrualBleedingLabels,
  type ClientSex,
  type MenstrualTracking
} from "@/lib/menstrual-cycle";

type AthleteProfileClient = {
  accessEndDate?: string;
  goalType?: string;
  id: string;
  intakeQuestionnaire?: IntakeQuestionnaire;
  menstrualTracking?: MenstrualTracking;
  modality?: string;
  name: string;
  onboarding?: {
    goals?: {
      mainGoal?: string;
    };
    sportProfile?: {
      primarySport?: string;
    };
  };
  planning?: {
    primaryGoal?: string;
  };
  sex?: ClientSex;
  sport?: string;
};

type AthleteProfileViewProps<TClient extends AthleteProfileClient> = {
  client: TClient | null;
  onUpdateClient: (updatedClient: TClient) => void;
};

function displayValue(value?: string | null, fallback = "Sin especificar") {
  return value && value.trim() ? value : fallback;
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function ProfileInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel/35 p-3">
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function AthleteProfileView<TClient extends AthleteProfileClient>({
  client,
  onUpdateClient
}: AthleteProfileViewProps<TClient>) {
  const [showIntakeEditor, setShowIntakeEditor] = useState(false);

  if (!client) {
    return (
      <div className="mx-auto mt-5 w-full max-w-5xl rounded-md border border-line bg-white p-5 text-sm text-ink/60 shadow-soft">
        No hay deportista seleccionado.
      </div>
    );
  }

  const sport = client.onboarding?.sportProfile?.primarySport || client.modality || client.sport;
  const mainGoal = client.onboarding?.goals?.mainGoal || client.planning?.primaryGoal || client.goalType;
  const intakeStatus = getIntakeStatusLabel(client.intakeQuestionnaire);
  const menstrualTracking = client.sex === "female" ? client.menstrualTracking : undefined;
  const latestMenstrualEntry = getLatestMenstrualEntry(menstrualTracking?.entries);
  const menstrualPhase = menstrualTracking?.enabled
    ? estimateMenstrualPhase({
      averageBleedingDays: menstrualTracking.averageBleedingDays,
      averageCycleLength: menstrualTracking.averageCycleLength,
      lastPeriodStartDate: menstrualTracking.lastPeriodStartDate
    })
    : null;
  const menstrualSymptoms = getMenstrualSymptomSummary(latestMenstrualEntry);

  return (
    <div className="mx-auto mt-5 w-full max-w-5xl space-y-5">
      <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-moss">Cuenta deportista</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Perfil</h2>
            <p className="mt-1 text-sm text-ink/55">Información básica y datos personales de entrenamiento.</p>
          </div>
          <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/70">
            {client.name}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ProfileInfoCard label="Nombre" value={client.name} />
          <ProfileInfoCard label="Deporte / modalidad" value={displayValue(sport)} />
          <ProfileInfoCard label="Objetivo principal" value={displayValue(mainGoal)} />
          <ProfileInfoCard label="Acceso activo hasta" value={formatDisplayDate(client.accessEndDate)} />
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink">Cuestionario de ingreso</h3>
            <p className="mt-1 text-sm text-ink/55">
              Mantén actualizado tu contexto para que el entrenamiento se adapte mejor a tu situación.
            </p>
          </div>
          <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/70">
            {intakeStatus}
          </span>
        </div>

        <div className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/65">
          Tu entrenador puede revisar tus respuestas para adaptar el entrenamiento.
        </div>

        <button
          className="mt-4 min-h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90"
          onClick={() => setShowIntakeEditor((current) => !current)}
          type="button"
        >
          {showIntakeEditor ? "Cerrar cuestionario" : "Editar cuestionario"}
        </button>

        {showIntakeEditor ? (
          <div className="mt-4">
            <AthleteIntakeQuestionnaire
              client={client}
              mode="edit"
              onCancel={() => setShowIntakeEditor(false)}
              onUpdateClient={(updatedClient) => {
                onUpdateClient(updatedClient);
                setShowIntakeEditor(false);
              }}
            />
          </div>
        ) : null}
      </section>

      {client.sex === "female" ? (
        <section className="rounded-md border border-line bg-white p-4 shadow-soft sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-ink">Wellness y ciclo menstrual</h3>
              <p className="mt-1 text-sm text-ink/55">Seguimiento opcional y orientativo dentro de la cuenta deportista.</p>
            </div>
            <span className="w-fit rounded-md border border-line bg-panel/60 px-3 py-1 text-xs font-semibold text-ink/70">
              {menstrualTracking?.enabled ? "Seguimiento activo" : "No activado"}
            </span>
          </div>

          {menstrualTracking?.enabled ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ProfileInfoCard
                label="Fase estimada"
                value={`${menstrualPhase?.label ?? "Sin estimación"}${menstrualPhase?.cycleDay ? ` · día ${menstrualPhase.cycleDay}` : ""}`}
              />
              <ProfileInfoCard
                label="Último registro"
                value={latestMenstrualEntry?.date ? formatDisplayDate(latestMenstrualEntry.date) : "Sin registro"}
              />
              <ProfileInfoCard
                label="Sangrado"
                value={latestMenstrualEntry?.bleeding ? menstrualBleedingLabels[latestMenstrualEntry.bleeding] : "Sin registrar"}
              />
              <div className="rounded-md border border-line bg-panel/35 p-3 sm:col-span-3">
                <p className="text-xs font-semibold uppercase text-ink/45">Síntomas recientes</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {menstrualSymptoms.length > 0
                    ? menstrualSymptoms.map((symptom) => `${symptom.label} ${symptom.level}/3`).join(" · ")
                    : "Sin síntomas registrados"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-line bg-panel/35 p-3 text-sm text-ink/60">
              Puedes activar el seguimiento opcional desde Hoy cuando lo necesites.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
