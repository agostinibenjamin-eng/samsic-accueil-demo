# 03 — Modèle de données

> Mis à jour avec les données réelles SAMSIC (44 employés, 17 clients, 35 postes)

## Entités principales

```prisma
model Division {
  id String @id @default(cuid())
  name String // "Accueil", "Nettoyage"
  code String @unique
  isActive Boolean @default(true)
  users User[]
  clients Client[]
  employees Employee[]
  skills Skill[]
  timeSlots TimeSlotTemplate[]
}

model User {
  id String @id @default(cuid())
  email String @unique
  passwordHash String
  firstName String
  lastName String
  phone String?
  role UserRole // SUPER_ADMIN, ADMIN, OPERATOR, VIEWER
  divisionId String?
  division Division? @relation(fields: [divisionId], references: [id])
  isActive Boolean @default(true)
  mustResetPwd Boolean @default(true)
  lastLoginAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Employee {
  id String @id @default(cuid())
  employeeCode String @unique // Matricule SAMSIC ex: "20-6338"
  firstName String
  lastName String
  email String?
  phone String?
  employeeType EmployeeType // TITULAR, BACKUP, TEAM_LEADER
  contractType ContractType?
  weeklyHours Float?
  isActive Boolean @default(true)
  divisionId String
  division Division @relation(fields: [divisionId], references: [id])
  languages EmployeeLanguage[]
  skills EmployeeSkill[]
  certifications Certification[]
  availabilities Availability[]
  assignments Assignment[]
  absences Absence[]
  backupTrainings BackupTraining[] // Remplace StandbyDesignation
  feedbacks EmployeeFeedback[]
  versatilityScore Float? // 0-100, recalculé chaque nuit
  weeklyLoadHours Float?
}

enum EmployeeType { TITULAR BACKUP TEAM_LEADER }
enum ContractType { CDI CDD INTERIM APPRENTICE }

model Client {
  id String @id @default(cuid())
  name String // "Bank of China", "Amazon"
  clientCode String? // Code interne SAMSIC
  industry String?
  divisionId String
  division Division @relation(fields: [divisionId], references: [id])
  isActive Boolean @default(true)
  sites Site[]
  contacts ClientContact[]
}

model ClientContact {
  id String @id @default(cuid())
  clientId String
  client Client @relation(fields: [clientId], references: [id])
  firstName String
  lastName String
  email String
  phone String?
  role String? // "Office Management", "Coordinator"
  isPrimary Boolean @default(false)
  receivesPlanningEmail Boolean @default(true)
}

model Site {
  id String @id @default(cuid())
  clientId String
  client Client @relation(fields: [clientId], references: [id])
  name String // "Siège Kirchberg"
  address String?
  city String?
  posts Post[]
}

model Post {
  id String @id @default(cuid())
  siteId String
  site Site @relation(fields: [siteId], references: [id])
  contractCode String? // Code contrat SAMSIC "110045", "110076"
  name String // "Réception", "PA", "Mailroom", "Coursier"
  startTime String // "07:00", "09:00", "12:00"
  endTime String // "18:00", "17:00", "16:00"
  daysOfWeek DayOfWeek[] // [MONDAY..FRIDAY] typiquement
  isActive Boolean @default(true)
  languageRequirements PostLanguageRequirement[]
  skillRequirements PostSkillRequirement[]
  assignments Assignment[]
  backupTrainings BackupTraining[]
}

// NOUVEAU — Remplace StandbyDesignation
// Indique si un backup est formé ou à former sur un poste
model BackupTraining {
  id String @id @default(cuid())
  employeeId String
  employee Employee @relation(fields: [employeeId], references: [id])
  postId String
  post Post @relation(fields: [postId], references: [id])
  status TrainingStatus // TRAINED, TO_TRAIN, IN_PROGRESS
  trainedAt DateTime?
  @@unique([employeeId, postId])
}

enum TrainingStatus { TRAINED TO_TRAIN IN_PROGRESS }
```

## Planning & Affectations

```prisma
model Assignment {
  id String @id @default(cuid())
  postId String
  post Post @relation(fields: [postId], references: [id])
  employeeId String
  employee Employee @relation(fields: [employeeId], references: [id])
  date DateTime @db.Date
  startTime String
  endTime String
  status AssignmentStatus @default(CONFIRMED)
  isOriginal Boolean @default(true) // false = remplacement
  aiScore Float?
  aiDetails Json?
  notes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Pas de unique [employeeId, date] car backups peuvent avoir 2 sites/jour
  @@unique([postId, date])
  @@index([date])
}

enum AssignmentStatus { CONFIRMED PENDING ABSENT REPLACED UNCOVERED CANCELLED }

model Absence {
  id String @id @default(cuid())
  employeeId String
  employee Employee @relation(fields: [employeeId], references: [id])
  startDate DateTime @db.Date
  endDate DateTime @db.Date
  type AbsenceType
  reason String?
  status AbsenceStatus @default(DECLARED)
  declaredBy String
  replacements Replacement[]
}

enum AbsenceType { SICK_LEAVE PLANNED_LEAVE EMERGENCY_LEAVE TRAINING UNJUSTIFIED MATERNITY OTHER }
enum AbsenceStatus { DECLARED REPLACEMENT_FOUND PARTIALLY_COVERED UNCOVERED RESOLVED }

model Replacement {
  id String @id @default(cuid())
  absenceId String
  absence Absence @relation(fields: [absenceId], references: [id])
  postId String
  date DateTime @db.Date
  status ReplacementStatus @default(SEARCHING)
  selectedId String?
  suggestions ReplacementSuggestion[]
}

model ReplacementSuggestion {
  id String @id @default(cuid())
  replacementId String
  replacement Replacement @relation(fields: [replacementId], references: [id])
  employeeId String
  rank Int
  totalScore Float
  scoreDetails Json // { langues: 28, competences: 18, ... }
  status SuggestionStatus @default(PENDING)
  rejectionReason String?
}
```

## Langues, Compétences, Certifications

```prisma
model Language {
  id String @id @default(cuid())
  code String @unique // "fr", "en", "de", "lu", "pt"
  name String
}

model EmployeeLanguage {
  id String @id @default(cuid())
  employeeId String
  employee Employee @relation(fields: [employeeId], references: [id])
  languageId String
  language Language @relation(fields: [languageId], references: [id])
  level LanguageLevel // BEGINNER, INTERMEDIATE, FLUENT, NATIVE
  @@unique([employeeId, languageId])
}

model Skill {
  id String @id @default(cuid())
  name String // "Standard tél.", "VIP", "Juridique", "Mailroom"
  category String?
  divisionId String
}

model EmployeeSkill {
  id String @id @default(cuid())
  employeeId String
  skillId String
  level SkillLevel @default(COMPETENT)
  @@unique([employeeId, skillId])
}

model Certification {
  id String @id @default(cuid())
  employeeId String
  name String // "SSIAP", "SST"
  issuedAt DateTime
  expiresAt DateTime?
  isValid Boolean @default(true)
}

model PostLanguageRequirement {
  id String @id @default(cuid())
  postId String
  languageId String
  minLevel LanguageLevel
  priority RequirementPriority // CRITICAL, IMPORTANT, PREFERRED
}

model PostSkillRequirement {
  id String @id @default(cuid())
  postId String
  skillId String
  priority RequirementPriority
}

enum RequirementPriority { CRITICAL IMPORTANT PREFERRED }
```

## Alertes, Emails, Audit, IA Learning

```prisma
model Alert {
  id String @id @default(cuid())
  type AlertType // UNCOVERED_POST, NO_REPLACEMENT, CERT_EXPIRING, etc.
  severity AlertSeverity // CRITICAL, WARNING, INFO
  title String
  message String
  data Json?
  status AlertStatus @default(ACTIVE)
  divisionId String
  escalatedAt DateTime?
}

model EmailLog {
  id String @id @default(cuid())
  templateCode String // "WEEKLY_PLANNING", "ASSIGNMENT_CHANGE"
  recipientEmail String
  recipientType RecipientType // CLIENT_CONTACT, EMPLOYEE, ADMIN
  subject String
  status EmailStatus @default(QUEUED) // QUEUED, SENT, FAILED
  sentAt DateTime?
  metadata Json?
}

model AuditLog {
  id String @id @default(cuid())
  userId String
  action String // "CREATE", "UPDATE", "DELETE", "LOGIN"
  entity String // "Employee", "Assignment"
  entityId String?
  changes Json?
  createdAt DateTime @default(now())
}

// IA Learning
model ClientWeightOverride {
  id String @id @default(cuid())
  clientId String
  criterion String // "languages", "skills", etc.
  adjustment Float // -0.10 à +0.10
  confidence Float
  observations Int
  @@unique([clientId, criterion])
}

model EmployeeClientAffinity {
  id String @id @default(cuid())
  employeeId String
  clientId String
  affinityScore Float @default(0) // -10 à +10
  basedOn Int @default(0)
  @@unique([employeeId, clientId])
}
```

## Volumétrie

| Table | V1 (Accueil) | V3 (Multi-métier) |
|-------|-------------|-------------------|
| Employee | 44 | 500+ |
| Client | 17 | 250+ |
| Post | ~35 | 500+ |
| Assignment/jour | ~35 | ~500 |
| Assignment/an | ~9 000 | ~130 000 |
