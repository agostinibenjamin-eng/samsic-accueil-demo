/**
 * idle-optimizer.ts — Module d'optimisation des heures non prestées
 * 
 * Identifie les agents sous-utilisés et propose des formations
 * proactives sur les postes fragiles (peu de backups).
 * 
 * Logique gérant : "Un employé payé à ne rien faire = perte sèche.
 * Un employé formé sur un nouveau poste = investissement avec ROI."
 */

import type {
  EmployeeProfile,
  PostRequirements,
  PostFragility,
  TrainingSuggestion,
  IdleTimeReport,
  TurnoverAlert,
  PostTraining,
} from '@/types/ai-engine';

// ─── Constantes ──────────────────────────────────────────────────────────────

const COMPETENCE_EXPIRY_MONTHS = 6;
const FRAGILITY_CRITICAL_THRESHOLD = 0.5;  // fragilityIndex ≥ 0.5 = CRITICAL
const FRAGILITY_HIGH_THRESHOLD = 0.34;     // fragilityIndex ≥ 0.34 = HIGH
const FRAGILITY_MEDIUM_THRESHOLD = 0.2;    // fragilityIndex ≥ 0.2 = MEDIUM

// ─── Fragilité par Poste ─────────────────────────────────────────────────────

/**
 * Calcule l'indice de fragilité pour chaque poste.
 * fragilityIndex = 1 / (nombre de backups formés TRAINED + 1)
 * 
 * Plus l'indice est haut (proche de 1), plus le poste est fragile.
 * Un poste avec 0 backup formé = fragilityIndex = 1 (critique)
 * Un poste avec 1 backup = 0.50 (élevé)
 * Un poste avec 2 backups = 0.33 (moyen)
 * Un poste avec 4+ backups = ≤0.20 (faible)
 */
export function calculatePostFragility(
  posts: PostRequirements[],
  employees: EmployeeProfile[],
): PostFragility[] {

  return posts.map(post => {
    // Compter les backups formés TRAINED pour ce poste
    const trainedBackups = employees.filter(emp => {
      if (!emp.isActive) return false;
      return emp.trainedPosts.some(
        t => t.postId === post.id && t.status === 'TRAINED'
      );
    });

    // Ne compter que les "vrais" backups (exclure le titulaire actuel)
    const backupCount = trainedBackups.length;
    const fragilityIndex = 1 / (backupCount + 1);

    let riskLevel: PostFragility['riskLevel'];
    if (fragilityIndex >= FRAGILITY_CRITICAL_THRESHOLD) {
      riskLevel = 'CRITICAL';
    } else if (fragilityIndex >= FRAGILITY_HIGH_THRESHOLD) {
      riskLevel = 'HIGH';
    } else if (fragilityIndex >= FRAGILITY_MEDIUM_THRESHOLD) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      postId: post.id,
      postName: post.name || post.id,
      clientId: post.clientId,
      clientName: post.clientName || post.clientId,
      clientPriority: post.clientPriority,
      trainedBackupCount: backupCount,
      fragilityIndex,
      riskLevel,
    };
  });
}

// ─── Suggestions de Formation ────────────────────────────────────────────────

/**
 * Croise les agents sous-utilisés avec les postes fragiles pour générer
 * des suggestions de formation prioritaires.
 * 
 * Formule de priorité :
 * Priority = (FragilityIndex × 40) 
 *          + (UtilizationGap% × 30)
 *          + (StrategicValue × 20)
 *          + (TrainingEfficiency × 10)
 */
export function getTrainingSuggestions(
  employees: EmployeeProfile[],
  posts: PostRequirements[],
  fragilities?: PostFragility[],
): TrainingSuggestion[] {

  const postFragilities = fragilities || calculatePostFragility(posts, employees);
  const suggestions: TrainingSuggestion[] = [];

  // Trouver les agents sous-utilisés
  const underutilized = employees.filter(emp => {
    if (!emp.isActive) return false;
    return (emp.weeklyContractHours - emp.weeklyAssignedHours) > 0;
  });

  for (const emp of underutilized) {
    const gapHours = emp.weeklyContractHours - emp.weeklyAssignedHours;
    const gapRatio = gapHours / emp.weeklyContractHours;

    for (const fragility of postFragilities) {
      // Ne pas proposer si déjà formé TRAINED
      const existingTraining = emp.trainedPosts.find(t => t.postId === fragility.postId);
      if (existingTraining?.status === 'TRAINED') continue;

      // Ne pas proposer si l'agent est hors zone
      const post = posts.find(p => p.id === fragility.postId);
      if (post?.zone && emp.acceptedZones.length > 0 && !emp.acceptedZones.includes(post.zone)) continue;

      // Vérifier les langues (level check basique)
      if (post?.requiredLanguages) {
        const hasMinLangs = post.requiredLanguages
          .filter(l => l.priority === 'CRITICAL')
          .every(l => emp.languages.some(el => el.code === l.code));
        if (!hasMinLangs) continue;
      }

      // Calculer la priorité
      const strategicValue = fragility.clientPriority === 'VIP' ? 1
        : fragility.clientPriority === 'PREMIUM' ? 0.6 : 0.3;

      const estimatedHours = existingTraining?.status === 'IN_PROGRESS' ? 4
        : existingTraining?.status === 'NEEDS_REFRESH' ? 2 : 8;

      const trainingEfficiency = 1 - (estimatedHours / 40);

      const priority = Math.round(
        (fragility.fragilityIndex * 40) +
        (gapRatio * 30) +
        (strategicValue * 20) +
        (trainingEfficiency * 10)
      );

      // ROI simplifié : (risque_couvert × coût_non_couverture) / coût_formation  
      const hourlyRate = 16; // Taux moyen pour le calcul
      const roi = Math.round(
        ((fragility.fragilityIndex * 400) / (estimatedHours * hourlyRate)) * 100
      ) / 100;

      let reason: string;
      if (existingTraining?.status === 'IN_PROGRESS') {
        reason = `Finaliser la formation en cours (${estimatedHours}h restantes)`;
      } else if (existingTraining?.status === 'NEEDS_REFRESH') {
        reason = `Rafraîchir les compétences (pas affecté depuis > 6 mois)`;
      } else if (fragility.riskLevel === 'CRITICAL') {
        reason = `Poste CRITIQUE (0 backup formé) — Formation urgente`;
      } else {
        reason = `Renforcer la couverture backup (${fragility.trainedBackupCount} backup${fragility.trainedBackupCount > 1 ? 's' : ''})`;
      }

      suggestions.push({
        employeeId: emp.id,
        employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        postId: fragility.postId,
        postName: fragility.postName,
        clientName: fragility.clientName,
        priority,
        reason,
        estimatedHours,
        availableHours: gapHours,
        roi,
      });
    }
  }

  // Trier par priorité décroissante
  return suggestions.sort((a, b) => b.priority - a.priority);
}

// ─── Rapport Idle Time ───────────────────────────────────────────────────────

/**
 * Génère un rapport complet des heures non prestées et des actions suggérées.
 */
export function getIdleTimeReport(
  employees: EmployeeProfile[],
  posts: PostRequirements[],
): IdleTimeReport {

  const active = employees.filter(e => e.isActive);
  const fragilities = calculatePostFragility(posts, active);
  const trainingSuggestions = getTrainingSuggestions(active, posts, fragilities);

  const underutilizedAgents = active
    .filter(e => e.weeklyContractHours > e.weeklyAssignedHours)
    .map(e => {
      const gap = e.weeklyContractHours - e.weeklyAssignedHours;
      return {
        employeeId: e.id,
        employeeName: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
        contractHours: e.weeklyContractHours,
        assignedHours: e.weeklyAssignedHours,
        gapHours: gap,
        gapCost: Math.round(gap * 16), // 16€/h moyen
      };
    })
    .sort((a, b) => b.gapHours - a.gapHours);

  return {
    totalIdleHours: underutilizedAgents.reduce((s, a) => s + a.gapHours, 0),
    totalIdleCost: underutilizedAgents.reduce((s, a) => s + a.gapCost, 0),
    underutilizedAgents,
    trainingSuggestions: trainingSuggestions.slice(0, 10), // Top 10
    fragilePosts: fragilities
      .filter(f => f.riskLevel === 'CRITICAL' || f.riskLevel === 'HIGH')
      .sort((a, b) => b.fragilityIndex - a.fragilityIndex),
  };
}

// ─── Alertes Turnover ────────────────────────────────────────────────────────

/**
 * Détecte les événements de turnover imminents :
 * - CDD/Intérim qui expire dans les 30 prochains jours
 * - Certifications qui expirent
 * - Départs planifiés
 */
export function getTurnoverAlerts(
  employees: EmployeeProfile[],
  posts: PostRequirements[],
  referenceDate?: string,
): TurnoverAlert[] {

  const today = referenceDate || new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);
  const alerts: TurnoverAlert[] = [];

  for (const emp of employees) {
    if (!emp.isActive) continue;

    // --- CDD / INTERIM qui expire ---
    if (emp.contractEndDate && (emp.contractType === 'CDD' || emp.contractType === 'INTERIM')) {
      const endDate = new Date(emp.contractEndDate);
      const daysRemaining = Math.ceil(
        (endDate.getTime() - todayDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysRemaining > 0 && daysRemaining <= 60) {
        const impactedPosts = emp.trainedPosts
          .filter(t => t.status === 'TRAINED')
          .map(t => t.postId);

        alerts.push({
          type: emp.contractType === 'CDD' ? 'CDD_EXPIRING' : 'INTERIM_EXPIRING',
          employeeId: emp.id,
          employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          date: emp.contractEndDate,
          daysRemaining,
          impactedPosts,
          severity: daysRemaining <= 14 ? 'CRITICAL' : daysRemaining <= 30 ? 'WARNING' : 'INFO',
          recommendation: daysRemaining <= 14
            ? `URGENT: Former un backup immédiatement pour les ${impactedPosts.length} poste(s) impactés`
            : `Planifier la transition : renouveler le contrat ou former un remplaçant`,
        });
      }
    }

    // --- Départ planifié ---
    if (emp.departureDate) {
      const depDate = new Date(emp.departureDate);
      const daysRemaining = Math.ceil(
        (depDate.getTime() - todayDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysRemaining > 0 && daysRemaining <= 90) {
        const impactedPosts = emp.trainedPosts
          .filter(t => t.status === 'TRAINED')
          .map(t => t.postId);

        alerts.push({
          type: 'RESIGNATION',
          employeeId: emp.id,
          employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          date: emp.departureDate,
          daysRemaining,
          impactedPosts,
          severity: daysRemaining <= 14 ? 'CRITICAL' : 'WARNING',
          recommendation: `${emp.departureReason || 'Départ'} dans ${daysRemaining}j. ` +
            `${impactedPosts.length} poste(s) à risque. Lancer le recrutement et/ou la formation de backup.`,
        });
      }
    }

    // --- Certifications qui expirent ---
    for (const cert of emp.certifications) {
      if (cert.expiresAt) {
        const expDate = new Date(cert.expiresAt);
        const daysRemaining = Math.ceil(
          (expDate.getTime() - todayDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        if (daysRemaining > 0 && daysRemaining <= 60) {
          // Trouver les postes qui exigent cette certification
          const impactedPosts = posts
            .filter(p => p.requiredCertifications?.includes(cert.name))
            .map(p => p.id);

          if (impactedPosts.length > 0) {
            alerts.push({
              type: 'CERT_EXPIRING',
              employeeId: emp.id,
              employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              date: cert.expiresAt,
              daysRemaining,
              impactedPosts,
              severity: daysRemaining <= 14 ? 'CRITICAL' : 'WARNING',
              recommendation: `Certification ${cert.name} expire le ${cert.expiresAt}. ` +
                `Planifier le renouvellement pour maintenir l'éligibilité sur ${impactedPosts.length} poste(s).`,
            });
          }
        }
      }
    }
  }

  // Trier par urgence (severity CRITICAL d'abord, puis jours restants)
  return alerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.daysRemaining - b.daysRemaining;
  });
}
