---
name: samsic-data-model
description: "Schéma Prisma complet SAMSIC Accueil — Employee, Client, Post, Assignment, Absence, AILog. Utiliser pour toute requête BDD, migration ou nouveau modèle."
risk: safe
source: project-local
date_added: "2026-03-28"
---

# Samsic Accueil — Modèle de Données

> Source : `03-DATA-MODEL.md`  
> ORM : Prisma (PostgreSQL 16)  
> Règle : Jamais de SQL brut — toujours via Prisma Client

---

## 1. Schéma Prisma Complet

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum EmployeeType {
  TITULAR      // Titulaire d'un poste fixe
  BACKUP       // Backup (peut être formé ou non)
  TEAM_LEADER  // Mandy, Jessica, Paola
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
}

enum AssignmentStatus {
  CONFIRMED     // Titulaire confirmé
  TRAINED_BACKUP    // Backup formé
  UNTRAINED_BACKUP  // Backup à former
  SIMULATION    // Affectation simulée (non sauvegardée)
}

enum AbsenceType {
  SICK_LEAVE    // Maladie
  PAID_LEAVE    // Congé payé
  TRAINING      // Formation
  OTHER         // Autre
}

enum AlertSeverity {
  CRITICAL   // Rouge — action immédiate
  WARNING    // Orange — action requise aujourd'hui
  INFO       // Bleu — information
}

enum AlertStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  IGNORED
}

// ==================== MODÈLES ====================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          UserRole
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  auditLogs     AuditLog[]
}

enum UserRole {
  ADMIN      // Mandy — accès total
  OPERATOR   // Jessica, Paola — gestion planning
  READONLY   // Consultation uniquement
}

model Employee {
  id              String         @id @default(cuid())
  employeeCode    String         @unique  // ex: "20-6338"
  firstName       String
  lastName        String
  email           String?        @unique
  phone           String?
  employeeType    EmployeeType
  status          EmployeeStatus @default(ACTIVE)
  
  // Compétences et langues
  languages       String[]       // ['fr', 'en', 'de', 'lu', 'pt']
  skills          String[]       // ['standard_telephonique', 'accueil_vip']
  
  // Données métier
  hireDate        DateTime
  contractType    String?        // CDI, CDD, Intérim
  weeklyHours     Float          @default(40) // heures contractuelles
  
  // Préférences (pour le scoring IA)
  preferredClientIds String[]    // IDs clients préférés
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  // Relations
  assignments     Assignment[]
  absences        Absence[]
  trainedPosts    PostTraining[]
  aiLogs          AILog[]

  @@index([status])
  @@index([employeeType])
}

model Client {
  id          String   @id @default(cuid())
  name        String   @unique
  industry    String?
  address     String?
  
  // Contact client (pour envoi planning)
  contactName  String?
  contactEmail String?
  contactPhone String?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  posts       Post[]
}

model Post {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  
  name        String          // "Réception A", "Mailroom"
  contractCode String?        // "11000A"
  
  // Horaires
  startTime   String          // "08:00"
  endTime     String          // "17:00"
  workDays    Int[]           // [1,2,3,4,5] = Lun-Ven (ISO weekday)
  
  // Exigences du poste
  requiredLanguages    String[]  // langues obligatoires
  criticalLanguage     String?   // UNE langue absolument critique
  requiredSkills       String[]
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  assignments  Assignment[]
  trainings    PostTraining[]

  @@index([clientId])
}

model PostTraining {
  id          String   @id @default(cuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  postId      String
  post        Post     @relation(fields: [postId], references: [id])
  
  isCompleted Boolean  @default(false)  // false = à former, true = formé
  trainedAt   DateTime?
  
  @@unique([employeeId, postId])
}

model Assignment {
  id          String           @id @default(cuid())
  employeeId  String
  employee    Employee         @relation(fields: [employeeId], references: [id])
  postId      String
  post        Post             @relation(fields: [postId], references: [id])
  
  date        DateTime         @db.Date  // jour de l'affectation
  status      AssignmentStatus @default(CONFIRMED)
  
  // Traçabilité IA
  aiSuggested  Boolean         @default(false)
  aiScore      Float?          // score 0-100 au moment de l'affectation
  aiLogId      String?
  
  // Audit
  assignedById String?         // ID du User qui a fait l'affectation
  assignedAt   DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@unique([postId, date])    // Un poste = 1 affectation par jour
  @@index([date])
  @@index([employeeId])
}

model Absence {
  id          String      @id @default(cuid())
  employeeId  String
  employee    Employee    @relation(fields: [employeeId], references: [id])
  
  startDate   DateTime    @db.Date
  endDate     DateTime    @db.Date
  absenceType AbsenceType
  reason      String?
  
  // Déclenchement IA
  aiTriggered Boolean     @default(false)
  aiProcessedAt DateTime?
  
  declaredById String?
  createdAt    DateTime   @default(now())

  @@index([employeeId])
  @@index([startDate, endDate])
}

model Alert {
  id          String        @id @default(cuid())
  
  severity    AlertSeverity
  status      AlertStatus   @default(OPEN)
  title       String
  description String
  
  // Contexte
  clientId    String?
  postId      String?
  date        DateTime?     @db.Date
  employeeId  String?
  
  // Escalade (30 min non traité → email admin)
  createdAt   DateTime      @default(now())
  resolvedAt  DateTime?
  resolvedById String?

  @@index([status, severity])
  @@index([createdAt])
}

model AILog {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id])
  postId        String
  date          DateTime @db.Date
  
  // Résultat du scoring
  totalScore    Float
  isEligible    Boolean
  criteria      Json     // ScoreBreakdown complet
  
  // Feedback
  action        String?  // 'ACCEPTED' | 'REFUSED'
  refusalReason String?
  
  processingMs  Int
  createdAt     DateTime @default(now())

  @@index([postId, date])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // 'CREATE_ASSIGNMENT', 'DELETE_EMPLOYEE', etc.
  entity    String   // 'Assignment', 'Employee', etc.
  entityId  String
  details   Json?    // avant/après
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

---

## 2. Données Réelles SAMSIC (Seed)

```typescript
// apps/api/prisma/seed.ts

const REAL_EMPLOYEES = [
  // Team Leaders (3)
  { code: '20-6338', firstName: 'Mandy',   lastName: 'De Melo', type: 'TEAM_LEADER', languages: ['fr','en','pt'] },
  { code: '20-7112', firstName: 'Jessica', lastName: 'Santos',  type: 'TEAM_LEADER', languages: ['fr','en','pt'] },
  { code: '20-8045', firstName: 'Paola',   lastName: 'Soares',  type: 'TEAM_LEADER', languages: ['fr','pt'] },
  // 30 Titulaires + 11 Backups → total 44
];

const REAL_CLIENTS = [
  'Bank of China', 'Amazon', 'BGL BNP Paribas', 'PwC Luxembourg',
  'KPMG', 'Deloitte', 'EY', 'RTL Group', 'Spuerkeess', 'Cargolux',
  'ArcelorMittal', 'POST Luxembourg', 'Luxair', 'SES', 'Encevo',
  'BIL', 'Arendt & Medernach'
]; // 17 clients
```

---

## 3. Requêtes Prisma Fréquentes

```typescript
// Trouver tous les employés disponibles à une date
const available = await prisma.employee.findMany({
  where: {
    status: 'ACTIVE',
    absences: {
      none: {
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      }
    }
  },
  include: { trainedPosts: true, assignments: { where: { date: targetDate } } }
});

// Créer une affectation IA
const assignment = await prisma.assignment.upsert({
  where: { postId_date: { postId, date } },
  create: { employeeId, postId, date, status, aiSuggested: true, aiScore, aiLogId },
  update: { employeeId, status, aiSuggested: true, aiScore },
});

// Alertes ouvertes triées par sévérité
const alerts = await prisma.alert.findMany({
  where: { status: 'OPEN' },
  orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
});
```

---

## 4. Index de Performance Critiques

```sql
-- Recherche de disponibilité par date (requête la plus fréquente)
CREATE INDEX idx_absence_dates ON "Absence"("startDate", "endDate");
CREATE INDEX idx_assignment_date ON "Assignment"("date");
CREATE INDEX idx_assignment_employee ON "Assignment"("employeeId", "date");

-- Alertes ouvertes (dashboard temps réel)
CREATE INDEX idx_alert_open ON "Alert"("status", "severity", "createdAt");
```

## When to Use
Utiliser ce skill pour toute opération sur la base de données : création de modèles,
écriture de requêtes Prisma, migrations, ou compréhension du schéma.
Ne jamais écrire de SQL brut — toujours via Prisma Client.
