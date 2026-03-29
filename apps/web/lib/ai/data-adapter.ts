/**
 * data-adapter.ts — Pont entre les données statiques (employees-data.ts) 
 * et les types du moteur IA v2 (ai-engine.ts)
 * 
 * Utilisé pendant la phase prototype. En V1 (NestJS+PostgreSQL),
 * ce fichier sera remplacé par des requêtes Prisma/Drizzle.
 */

import type { EmployeeFullProfile } from '@/lib/data/employees-data';
import type { EmployeeProfile, PostRequirements, PostTraining, LanguageSkill } from '../../../../packages/shared/src/types/ai-engine';

/**
 * Convertit un EmployeeFullProfile (données statiques) 
 * en EmployeeProfile (type v2 du moteur IA)
 */
export function toEmployeeProfile(
  emp: EmployeeFullProfile,
  assignedShifts?: EmployeeProfile['assignedShifts'],
  recentShifts?: EmployeeProfile['recentShifts'],
): EmployeeProfile {
  return {
    id: emp.id,
    employeeCode: emp.employeeCode,
    firstName: emp.firstName,
    lastName: emp.lastName,
    employeeType: emp.employeeType,
    contractType: emp.contractType,
    contractStartDate: emp.contractStartDate,
    isActive: emp.isActive,

    // Langues : mapping direct (même format)
    languages: emp.languages as LanguageSkill[],

    // Skills : extraire juste les ids en string[]
    skills: emp.skills.map(s => s.id),

    // Certifications : mapping direct
    certifications: emp.certifications.map(c => ({
      name: c.name,
      expiresAt: c.expiresAt,
      isValid: c.isValid,
    })),

    // Trained posts : enrichir avec postId = clientId + postName normalisé
    trainedPosts: emp.trainedPosts.map(t => {
      const postId = normalizePostId(t.clientId, t.postName);
      return {
        postId,
        clientId: t.clientId,
        status: t.status as PostTraining['status'],
        trainedAt: t.trainedAt,
      };
    }),

    // Préférences et contraintes
    preferredClientIds: [], // Pas dans les données statiques v1
    acceptedZones: emp.acceptedZones,
    hasVehicle: emp.hasVehicle,
    
    // Charge
    weeklyContractHours: emp.weeklyContractHours,
    weeklyAssignedHours: emp.weeklyAssignedHours,
    reliabilityScore: emp.reliabilityScore,
    absenceRate: emp.absenceRate,

    // Shifts (vides par défaut, peuplés par le store)
    assignedShifts: assignedShifts || [],
    recentShifts: recentShifts || [],
  };
}

/**
 * Génère un postId normalisé à partir du clientId et du nom de poste.
 * Ex: "bank-of-china" + "Réception A" → "bank-of-china--reception-a"
 */
export function normalizePostId(clientId: string, postName: string): string {
  const normalized = postName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${clientId}--${normalized}`;
}

/**
 * Construit les PostRequirements à partir des données clients statiques.
 * En V1, cela viendra de la table Post en BDD.
 */
export function buildPostRequirements(
  clientId: string,
  clientName: string,
  postName: string,
  overrides?: Partial<PostRequirements>,
): PostRequirements {
  const postId = normalizePostId(clientId, postName);
  
  return {
    id: postId,
    name: postName,
    clientId,
    clientName,
    startTime: '08:00',
    endTime: '17:00',
    requiredLanguages: [],
    requiredSkills: [],
    clientPriority: 'STANDARD',
    zone: 'kirchberg', // Défaut Luxembourg centre
    continuitySensitivity: 'MEDIUM',
    ...overrides,
  };
}
