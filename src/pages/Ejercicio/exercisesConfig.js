// exercisesConfig.js
// Configuración de ejercicios (tipo, descripción, etc.)

export const EXERCISE_TYPES = {
  BODYWEIGHT: "bodyweight",
  WEIGHTED: "weighted",
};

const RAW_EXERCISES = [
  // =========================
  // EMPUJE TREN SUPERIOR
  // =========================
  {
    id: "flexiones",
    label: "Flexiones",
    emoji: "🤸",
    videoTitle: "Push-up (Perfect push up, short)",
    videoUrl: "https://www.youtube.com/shorts/ba8tr1NzwXU",
    color: "#2563eb",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio de empuje para tren superior. Trabaja principalmente pecho, tríceps y hombros.",
  },
  {
    id: "flexiones_inclinadas",
    label: "Flexiones en banco inclinado",
    emoji: "📐",
    videoTitle: "Incline push-up (short)",
    videoUrl: "https://www.youtube.com/shorts/Mc-Kdwnx_M8",
    color: "#38bdf8",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Variante de flexión con manos apoyadas en banco o superficie elevada. Menor carga para trabajar técnica o rehabilitación.",
  },
  {
    id: "flexiones_declive",
    label: "Flexiones en declive",
    emoji: "🧗",
    videoTitle: "Decline push-up (short)",
    videoUrl: "https://www.youtube.com/shorts/7a0sQBLvPT0",
    color: "#0ea5e9",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Flexiones con pies elevados para aumentar la carga sobre el tren superior, enfatizando hombro y porción clavicular del pectoral.",
  },
  {
    id: "fondos",
    label: "Fondos en paralelas",
    emoji: "📥",
    videoTitle: "Dips en paralelas (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/cvyZAIa7heU",
    color: "#f97316",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio de empuje vertical. Muy útil para desarrollar tríceps, pectoral inferior y hombros.",
  },
  {
    id: "fondos_banco",
    label: "Fondos en banco",
    emoji: "🪑",
    videoTitle: "Bench dip (tutorial)",
    videoUrl: "https://www.youtube.com/watch?v=c3ZGl4pAwZ4",
    color: "#fb923c",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Variante de fondos con manos en banco y pies en el suelo o elevado. Menor intensidad, útil para triceps y fases de readaptación.",
  },
  {
    id: "press_banca",
    label: "Press banca con barra",
    emoji: "🏋️",
    videoTitle: "Bench press (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/0cXAp6WhSj4",
    color: "#a855f7",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio básico de fuerza para pecho, hombros y tríceps. Permite trabajar con cargas elevadas en plano horizontal.",
  },
  {
    id: "press_banca_mancuernas",
    label: "Press banca con mancuernas",
    emoji: "🏋️",
    videoTitle: "Dumbbell Bench Press (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/6xZ0JjzQ0Y8",
    color: "#c4b5fd",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Similar al press banca con barra, pero con mancuernas. Mayor libertad de movimiento y demanda de estabilidad.",
  },
  {
    id: "press_inclinado_mancuernas",
    label: "Press inclinado con mancuernas",
    emoji: "📈",
    videoTitle: "Incline Dumbbell Press (short)",
    videoUrl: "https://www.youtube.com/shorts/LfyQBUKR8SE",
    color: "#8b5cf6",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Press en banco inclinado para enfatizar la porción clavicular del pectoral y la musculatura del hombro.",
  },
  {
    id: "press_militar_barra",
    label: "Press militar con barra",
    emoji: "🎯",
    videoTitle: "Overhead press con barra (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/4LBVP2Oe7fg",
    color: "#6366f1",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio de empuje vertical de pie o sentado que fortalece hombros y tríceps, con alta demanda de estabilidad del core.",
  },
  {
    id: "press_mancuernas_sentado",
    label: "Press hombro con mancuernas sentado",
    emoji: "💺",
    videoTitle: "Seated Dumbbell Shoulder Press (short)",
    videoUrl: "https://www.youtube.com/shorts/qEwKCR5JCog",
    color: "#4f46e5",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Press de hombro sentado con mancuernas que reduce la exigencia para el core y permite centrarse en deltoides y tríceps.",
  },
  {
    id: "aperturas_mancuernas",
    label: "Aperturas con mancuernas en banco",
    videoTitle: "Aperturas con mancuernas inclinado adelante",
    videoUrl: "https://www.youtube.com/watch?v=FDDv9SpPwlY",
    color: "#f97316",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Aperturas en banco inclinado: técnica para aislar el pectoral superior, abrir el arco de movimiento controlando la escápula y evitando impulso. Mantén ligero arco en codo y realiza el movimiento con control excéntrico.",
  },
  {
    id: "cruces_polea",
    label: "Cruces en polea",
    emoji: "🎛️",
    videoTitle: "Cable crossover / fly (short)",
    videoUrl: "https://www.youtube.com/shorts/Jokaz7dBJNg",
    color: "#fb7185",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio en polea para pectoral que mantiene tensión constante a lo largo del recorrido y permite ajustes finos de carga.",
  },

  // =========================
  // TRACCIÓN TREN SUPERIOR
  // =========================
  {
    id: "dominadas",
    label: "Dominadas",
    videoTitle: "Dominadas - técnica y progresiones",
    videoUrl: "https://www.youtube.com/watch?v=bIFpgQhoRpU",
    color: "#22c55e",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Dominadas: ejercicio de tracción vertical que trabaja dorsal ancho, romboides y bíceps. Ajusta agarre y añade asistencia o lastre según nivel. Controla la fase excéntrica para mejorar fuerza.",
  },
  {
    id: "dominadas_asistidas",
    label: "Dominadas asistidas (banda o máquina)",
    emoji: "🧵",
    videoTitle: "Assisted pull-up machine (short)",
    videoUrl: "https://www.youtube.com/shorts/PtK7x27mLUY",
    color: "#16a34a",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Variante de dominada con banda elástica o máquina asistida para reducir carga y facilitar el aprendizaje o la rehabilitación.",
  },
  {
    id: "jalon_polea_agarre_estrecho",
    label: "Jalón al pecho agarre estrecho",
    emoji: "🎣",
    videoTitle: "Close-grip lat pulldown (short)",
    videoUrl: "https://www.youtube.com/shorts/GSgy468OxAs",
    color: "#22c55e",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio en máquina de polea para trabajar dorsal ancho y músculos de tracción con agarre neutro o estrecho.",
  },
  {
    id: "remo_barra",
    label: "Remo con barra inclinado",
    emoji: "📦",
    videoTitle: "Barbell row (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/Nqh7q3zDCoQ",
    color: "#0f766e",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Remo inclinado con barra para trabajar espalda media, dorsal y bíceps, con alta demanda de estabilidad lumbar.",
  },
  {
    id: "remo_mancuerna",
    label: "Remo a una mano con mancuerna",
    emoji: "📏",
    videoTitle: "One-arm dumbbell row (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/aFtWSOruuhs",
    color: "#14b8a6",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Remo unilateral apoyando una mano en banco para trabajar dorsal, romboides y bíceps, corrigiendo asimetrías.",
  },
  {
    id: "remo_cable_sentado",
    label: "Remo en polea sentado",
    emoji: "🎛️",
    videoTitle: "Seated Cable Row (short)",
    videoUrl: "https://www.youtube.com/shorts/GZbfZ033f74",
    color: "#0ea5e9",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Remo horizontal en máquina de polea que permite un patrón guiado y controlado para espalda y bíceps.",
  },
  {
    id: "face_pull",
    label: "Face pull en polea",
    emoji: "😶‍🌫️",
    videoTitle: "Face Pull (short técnica escapular)",
    videoUrl: "https://www.youtube.com/shorts/rep-qVOkqgk",
    color: "#22c55e",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio clave para la salud de hombro. Trabaja rotadores externos, deltoides posterior y musculatura escapular.",
  },

  // =========================
  // TREN INFERIOR
  // =========================
  {
    id: "sentadilla_barra",
    label: "Sentadilla con barra",
    emoji: "🦵",
    videoTitle: "Squat (short checklist técnica)",
    videoUrl: "https://www.youtube.com/shorts/PPmvh7gBTi0",
    color: "#10b981",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio multiarticular de tren inferior. Ideal para fuerza y volumen en piernas y glúteos.",
  },
  {
    id: "sentadilla_frontal",
    label: "Sentadilla frontal con barra",
    emoji: "🤹",
    videoTitle: "Front squat (short)",
    videoUrl: "https://www.youtube.com/shorts/SJ97z1-YVGs",
    color: "#059669",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Variante de sentadilla con barra en la parte frontal, mayor énfasis en cuádriceps y tronco erguido.",
  },
  {
    id: "sentadilla_goblet",
    label: "Sentadilla goblet con mancuerna o kettlebell",
    emoji: "🥤",
    videoTitle: "Goblet squat (short)",
    videoUrl: "https://www.youtube.com/shorts/lRYBbchqxtI",
    color: "#34d399",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Sentadilla con el peso sostenido delante del pecho. Muy útil para aprender técnica y trabajar fuerza general.",
  },
  {
    id: "zancadas_caminando",
    label: "Zancadas caminando",
    emoji: "🚶",
    videoTitle: "Walking lunge (short)",
    videoUrl: "https://www.youtube.com/shorts/IRq5o3ntLIE",
    color: "#22c55e",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Desplazamiento en zancadas con mancuernas o peso corporal que trabaja fuerza y estabilidad unilateral de piernas y glúteos.",
  },
  {
    id: "split_squat_bulgaro",
    label: "Sentadilla búlgara",
    emoji: "🇧🇬",
    videoTitle: "Bulgarian split squat (short)",
    videoUrl: "https://www.youtube.com/shorts/9p5e2BSvoLs",
    color: "#4ade80",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio unilateral con el pie trasero elevado que enfatiza glúteo y cuádriceps de la pierna adelantada.",
  },
  {
    id: "peso_muerto_rumano",
    label: "Peso muerto rumano",
    emoji: "⚰️",
    videoTitle: "Romanian deadlift (RDL) short",
    videoUrl: "https://www.youtube.com/shorts/5rIqP63yWFg",
    color: "#a3e635",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Movimiento dominante de cadera para isquiosurales y glúteos, con énfasis en fase excéntrica.",
  },
  {
    id: "peso_muerto_convencional",
    label: "Peso muerto convencional",
    emoji: "⚓",
    videoTitle: "Deadlift (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/ZaTM37cfiDs",
    color: "#65a30d",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio global de fuerza que involucra piernas, cadera y tronco, muy útil para desarrollo de fuerza máxima.",
  },
  {
    id: "hip_thrust_barra",
    label: "Hip thrust con barra",
    emoji: "🍑",
    videoTitle: "Barbell hip thrust (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/W86oVlnLqY4",
    color: "#f97316",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio de extensión de cadera apoyando la espalda en banco y la barra sobre la pelvis. Enfocado en glúteos.",
  },
  {
    id: "puente_gluteo",
    label: "Puente de glúteo en suelo",
    emoji: "🛏️",
    videoTitle: "Glute Bridge (short)",
    videoUrl: "https://www.youtube.com/shorts/wPM8icPu6H8",
    color: "#facc15",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Variante sencilla en el suelo, con o sin peso, ideal para rehabilitación de cadera y activación de glúteos.",
  },
  {
    id: "extensiones_cuadriceps_maquina",
    label: "Extensiones de cuádriceps en máquina",
    emoji: "🦿",
    videoTitle: "Leg extension (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/d3d2yz7V26c",
    color: "#f59e0b",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio analítico para cuádriceps, útil para trabajo específico de fuerza y procesos de rehabilitación.",
  },
  {
    id: "curl_femoral_maquina",
    label: "Curl femoral en máquina",
    emoji: "🦵",
    videoTitle: "Lying / Seated Leg Curl (short)",
    videoUrl: "https://www.youtube.com/shorts/1Tq3QdYUuHs",
    color: "#eab308",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Movimiento de flexión de rodilla en máquina para trabajar isquiosurales de forma aislada.",
  },
  {
    id: "gemelos_de_pie",
    label: "Elevaciones de gemelos de pie",
    emoji: "🧍",
    videoTitle: "Standing Calf Raise (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/-M4-G8p8fmc",
    color: "#f97316",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Elevación de talones en bipedestación con peso corporal o añadido. Trabaja tríceps sural.",
  },
  {
    id: "gemelos_sentado",
    label: "Elevaciones de gemelos sentado",
    emoji: "🪑",
    videoTitle: "Seated Calf Raise (short)",
    videoUrl: "https://www.youtube.com/shorts/8AMp0YvUuVo",
    color: "#fb923c",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Variante sentado para enfatizar sóleo, útil para fuerza y prevención de lesiones.",
  },

  // =========================
  // CORE Y ESTABILIDAD
  // =========================
  {
    id: "plancha_frontal",
    label: "Plancha frontal",
    emoji: "📏",
    videoTitle: "Plank (short)",
    videoUrl: "https://www.youtube.com/shorts/hoeNgjheDHk",
    color: "#0ea5e9",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Isométrico de core que trabaja la estabilidad de tronco en posición de apoyo prono.",
  },
  {
    id: "plancha_lateral",
    label: "Plancha lateral",
    emoji: "〰️",
    videoTitle: "Side plank (short)",
    videoUrl: "https://www.youtube.com/shorts/sH5PiIUjDW8",
    color: "#22c55e",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Isométrico en apoyo lateral para trabajar oblicuos y estabilizadores de cadera.",
  },
  {
    id: "dead_bug",
    label: "Dead bug",
    emoji: "🐞",
    videoTitle: "Dead bug (short)",
    videoUrl: "https://www.youtube.com/shorts/Aoipu_fl3HA",
    color: "#38bdf8",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio de control lumbo-pélvico coordinando brazos y piernas en posición supina.",
  },
  {
    id: "pallof_press_banda",
    label: "Pallof press con banda",
    emoji: "🧷",
    videoTitle: "Pallof press band (short)",
    videoUrl: "https://www.youtube.com/shorts/dHxa57kBAmc",
    color: "#6366f1",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio anti-rotacional con banda elástica para trabajar la estabilidad del core en el plano transversal.",
  },
  {
    id: "rollout_rueda",
    label: "Roll-out con rueda abdominal",
    emoji: "🎡",
    videoTitle: "Ab wheel rollout (short)",
    videoUrl: "https://www.youtube.com/shorts/C_j2Ux1Se5c",
    color: "#0f766e",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Movimiento de extensión de hombros y cadera con rueda o barra, muy demandante para la musculatura del core.",
  },
  {
    id: "russian_twist",
    label: "Russian twist",
    emoji: "🌀",
    videoTitle: "Russian twist (short)",
    videoUrl: "https://www.youtube.com/shorts/KUsvxlmpPoI",
    color: "#06b6d4",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Rotación de tronco sentado, con o sin carga, para trabajar oblicuos y control rotacional.",
  },
  {
    id: "hollow_hold",
    label: "Hollow hold",
    emoji: "🥚",
    videoTitle: "Hollow hold (short)",
    videoUrl: "https://www.youtube.com/shorts/gT7gnzxhXyE",
    color: "#0891b2",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Isométrico de core en posición de banana, muy utilizado en gimnasia y entrenamiento de rendimiento.",
  },

  // =========================
  // FUNCIONALES / RENDIMIENTO
  // =========================
  {
    id: "kettlebell_swing",
    label: "Kettlebell swing",
    emoji: "🛎️",
    color: "#f97316",
    videoTitle: "Kettlebell Swing (short técnica bisagra)",
    videoUrl: "https://www.youtube.com/shorts/ys5Q1jLZfPE",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Movimiento explosivo de bisagra de cadera para potencia y resistencia del tren posterior.",
  },
  {
    id: "thruster_barra",
    label: "Thruster con barra o mancuernas",
    emoji: "🚀",
    color: "#f97316",
    videoTitle: "Thruster Barbell (short)",
    videoUrl: "https://www.youtube.com/shorts/5mCjC5XqF1Y",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Combinación de sentadilla frontal y press de hombros. Ejercicio global para fuerza y capacidad cardiorrespiratoria.",
  },
  {
    id: "power_clean",
    label: "Power clean (cargada de potencia)",
    videoTitle: "Power Clean - Técnica y ejecución",
    videoUrl: "https://www.youtube.com/watch?v=I31BobyRSWc",
    color: "#ef4444",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Power clean (cargada de potencia): levantamiento olímpico que desarrolla fuerza-explosiva y coordinación entre cadena posterior, core y recepción. Trabaja caderas, trapecio y extensores de rodilla; importante técnica y progresiones antes de trabajar con carga máxima.",
  },
  {
    id: "snatch",
    label: "Snatch (arrancada)",
    videoTitle: "Snatch - Técnica completa",
    videoUrl: "https://www.youtube.com/watch?v=yHZ1eZ8fJjc",
    color: "#ef9a4a",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Snatch (arrancada): levantamiento olímpico para máxima potencia y rango de movimiento. Requiere movilidad y técnica para traer la barra por encima de la cabeza en un solo movimiento. Ideal para potencia, estabilidad de hombro y coordinación.",
  },
  {
    id: "biceps_press_militar",
    label: "Bíceps press militar",
    videoTitle: "Bíceps press militar - variante",
    videoUrl: "https://www.youtube.com/watch?v=IEPKg-mYPtg",
    color: "#60a5fa",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Bíceps press militar: variante compuesta que combina un empuje de hombro con un trabajo de bíceps en la fase de control. Útil como ejercicio accesorio para fuerza del hombro y brazo; controla la técnica y evita impulso del torso.",
  },
  {
    id: "burpee",
    label: "Burpee",
    emoji: "💥",
    color: "#f97316",
    videoTitle: "Burpee (short técnica eficiente)",
    videoUrl: "https://www.youtube.com/shorts/TU8QYVW0gDU",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio pliométrico de cuerpo completo que combina sentadilla, plancha y salto. Muy exigente a nivel metabólico.",
  },
  {
    id: "farmer_walk",
    label: "Farmer walk",
    emoji: "🧺",
    color: "#22c55e",
    videoTitle: "Farmer’s Walk (short)",
    videoUrl: "https://www.youtube.com/shorts/6Z15_WdXmVw",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Caminata cargando peso en las manos. Desarrolla agarre, core y estabilidad general.",
  },
  {
    id: "sled_push",
    label: "Empuje de trineo",
    emoji: "🛷",
    color: "#0ea5e9",
    videoTitle: "Sled Push (short)",
    videoUrl: "https://www.youtube.com/shorts/2lYkF9KJZrY",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Desplazamiento empujando un trineo cargado. Muy útil para fuerza específica y acondicionamiento.",
  },
  {
    id: "saltos_cajon",
    label: "Saltos al cajón",
    emoji: "📦",
    color: "#f97316",
    videoTitle: "Box Jump (short técnica aterrizaje)",
    videoUrl: "https://www.youtube.com/shorts/52rU2jz5F8o",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Pliometría de tren inferior para mejorar potencia y capacidad de absorción de impactos.",
  },

  // =========================
  // REHABILITACIÓN HOMBRO
  // =========================
  {
    id: "rotacion_externa_banda",
    label: "Rotación externa con banda",
    emoji: "🧵",
    color: "#818cf8",
    videoTitle: "External Rotation Band (short)",
    videoUrl: "https://www.youtube.com/shorts/Qk8mGkTtZ5g",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio específico para manguito rotador, clave en rehabilitación y prevención de lesiones de hombro.",
  },
  {
    id: "alzamientos_laterales_mancuernas",
    label: "Elevaciones laterales con mancuernas",
    emoji: "📐",
    color: "#6366f1",
    videoTitle: "Lateral Raise (short técnica)",
    videoUrl: "https://www.youtube.com/shorts/3VcKaXpzqRo",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Trabajo para deltoides medio, útil en fases controladas de rehabilitación y en programas de fuerza.",
  },
  {
    id: "scaption_mancuernas",
    label: "Scaption con mancuernas",
    emoji: "🪄",
    color: "#4f46e5",
    videoTitle: "Scaption Dumbbell (short)",
    videoUrl: "https://www.youtube.com/shorts/4mL0v5Z9WzM",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Elevación en el plano de la escápula para trabajar manguito rotador y deltoides con buena alineación articular.",
  },
  {
    id: "wall_slide",
    label: "Deslizamientos en pared (wall slide)",
    emoji: "🧱",
    color: "#38bdf8",
    videoTitle: "Wall Slides Shoulder Rehab (short)",
    videoUrl: "https://www.youtube.com/shorts/8L4dZp3EJ0Y",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio de movilidad y control escapular deslizando brazos sobre la pared. Muy usado en rehabilitación de hombro.",
  },
  {
    id: "serratus_punch_banda",
    label: "Serratus punch con banda",
    emoji: "🥊",
    color: "#22c55e",
    videoTitle: "Serratus Punch Band (short)",
    videoUrl: "https://www.youtube.com/shorts/vxjzT4OQkV4",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Trabaja serrato anterior y control escapular, importante en patologías de hombro y rendimiento en empujes.",
  },

  // =========================
  // REHAB CADERA / RODILLA / PIE
  // =========================
  {
    id: "clamshell_banda",
    label: "Clamshell con banda",
    emoji: "🐚",
    color: "#22c55e",
    videoTitle: "Clamshell Band (short)",
    videoUrl: "https://www.youtube.com/shorts/XZC2W2Y1jzI",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Ejercicio de abducción de cadera con banda, muy utilizado para fortalecer glúteo medio en rehabilitación de rodilla y cadera.",
  },
  {
    id: "monster_walk",
    label: "Monster walk con banda",
    emoji: "👣",
    color: "#16a34a",
    videoTitle: "Monster Walk Band (short)",
    videoUrl: "https://www.youtube.com/shorts/k7RZ0bq9mE0",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Desplazamientos laterales con banda en las piernas para glúteos y control de rodilla.",
  },
  {
    id: "puente_unilateral",
    label: "Puente de glúteo unilateral",
    emoji: "🦵",
    color: "#10b981",
    videoTitle: "Single-Leg Glute Bridge (short)",
    videoUrl: "https://www.youtube.com/shorts/3zWZQ9c5bM0",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Puente de glúteo apoyando solo una pierna. Mejora fuerza y control unilateral de cadera.",
  },
  {
    id: "sentadilla_cajon",
    label: "Sentadilla a cajón",
    emoji: "🪑",
    color: "#facc15",
    videoTitle: "Box Squat Rehab (short)",
    videoUrl: "https://www.youtube.com/shorts/0H7mZ6K2s0I",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Sentadilla controlada sentado y levantándose de un cajón. Muy útil en readaptación de rodilla y cadera.",
  },
  {
    id: "nordic_hamstring",
    label: "Nordic hamstring",
    emoji: "🧎",
    color: "#f97316",
    videoTitle: "Nordic Hamstring (short)",
    videoUrl: "https://www.youtube.com/shorts/4m1yFh6XH9Q",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio excéntrico de isquiosurales para prevención de lesiones y desarrollo de fuerza excéntrica.",
  },
  {
    id: "eccentrico_gemelos_borde",
    label: "Excéntrico de gemelos en bordillo",
    emoji: "🪜",
    color: "#f97316",
    videoTitle: "Calf Eccentric Heel Drop (short)",
    videoUrl: "https://www.youtube.com/shorts/RmZ4pF6c1zE",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Elevaciones de talón con énfasis en la fase de descenso, muy utilizado en tendinopatía aquílea.",
  },

  // =========================
  // TRX / SUSPENSIÓN
  // =========================
  {
    id: "remo_trx",
    label: "Remo en TRX",
    emoji: "🎗️",
    color: "#0ea5e9",
    videoTitle: "TRX Row (short)",
    videoUrl: "https://www.youtube.com/shorts/7nF8mQ9uZgU",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Ejercicio de tracción con el propio peso corporal usando correas de suspensión. Ajustable por ángulo.",
  },
  {
    id: "flexiones_trx",
    label: "Flexiones en TRX",
    emoji: "🎗️",
    color: "#38bdf8",
    videoTitle: "TRX Push-up (short)",
    videoUrl: "https://www.youtube.com/shorts/yZP5m7R8q2I",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Flexiones con manos en TRX, aumentando la demanda de estabilidad de hombros y core.",
  },
  {
    id: "y_t_w_trx",
    label: "Y-T-W en TRX",
    emoji: "🔤",
    color: "#6366f1",
    videoTitle: "TRX Y-T-W (short)",
    videoUrl: "https://www.youtube.com/shorts/JQ9f2m6ZK5o",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Secuencia de movimientos de hombro con TRX formando letras Y, T y W. Excelente para musculatura escapular.",
  },

  // =========================
  // BALÓN MEDICINAL / IMPLEMENTOS
  // =========================
  {
    id: "lanzamiento_balon_pared",
    label: "Lanzamiento de balón medicinal contra pared",
    emoji: "🏐",
    color: "#f97316",
    videoTitle: "Med Ball Chest Pass Wall (short)",
    videoUrl: "https://www.youtube.com/shorts/v5qL1C9b2Zk",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Lanzamientos explosivos con balón medicinal para trabajar potencia de tren superior y core.",
  },
  {
    id: "slam_ballon",
    label: "Slam con balón medicinal",
    emoji: "💣",
    color: "#f97316",
    videoTitle: "Med Ball Slam (short)",
    videoUrl: "https://www.youtube.com/shorts/0z4Yp9kE2aM",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Golpes al suelo con balón medicinal. Ejercicio explosivo de cuerpo completo con alta demanda de core.",
  },
  {
    id: "rotaciones_balon_pared",
    label: "Rotaciones con balón contra la pared",
    emoji: "🌀",
    color: "#06b6d4",
    videoTitle: "Med Ball Rotational Throw (short)",
    videoUrl: "https://www.youtube.com/shorts/VG9Q2mJpH0U",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Lanzamientos rotacionales con balón, útil para deporte de raqueta, lanzadores y trabajo específico de core.",
  },
  // Vídeos añadidos por usuario
  {
    id: "desplazamiento_horizontal_pelotas_pilates",
    label: "Desplazamiento horizontal sobre pelotas de pilates",
    videoTitle: "Desplazamiento horizontal sobre pelotas de pilates",
    videoUrl: "https://www.youtube.com/watch?v=BMJAr0HLKH0",
    color: "#8b5cf6",
    type: EXERCISE_TYPES.BODYWEIGHT,
    description:
      "Desplazamiento lateral y horizontal sobre pelota de pilates: ejercicio de control postural y estabilidad dinámico que desafía el core y la coordinación. Mantén la columna neutra y mueve el cuerpo controlando el centro durante todo el recorrido.",
  },
  {
    id: "lanzamiento_balon_sentado",
    label: "Lanzamiento de balón medicinal desde sentado",
    videoTitle: "Lanzamiento de balón medicinal desde sentado",
    videoUrl: "https://www.youtube.com/watch?v=Mqp_8RDwsRA",
    color: "#f97316",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Lanzamiento de balón medicinal desde posición sentada: trabaja potencia del tronco y transferencia de fuerza desde el core. Mantén estabilidad lumbar y dirige el lanzamiento con control de hombros.",
  },
  {
    id: "lanzamiento_balon_atras",
    label: "Lanzamiento de balón medicinal desde atrás",
    videoTitle: "Lanzamiento de balón medicinal desde atrás",
    videoUrl: "https://www.youtube.com/watch?v=l6EYr71qba0",
    color: "#fb7185",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Lanzamiento de balón desde atrás: gesto explosivo que combina coordinación y potencia de cadena posterior. Asegura buena movilidad de hombro y activa la cadera al impulso.",
  },
  {
    id: "remo_polea_alta_pilates_sentado",
    label: "Remo con polea alta sentado en pelota de pilates",
    videoTitle: "Remo con polea alta sentado en pelota de pilates",
    videoUrl: "https://www.youtube.com/watch?v=gBO2HOiZazg",
    color: "#0ea5e9",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Remo en polea sentado sobre pelota de pilates: variante que añade desafío de estabilidad al entrenamiento de espalda. Mantén tronco estable y tira con la escápula primero.",
  },
  {
    id: "contractor_pectoral_poleas_sentado",
    label: "Contractor pectoral con poleas sentado",
    videoTitle: "Contractor pectoral con poleas sentado",
    videoUrl: "https://www.youtube.com/watch?v=gP2fcpYRrJM",
    color: "#ef4444",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Contractor pectoral en poleas sentado: excelente para aislar el pectoral con recorrido corto y tensión continua. Ajusta la posición para mantener tensión y evita tirar con hombros.",
  },
  {
    id: "elevacion_frontal_poleas",
    label: "Elevación frontal de hombros con poleas",
    videoTitle: "Elevación frontal de hombros con poleas",
    videoUrl: "https://www.youtube.com/watch?v=jFDy90vSDjQ",
    color: "#6366f1",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Elevación frontal con poleas: trabajo concentrado del deltoides anterior con control y recorrido guiado. Evita usar impulso y mantén una ligera flexión de codo.",
  },
  {
    id: "curl_biceps_poleas_altas",
    label: "Curl de bíceps sentado con poleas altas",
    videoTitle: "Curl de bíceps sentado con poleas altas",
    videoUrl: "https://www.youtube.com/watch?v=-3naVyrxGME",
    color: "#10b981",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Curl de bíceps con poleas altas en posición sentada: mantiene tensión constante y reduce balanceo del cuerpo. Asegura una ejecución controlada y contracción completa.",
  },
  {
    id: "jalon_polea_agarre_ancho_prono",
    label: "Jalón en polea alta agarre ancho prono",
    videoTitle: "Jalón en polea alta agarre ancho prono",
    videoUrl: "https://www.youtube.com/watch?v=JFLJq4Ah23A",
    color: "#2563eb",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Jalón agarre ancho prono: enfatiza dorsal ancho y mayor amplitud de movimiento. Mantén el torso algo inclinado hacia atrás y tira hasta la parte superior del pecho.",
  },
  {
    id: "rotacion_hombro_polea_codo_apoyado",
    label: "Rotación de hombro con cable polea codo apoyado",
    videoTitle: "Rotación de hombro con cable polea codo apoyado",
    videoUrl: "https://www.youtube.com/watch?v=Lm4iJb3Tep4",
    color: "#818cf8",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Rotación de hombro con polea, codo apoyado: ejercicio de rehabilitación que aísla rotadores externos. Usa carga ligera y controla la escapulación.",
  },
  {
    id: "cruces_inversos_cable_pie",
    label: "Cruces inversos con cable polea de pie",
    videoTitle: "Cruces inversos con cable polea de pie",
    videoUrl: "https://www.youtube.com/watch?v=TS06tIvwAuo",
    color: "#fb7185",
    type: EXERCISE_TYPES.WEIGHTED,
    description:
      "Cruces inversos (reverse cable cross) de pie: trabaja deltoides posterior y parte alta de la espalda. Mantén tronco estable y mueve el hombro en un arco controlado.",
  },
];

// Normalize and provide sensible defaults so filter logic finds matches
export const EXERCISES = RAW_EXERCISES.map((e) => {
  const normalized = { ...e };

  // equipment: array of strings. If missing, infer from type or mark as 'Sin material'
  if (!normalized.equipment) {
    if (normalized.type === EXERCISE_TYPES.WEIGHTED) {
      normalized.equipment = ["Barra"];
    } else {
      normalized.equipment = ["Sin material"];
    }
  } else if (!Array.isArray(normalized.equipment)) {
    normalized.equipment = [String(normalized.equipment)];
  }

  // goal: array of strings
  if (!normalized.goal) normalized.goal = [];
  else if (!Array.isArray(normalized.goal)) normalized.goal = [String(normalized.goal)];

  // area: string
  if (!normalized.area) normalized.area = "General";

  // level: 'inicial'|'medio'|'avanzado'
  if (!normalized.level) normalized.level = "medio";

  return normalized;
});
