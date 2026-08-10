"use client";

import { useState } from "react";
import {
  exerciseSymptomOptions,
  intakeGenderLabels,
  intakeRestrictionLabels,
  intakeSessionDurationLabels,
  intakeSleepLabels,
  intakeStrengthExperienceLabels,
  intakeStressLabels,
  intakeTrainingLocationLabels,
  intakeYesNoLabels,
  mergeIntakeAnswers,
  professionalSupportOptions,
  recoveryHabitOptions,
  secondaryGoalOptions,
  validateIntakeAnswers,
  type IntakeGender,
  type IntakeMedicalRestriction,
  type IntakeQuestionnaire,
  type IntakeQuestionnaireAnswers,
  type IntakeSessionDuration,
  type IntakeSleepHours,
  type IntakeStrengthExperience,
  type IntakeStressLevel,
  type IntakeTrainingLocation,
  type IntakeYesNo
} from "@/lib/intake-questionnaire";

type AthleteIntakeClient = {
  id: string;
  intakeQuestionnaire?: IntakeQuestionnaire;
  name: string;
};

type AthleteIntakeQuestionnaireProps<TClient extends AthleteIntakeClient> = {
  client: TClient;
  mode?: "required" | "edit";
  onCancel?: () => void;
  onUpdateClient: (updatedClient: TClient) => void;
};

function toggleListValue(list: string[] | undefined, value: string) {
  const current = list ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function TextInput({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
}) {
  return (
    <label className="text-sm font-semibold text-ink/70">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ""}
      />
    </label>
  );
}

function TextAreaInput({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
}) {
  return (
    <label className="text-sm font-semibold text-ink/70">
      {label}
      <textarea
        className="mt-1 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ""}
      />
    </label>
  );
}

function SelectInput<TValue extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
  value?: TValue;
}) {
  return (
    <label className="text-sm font-semibold text-ink/70">
      {label}
      <select
        className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        onChange={(event) => onChange(event.target.value as TValue)}
        value={value ?? ("" as TValue)}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string[]) => void;
  options: string[];
  value?: string[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/65" key={option}>
            <input
              checked={(value ?? []).includes(option)}
              onChange={() => onChange(toggleListValue(value, option))}
              type="checkbox"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export function AthleteIntakeQuestionnaire<TClient extends AthleteIntakeClient>({
  client,
  mode = "required",
  onCancel,
  onUpdateClient
}: AthleteIntakeQuestionnaireProps<TClient>) {
  const [answers, setAnswers] = useState<IntakeQuestionnaireAnswers>(() => mergeIntakeAnswers(client.intakeQuestionnaire?.answers));
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const isEditMode = mode === "edit";

  const updateAnswer = <TKey extends keyof IntakeQuestionnaireAnswers>(key: TKey, value: IntakeQuestionnaireAnswers[TKey]) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }));
    setMissingFields([]);
    setSavedMessage("");
  };

  const handleSubmit = () => {
    const missing = validateIntakeAnswers(answers);
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }

    const now = new Date().toISOString();
    const currentIntake = client.intakeQuestionnaire ?? { required: true };
    const wasCompleted = currentIntake.completed === true;

    onUpdateClient({
      ...client,
      intakeQuestionnaire: {
        ...currentIntake,
        answers,
        completed: true,
        completedAt: currentIntake.completedAt ?? now,
        needsCoachReview: true,
        required: true,
        updatedAt: now
      }
    });

    if (wasCompleted) {
      setSavedMessage("Tus cambios se han guardado. El entrenador recibirá una alerta para revisar la actualización.");
    }

  };

  return (
    <section className="mx-auto mt-6 max-w-5xl rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="rounded-md border border-line bg-panel/35 p-4">
        <p className="text-xs font-semibold uppercase text-moss">{client.name}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Cuestionario de ingreso</h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Antes de empezar a entrenar necesito que completes este cuestionario inicial. Me ayudará a conocer tu contexto, objetivos,
          historial de entrenamiento, disponibilidad y posibles limitaciones.
        </p>
        <p className="mt-3 rounded-md border border-line bg-white p-3 text-sm leading-6 text-ink/65">
          Esta información será visible para tu entrenador y se usará únicamente para adaptar el entrenamiento. Si tienes una condición
          médica, lesión importante o síntomas durante el ejercicio, consulta con un profesional sanitario.
        </p>
      </div>

      {missingFields.length > 0 ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Completa los campos obligatorios antes de enviar: {missingFields.join(", ")}.
        </div>
      ) : null}

      {savedMessage ? (
        <div className="mt-4 rounded-md border border-moss/30 bg-mint p-4 text-sm font-semibold text-moss">{savedMessage}</div>
      ) : null}

      <div className="mt-5 grid gap-5">
        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">1. Datos básicos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TextInput label="Nombre completo" onChange={(value) => updateAnswer("fullName", value)} value={answers.fullName} />
            <TextInput label="Edad" onChange={(value) => updateAnswer("age", value)} value={answers.age} />
            <SelectInput<IntakeGender>
              label="Género"
              onChange={(value) => updateAnswer("gender", value)}
              options={Object.entries(intakeGenderLabels).map(([value, label]) => ({ label, value: value as IntakeGender }))}
              value={answers.gender}
            />
            <TextInput label="Número de teléfono" onChange={(value) => updateAnswer("phone", value)} value={answers.phone} />
            <TextInput label="Contacto de emergencia" onChange={(value) => updateAnswer("emergencyContact", value)} value={answers.emergencyContact} />
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">2. Contexto y hábitos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TextInput label="Profesión actual" onChange={(value) => updateAnswer("occupation", value)} value={answers.occupation} />
            <SelectInput<IntakeSleepHours>
              label="¿Cuántas horas sueles dormir?"
              onChange={(value) => updateAnswer("sleepHours", value)}
              options={Object.entries(intakeSleepLabels).map(([value, label]) => ({ label, value: value as IntakeSleepHours }))}
              value={answers.sleepHours}
            />
            <SelectInput<IntakeStressLevel>
              label="Nivel de estrés percibido"
              onChange={(value) => updateAnswer("stressLevel", value)}
              options={Object.entries(intakeStressLabels).map(([value, label]) => ({ label, value: value as IntakeStressLevel }))}
              value={answers.stressLevel}
            />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CheckboxGroup label="Hábitos de salud o recuperación a tener en cuenta" onChange={(value) => updateAnswer("recoveryHabits", value)} options={recoveryHabitOptions} value={answers.recoveryHabits} />
            <CheckboxGroup label="¿Estás siendo controlado por algún profesional?" onChange={(value) => updateAnswer("currentProfessionalSupport", value)} options={professionalSupportOptions} value={answers.currentProfessionalSupport} />
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">3. Actividad actual y objetivos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectInput<IntakeYesNo>
              label="¿Practicas algún deporte o actividad física regularmente?"
              onChange={(value) => updateAnswer("currentSportPractice", value)}
              options={Object.entries(intakeYesNoLabels).map(([value, label]) => ({ label, value: value as IntakeYesNo }))}
              value={answers.currentSportPractice}
            />
            <TextInput label="Actividad actual" onChange={(value) => updateAnswer("currentSportDetails", value)} value={answers.currentSportDetails} />
            <TextAreaInput label="¿Cuál es tu objetivo principal ahora mismo?" onChange={(value) => updateAnswer("mainGoal", value)} value={answers.mainGoal} />
            <TextAreaInput label="¿Qué te gustaría conseguir en los próximos 3 meses?" onChange={(value) => updateAnswer("threeMonthGoal", value)} value={answers.threeMonthGoal} />
            <TextAreaInput label="¿Tienes alguna fecha importante o plazo?" onChange={(value) => updateAnswer("targetDateOrEvent", value)} value={answers.targetDateOrEvent} />
          </div>
          <div className="mt-4">
            <CheckboxGroup label="Objetivos secundarios" onChange={(value) => updateAnswer("secondaryGoals", value)} options={secondaryGoalOptions} value={answers.secondaryGoals} />
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">4. Disponibilidad y experiencia entrenando</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectInput<string>
              label="¿Cuántos días por semana puedes entrenar de forma realista?"
              onChange={(value) => updateAnswer("availableDaysPerWeek", value)}
              options={["1", "2", "3", "4", "5 o más"].map((value) => ({ label: value, value }))}
              value={answers.availableDaysPerWeek}
            />
            <SelectInput<IntakeSessionDuration>
              label="¿Cuánto tiempo tienes por sesión?"
              onChange={(value) => updateAnswer("sessionDuration", value)}
              options={Object.entries(intakeSessionDurationLabels).map(([value, label]) => ({ label, value: value as IntakeSessionDuration }))}
              value={answers.sessionDuration}
            />
            <SelectInput<IntakeTrainingLocation>
              label="¿Dónde vas a entrenar normalmente?"
              onChange={(value) => updateAnswer("trainingLocation", value)}
              options={Object.entries(intakeTrainingLocationLabels).map(([value, label]) => ({ label, value: value as IntakeTrainingLocation }))}
              value={answers.trainingLocation}
            />
            <SelectInput<IntakeStrengthExperience>
              label="¿Cuál es tu experiencia con el entrenamiento de fuerza?"
              onChange={(value) => updateAnswer("strengthTrainingExperience", value)}
              options={Object.entries(intakeStrengthExperienceLabels).map(([value, label]) => ({ label, value: value as IntakeStrengthExperience }))}
              value={answers.strengthTrainingExperience}
            />
            <TextAreaInput label="¿Qué material tienes disponible?" onChange={(value) => updateAnswer("availableEquipment", value)} value={answers.availableEquipment} />
            <TextAreaInput label="¿Qué ejercicios o tipos de entrenamiento has hecho anteriormente?" onChange={(value) => updateAnswer("previousTraining", value)} value={answers.previousTraining} />
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">5. Información clínica y seguridad</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectInput<IntakeYesNo> label="¿Tienes alguna condición médica diagnosticada?" onChange={(value) => updateAnswer("diagnosedCondition", value)} options={Object.entries(intakeYesNoLabels).map(([value, label]) => ({ label, value: value as IntakeYesNo }))} value={answers.diagnosedCondition} />
            <TextAreaInput label="En caso afirmativo, ¿de qué condición se trata?" onChange={(value) => updateAnswer("diagnosedConditionDetails", value)} value={answers.diagnosedConditionDetails} />
            <SelectInput<IntakeYesNo> label="¿Estás tomando actualmente algún medicamento?" onChange={(value) => updateAnswer("currentMedication", value)} options={Object.entries(intakeYesNoLabels).map(([value, label]) => ({ label, value: value as IntakeYesNo }))} value={answers.currentMedication} />
            <TextAreaInput label="En caso afirmativo, ¿de qué medicamento se trata?" onChange={(value) => updateAnswer("currentMedicationDetails", value)} value={answers.currentMedicationDetails} />
            <SelectInput<IntakeYesNo> label="¿Has tenido alguna lesión u operación reciente?" onChange={(value) => updateAnswer("recentInjuryOrSurgery", value)} options={Object.entries(intakeYesNoLabels).map(([value, label]) => ({ label, value: value as IntakeYesNo }))} value={answers.recentInjuryOrSurgery} />
            <TextAreaInput label="En caso afirmativo, ¿de qué lesión u operación se trata?" onChange={(value) => updateAnswer("recentInjuryOrSurgeryDetails", value)} value={answers.recentInjuryOrSurgeryDetails} />
            <SelectInput<IntakeYesNo> label="¿Tienes algún dolor o molestia física que pueda condicionar el movimiento?" onChange={(value) => updateAnswer("currentPain", value)} options={Object.entries(intakeYesNoLabels).map(([value, label]) => ({ label, value: value as IntakeYesNo }))} value={answers.currentPain} />
            <TextAreaInput label="En caso afirmativo, ¿de qué dolor o molestia se trata?" onChange={(value) => updateAnswer("currentPainDetails", value)} value={answers.currentPainDetails} />
          </div>
          <div className="mt-4">
            <CheckboxGroup label="¿Alguna vez has experimentado alguno de estos síntomas durante el ejercicio?" onChange={(value) => updateAnswer("exerciseSymptoms", value)} options={exerciseSymptomOptions} value={answers.exerciseSymptoms} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectInput<IntakeMedicalRestriction>
              label="¿Algún profesional sanitario te ha indicado limitar o evitar algún tipo de ejercicio?"
              onChange={(value) => updateAnswer("medicalExerciseRestriction", value)}
              options={Object.entries(intakeRestrictionLabels).map(([value, label]) => ({ label, value: value as IntakeMedicalRestriction }))}
              value={answers.medicalExerciseRestriction}
            />
            <TextAreaInput label="En caso afirmativo, explícalo brevemente" onChange={(value) => updateAnswer("medicalExerciseRestrictionDetails", value)} value={answers.medicalExerciseRestrictionDetails} />
            <TextAreaInput label="¿Existe alguna otra indicación a tener en cuenta?" onChange={(value) => updateAnswer("otherRelevantInfo", value)} value={answers.otherRelevantInfo} />
          </div>
        </section>

        <section className="rounded-md border border-line bg-panel/35 p-4">
          <h3 className="font-semibold text-ink">6. Confirmación</h3>
          <div className="mt-4 grid gap-3">
            <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 text-sm font-semibold text-ink/70">
              <input checked={Boolean(answers.informationAccuracyAccepted)} onChange={(event) => updateAnswer("informationAccuracyAccepted", event.target.checked)} type="checkbox" />
              Confirmo que la información proporcionada es correcta.
            </label>
            <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 text-sm font-semibold text-ink/70">
              <input checked={Boolean(answers.medicalDisclaimerAccepted)} onChange={(event) => updateAnswer("medicalDisclaimerAccepted", event.target.checked)} type="checkbox" />
              Entiendo que este cuestionario no sustituye una valoración médica y que, si tengo una condición médica, lesión importante
              o síntomas durante el ejercicio, puede ser recomendable consultar con un profesional sanitario antes de iniciar o modificar
              el entrenamiento.
            </label>
          </div>
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {isEditMode && onCancel ? (
          <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink/70" onClick={onCancel} type="button">
            Cancelar
          </button>
        ) : null}
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={handleSubmit} type="button">
          {isEditMode ? "Guardar cambios" : "Enviar cuestionario"}
        </button>
      </div>
    </section>
  );
}
