export type AssessmentCatalogCategoryId =
  | "strength"
  | "power"
  | "endurance"
  | "functionality"
  | "anthropometry"
  | "psychosocial";

export type AssessmentCatalogTest = {
  id: string;
  label: string;
  metrics?: AssessmentMetricDefinition[];
  mode: "manual" | "structured" | "load_velocity" | "ankle" | "knee";
  summary?: {
    metricIds: string[];
    mode: "bilateral";
  };
};

export type LoadVelocityRepetition = {
  excluded: boolean;
  id: string;
  mpv: string;
};

export type LoadVelocityPoint = {
  id: string;
  loadKg: string;
  repetitions: LoadVelocityRepetition[];
};

export type LoadVelocityProfile = {
  exercise: string;
  loads: LoadVelocityPoint[];
};

export type AssessmentMetricDefinition = {
  id: string;
  label: string;
  normalization?: {
    factor: number;
    unit: string;
  };
  primary?: boolean;
  required: boolean;
  unit: string;
};

export type AssessmentMetricValue = {
  id: string;
  label: string;
  unit: string;
  value: string;
};

export type AssessmentMetricNormalizedValue = {
  unit: string;
  value: number;
};

export type BilateralAssessmentResult = {
  asymmetryPercent: number;
  lowerSide: string;
};

export function getNormalizedAssessmentMetric(
  definition: AssessmentMetricDefinition,
  value: string
): AssessmentMetricNormalizedValue | null {
  if (!definition.normalization) return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return null;
  return {
    unit: definition.normalization.unit,
    value: Number((numericValue * definition.normalization.factor).toFixed(2))
  };
}

export function getBilateralAssessmentResult(
  definitions: AssessmentMetricDefinition[],
  values: AssessmentMetricValue[],
  metricIds: string[]
): BilateralAssessmentResult | null {
  const bilateralValues = metricIds.map((metricId) => {
    const definition = definitions.find((metric) => metric.id === metricId);
    const metric = values.find((value) => value.id === metricId);
    const numericValue = Number(metric?.value);
    if (!definition || !metric || !Number.isFinite(numericValue) || numericValue < 0) return null;
    return { label: definition.label, value: numericValue };
  });
  if (bilateralValues.some((value) => value === null)) return null;
  const [first, second] = bilateralValues as Array<{ label: string; value: number }>;
  if (first.value === second.value) return { asymmetryPercent: 0, lowerSide: "Sin diferencia" };
  const higherValue = Math.max(first.value, second.value);
  const lowerValue = Math.min(first.value, second.value);
  return {
    asymmetryPercent: Number((((higherValue - lowerValue) / higherValue) * 100).toFixed(1)),
    lowerSide: first.value <= second.value ? first.label : second.label
  };
}

export type AssessmentCatalogSubcategory = {
  id: string;
  label: string;
  tests: AssessmentCatalogTest[];
};

export type AssessmentCatalogCategory = {
  id: AssessmentCatalogCategoryId;
  label: string;
  subcategories: AssessmentCatalogSubcategory[];
};

export const assessmentCatalog: AssessmentCatalogCategory[] = [
  {
    id: "strength",
    label: "Fuerza",
    subcategories: [
      {
        id: "isometric",
        label: "Isométrica",
        tests: [
          {
            id: "handgrip",
            label: "Handgrip",
            mode: "structured",
            metrics: [
              {
                id: "peak_force_right",
                label: "Derecha",
                unit: "kgf",
                required: true,
                normalization: { factor: 9.80665, unit: "N" }
              },
              {
                id: "peak_force_left",
                label: "Izquierda",
                unit: "kgf",
                required: true,
                normalization: { factor: 9.80665, unit: "N" }
              }
            ],
            summary: {
              mode: "bilateral",
              metricIds: ["peak_force_right", "peak_force_left"]
            }
          },
          {
            id: "imtp",
            label: "IMTP",
            mode: "structured",
            metrics: [
              { id: "peak_force", label: "Fuerza pico", unit: "N", required: true, primary: true },
              { id: "force_100ms", label: "Fuerza a 100 ms", unit: "N", required: false },
              { id: "force_200ms", label: "Fuerza a 200 ms", unit: "N", required: false }
            ]
          },
          {
            id: "belt_squat_isometric",
            label: "Belt Squat isométrico",
            mode: "structured",
            metrics: [
              { id: "peak_force", label: "Fuerza pico", unit: "N", required: true, primary: true },
              { id: "force_100ms", label: "Fuerza a 100 ms", unit: "N", required: false },
              { id: "force_200ms", label: "Fuerza a 200 ms", unit: "N", required: false }
            ]
          }
        ]
      },
      {
        id: "dynamic",
        label: "Dinámica",
        tests: ["1RM estimado", "3RM", "5RM", "Repeticiones máximas", "Carga para X reps"].map((label) => ({
          id: label.toLowerCase().replace(/\s+/g, "-"),
          label,
          mode: "manual" as const
        }))
      },
      { id: "eccentric", label: "Excéntrica", tests: [] },
      {
        id: "load-velocity",
        label: "VBT / Carga-velocidad",
        tests: [{ id: "load_velocity_profile", label: "Perfil carga–velocidad", mode: "load_velocity" }]
      }
    ]
  },
  {
    id: "power",
    label: "Potencia",
    subcategories: [
      {
        id: "jumps",
        label: "Saltos",
        tests: [
          {
            id: "cmj",
            label: "CMJ",
            mode: "structured",
            metrics: [
              { id: "jump_height", label: "Altura de salto", unit: "cm", required: true, primary: true },
              { id: "takeoff_velocity", label: "Velocidad de despegue", unit: "m/s", required: false },
              { id: "time_to_takeoff", label: "Tiempo hasta el despegue", unit: "s", required: false },
              { id: "peak_force", label: "Fuerza pico", unit: "N", required: false }
            ]
          },
          ...["SJ", "Drop jump", "Salto horizontal"].map((label) => ({
            id: label.toLowerCase().replace(/\s+/g, "-"),
            label,
            mode: "manual" as const
          }))
        ]
      },
      { id: "loaded-power", label: "Potencia con carga", tests: [] }
    ]
  },
  {
    id: "endurance",
    label: "Resistencia",
    subcategories: [
      {
        id: "aerobic",
        label: "Capacidad aeróbica",
        tests: ["Test 6 min", "Cooper 12 min", "1000 m", "3000 m", "5 km", "VAM", "FTP", "CSS"].map((label) => ({
          id: label.toLowerCase().replace(/\s+/g, "-"),
          label,
          mode: "manual" as const
        }))
      },
      { id: "anaerobic", label: "Capacidad anaeróbica", tests: [] }
    ]
  },
  {
    id: "functionality",
    label: "Funcionalidad",
    subcategories: [
      {
        id: "regional",
        label: "Valoraciones regionales",
        tests: [
          { id: "ankle", label: "Tobillo", mode: "ankle" },
          { id: "knee", label: "Rodilla", mode: "knee" }
        ]
      },
      { id: "general-functional-capacity", label: "Capacidad funcional general", tests: [] }
    ]
  },
  {
    id: "anthropometry",
    label: "Antropometría",
    subcategories: [
      { id: "skinfolds", label: "Pliegues", tests: [{ id: "skinfolds", label: "Pliegues", mode: "manual" }] },
      {
        id: "circumferences",
        label: "Circunferencias / perímetros",
        tests: ["Perímetro cintura", "Perímetro cadera"].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "-"), label, mode: "manual" as const }))
      },
      { id: "diameters", label: "Diámetros", tests: [] },
      {
        id: "basic",
        label: "Datos básicos",
        tests: ["Peso corporal", "Porcentaje graso", "Masa muscular"].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "-"), label, mode: "manual" as const }))
      }
    ]
  },
  {
    id: "psychosocial",
    label: "Psicosocial / Calidad de vida",
    subcategories: [
      { id: "quality-of-life", label: "Calidad de vida y función percibida", tests: [] },
      { id: "confidence", label: "Confianza y autoeficacia", tests: [] }
    ]
  }
];

export const assessmentAnalysisRequirements = [
  { id: "rsi-mod", label: "RSI-mod", requirement: "Requiere altura de salto y tiempo hasta el despegue." },
  { id: "dsi", label: "DSI", requirement: "Requiere fuerza pico balística e isométrica comparables." },
  { id: "force-velocity", label: "Perfil fuerza-velocidad", requirement: "Requiere un protocolo definido con varias cargas compatibles." },
  { id: "load-velocity", label: "Perfil carga-velocidad", requirement: "Requiere varias parejas válidas de carga y velocidad." },
  { id: "force-time", label: "Curva fuerza-tiempo", requirement: "Requiere datos reales de serie temporal." }
];

export function getAssessmentCatalogCategory(id: AssessmentCatalogCategoryId | null) {
  return assessmentCatalog.find((category) => category.id === id) ?? null;
}

export function getAssessmentCatalogTest(protocolId?: string | null) {
  if (!protocolId) return null;
  return assessmentCatalog
    .flatMap((category) => category.subcategories.flatMap((subcategory) => subcategory.tests))
    .find((test) => test.id === protocolId) ?? null;
}
