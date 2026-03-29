/**
 * ai-engine.ts — Types du Moteur IA v2
 * 16 critères (11 éliminatoires + 5 pondérés + 1 bonus)
 * Cascade Solver, Idle Time Optimizer, Turnover Management
 */

// ─── Enums & Primitives ──────────────────────────────────────────────────────

export type LangueCode = 'fr' | 'en' | 'de' | 'lu' | 'pt' | 'zh' | 'ar' | 'it' | 'es' | 'jp';

export type LanguageLevel = 'BEGINNER' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';

export type EmployeeTypeCode = 'TITULAR' | 'BACKUP' | 'TEAM_LEADER';

export type ContractTypeCode = 'CDI' | 'CDD' | 'INTERIM' | 'APPRENTICE';

export type ClientPriority = 'VIP' | 'PREMIUM' | 'STANDARD';

export type ContinuitySensitivity = 'HIGH' | 'MEDIUM' | 'LOW';

export type TrainingStatusCode = 'TRAINED' | 'IN_PROGRESS' | 'TO_TRAIN' | 'NEEDS_REFRESH';

// ─── Shift (créneau horaire — remplace le concept "jour entier") ─────────────

export interface Shift {
  postId: string;
  postName?: string;
  clientId?: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // "07:00"
  endTime: string;     // "18:00"
}

// ─── Language avec Niveau ────────────────────────────────────────────────────

export interface LanguageSkill {
  code: LangueCode;
  level: LanguageLevel;
}

// ─── Certification ───────────────────────────────────────────────────────────

export interface CertificationInfo {
  name: string;          // "SST", "SSIAP"
  expiresAt?: string;    // YYYY-MM-DD, undefined = permanent
  isValid: boolean;
}

// ─── Training par poste ──────────────────────────────────────────────────────

export interface PostTraining {
  postId: string;
  clientId: string;
  status: TrainingStatusCode;
  trainedAt?: string;     // YYYY-MM-DD
  lastAssignedAt?: string; // YYYY-MM-DD — pour détecter les compétences qui "expirent"
}

// ─── Employee Profile (enrichi v2) ───────────────────────────────────────────

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  firstName?: string;
  lastName?: string;

  // Type & Contrat
  employeeType: EmployeeTypeCode;
  contractType: ContractTypeCode;
  contractStartDate?: string;       // YYYY-MM-DD
  contractEndDate?: string;         // YYYY-MM-DD — pour CDD/INTERIM
  isActive: boolean;                // false = démissionnaire, licencié, fin de contrat
  departureDate?: string;           // YYYY-MM-DD — date effective de départ
  departureReason?: 'RESIGNATION' | 'DISMISSAL' | 'CONTRACT_END' | 'RETIREMENT' | 'MUTUAL_AGREEMENT';

  // Compétences
  languages: LanguageSkill[];
  skills: string[];
  certifications: CertificationInfo[];
  trainedPosts: PostTraining[];

  // Préférences & Contraintes
  preferredClientIds: string[];
  acceptedZones: string[];
  hasVehicle: boolean;
  acceptsNightShift?: boolean;    // false = jamais de poste après 22h
  acceptsWeekend?: boolean;       // false = pas de dimanche/fériés
  securityClearanceLevel?: number; // 0 = aucun, 1 = basique, 2 = confidentiel, 3 = secret

  // Charge & Performance
  weeklyContractHours: number;
  weeklyAssignedHours: number;
  reliabilityScore: number;        // 0-100
  absenceRate: number;             // % 

  // Shifts en cours cette semaine
  assignedShifts: Shift[];

  // Historique récent (pour repos 11h et 6 jours consécutifs)
  recentShifts?: Shift[];          // 7 derniers jours

  // Blacklists
  clientBlacklist?: string[];      // IDs de clients qui ont blacklisté cet employé

  // Médical
  medicalRestrictions?: string[];  // ex: "NO_STANDING", "NO_NIGHT", "PART_TIME_THERAPEUTIC"
}

// ─── Post Requirements (enrichi v2) ─────────────────────────────────────────

export interface LanguageRequirement {
  code: LangueCode;
  minLevel: LanguageLevel;
  priority: 'CRITICAL' | 'IMPORTANT' | 'PREFERRED';
}

export interface PostRequirements {
  id: string;
  name?: string;
  clientId: string;
  clientName?: string;

  // Horaire
  startTime: string;     // "07:00"
  endTime: string;       // "18:00"

  // Exigences
  requiredLanguages: LanguageRequirement[];
  requiredSkills: string[];
  requiredCertifications?: string[];   // "SST", "SSIAP"
  requiredClearanceLevel?: number;     // 0-3

  // Client  
  clientPriority: ClientPriority;
  zone: string;                        // "kirchberg", "centre", "leudelange"
  continuitySensitivity: ContinuitySensitivity;

  // Criticité
  coverageCriticality?: 'CRITICAL' | 'STANDARD'; // CRITICAL = pas 1 min de trou
  dressCode?: string;
}

// ─── Scoring Context ─────────────────────────────────────────────────────────

export interface ScoringContext {
  employee: EmployeeProfile;
  post: PostRequirements;
  date: string;                                     // YYYY-MM-DD
  strategy?: OptimizationStrategy;                  // Stratégie d'arbitrage
  clientHistory: Record<string, number>;            // clientId → nb affectations passées
  postHistory: Record<string, number>;              // postId → nb affectations passées
  lastAssignedEmployeeId?: string;                  // Pour le critère de continuité
  clientPreferredEmployeeIds?: string[];            // Préférences nominatives du client
  clientAffinityScore?: number;                     // -10 à +10 (EmployeeClientAffinity)
}

// ─── Score Breakdown (enrichi v2) ────────────────────────────────────────────

export interface ScoreBreakdown {
  employeeId: string;
  employeeName?: string;
  totalScore: number;            // 0-100 + bonus
  isEligible: boolean;
  eliminationReasons: string[];  // Toutes les raisons d'élimination (peut y en avoir plusieurs)
  reasoning: string[];           // Explications humaines de chaque critère scoré
  warnings?: string[];           // Avertissements non éliminatoires (ex. fin de contrat proche)

  criteria: {
    // Éliminatoires (true = passé, false = bloqué)
    e1_languages: boolean;
    e2_skills: boolean;
    e3_availability: boolean;
    e4_legalRest11h: boolean;
    e5_maxDailyHours: boolean;
    e6_maxWeeklyHours: boolean;
    e7_clientBlacklist: boolean;
    e8_certifications: boolean;
    e9_securityClearance: boolean;
    e10_geographicZone: boolean;
    e11_consecutiveDays: boolean;
    e12_contractValidity: boolean;   // CDD/INTERIM pas expiré, employé actif

    // Pondérés
    p1_training: number;           // 0-30
    p2_clientAffinity: number;     // 0-20
    p3_serviceContinuity: number;  // 0-15
    p4_workloadBalance: number;    // 0-15
    p5_reliability: number;        // 0-10
    p6_seniority: number;          // 0-10
    p7_clientPreference: number;   // 0 ou +20 (bonus)
  };

  confidence: number;              // 0-1
}

// ─── Cascade Result ──────────────────────────────────────────────────────────

export interface CascadeMove {
  employeeId: string;
  employeeName?: string;
  fromPostId: string | null;       // null = pas affecté actuellement
  fromPostName?: string;
  toPostId: string;
  toPostName?: string;
  date: string;
  score: number;
}

export interface CascadeResult {
  moves: CascadeMove[];
  depth: number;
  totalScore: number;              // Somme des scores de tous les mouvements
  uncoveredPosts: string[];        // Postes restant non couverts
  isComplete: boolean;             // true = tous les postes couverts
}

// ─── Suggestion Result ───────────────────────────────────────────────────────

export interface SuggestionResult {
  post: PostRequirements;
  date: string;
  suggestions: ScoreBreakdown[];
  eliminated: ScoreBreakdown[];    // Agents non éligibles avec leurs raisons
  hasCascade: boolean;
  cascade?: CascadeResult;
  cascadeDepth: number;
  processingTimeMs: number;
}

// ─── Idle Time Optimizer ─────────────────────────────────────────────────────

export interface PostFragility {
  postId: string;
  postName: string;
  clientId: string;
  clientName: string;
  clientPriority: ClientPriority;
  trainedBackupCount: number;
  fragilityIndex: number;         // 0-1, 1 = très fragile (0 backup)
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TrainingSuggestion {
  employeeId: string;
  employeeName: string;
  postId: string;
  postName: string;
  clientName: string;
  priority: number;               // Score de priorité (plus haut = plus urgent)
  reason: string;                 // Explication humaine
  estimatedHours: number;         // Heures estimées de formation
  availableHours: number;         // Heures libres de l'agent cette semaine
  roi: number;                    // Retour sur investissement estimé
}

export type OptimizationStrategy = 'OPTIMIZE_COSTS' | 'MAXIMIZE_SATISFACTION' | 'BALANCED';

export interface ScenarioResult {
  strategy: OptimizationStrategy;
  title: string;
  description: string;
  report: {
    totalProposals: number;
    gapsFilled: number;
    conflictsResolved: number;
    averageScore: number;
    estimatedSavings: number;
    warningsCount: number;
    unfilledGaps?: { date: string; postName: string; clientName: string; reason: string }[];
  };
  proposals: any[]; // We can keep any or typed depending on UI needs
}

export interface IdleTimeReport {
  totalIdleHours: number;
  totalIdleCost: number;          // En euros
  underutilizedAgents: Array<{
    employeeId: string;
    employeeName: string;
    contractHours: number;
    assignedHours: number;
    gapHours: number;
    gapCost: number;              // gapHours × hourlyRate
  }>;
  trainingSuggestions: TrainingSuggestion[];
  fragilePosts: PostFragility[];
}

// ─── Turnover & Workforce Planning ──────────────────────────────────────────

export interface TurnoverAlert {
  type: 'CDD_EXPIRING' | 'INTERIM_EXPIRING' | 'RESIGNATION' | 'RETIREMENT' | 'CERT_EXPIRING';
  employeeId: string;
  employeeName: string;
  date: string;                   // Date de l'événement
  daysRemaining: number;
  impactedPosts: string[];        // Postes qui perdront leur titulaire/backup
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  recommendation: string;         // Action suggérée par l'IA
}
