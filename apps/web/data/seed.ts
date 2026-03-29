// Prototype V1 — Données simulées basées sur 15-REAL-DATA-ANALYSIS.md
// Contient 44 employés et 17 clients actifs

export const employees = [
  // Team Leaders / Admins
  { id: "e1", employeeCode: "20-6338", firstName: "Mandy", lastName: "De Melo", employeeType: "TEAM_LEADER", isActive: true },
  { id: "e2", employeeCode: "20-7112", firstName: "Jessica", lastName: "Santos", employeeType: "TEAM_LEADER", isActive: true },
  { id: "e3", employeeCode: "20-8045", firstName: "Paola", lastName: "Soares", employeeType: "TEAM_LEADER", isActive: true },
  
  // Titulaires & Backups (Realistic SAMSIC data generation up to 44)
  ...Array.from({ length: 30 }).map((_, i) => ({
    id: `et${i+4}`,
    employeeCode: `20-1${100+i}`,
    firstName: `Titulaire${i+1}`,
    lastName: `Employé`,
    employeeType: "TITULAR",
    isActive: true
  })),
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: `eb${i+34}`,
    employeeCode: `20-2${100+i}`,
    firstName: `Backup${i+1}`,
    lastName: `Employé`,
    employeeType: "BACKUP",
    isActive: true
  }))
];

export const clients = [
  // 17 Real Clients (Mocked names representing typical Luxembourg corporate clients)
  { id: "c1", name: "Bank of China", industry: "Banking" },
  { id: "c2", name: "Amazon", industry: "Technology" },
  { id: "c3", name: "BGL BNP Paribas", industry: "Banking" },
  { id: "c4", name: "PwC Luxembourg", industry: "Consulting" },
  { id: "c5", name: "KPMG", industry: "Consulting" },
  { id: "c6", name: "Deloitte", industry: "Consulting" },
  { id: "c7", name: "EY", industry: "Consulting" },
  { id: "c8", name: "RTL Group", industry: "Media" },
  { id: "c9", name: "Spuerkeess", industry: "Banking" },
  { id: "c10", name: "Cargolux", industry: "Logistics" },
  { id: "c11", name: "ArcelorMittal", industry: "Industrial" },
  { id: "c12", name: "POST Luxembourg", industry: "Telecommunications" },
  { id: "c13", name: "Luxair", industry: "Aviation" },
  { id: "c14", name: "SES", industry: "Technology" },
  { id: "c15", name: "Encevo", industry: "Energy" },
  { id: "c16", name: "BIL", industry: "Banking" },
  { id: "c17", name: "Arendt & Medernach", industry: "Legal" }
];

export const posts = [
  ...clients.flatMap((c, index) => {
    return [
      { id: `p${index}1`, clientId: c.id, name: "Réception A", startTime: "08:00", endTime: "17:00", contractCode: `1100${index}A` },
      { id: `p${index}2`, clientId: c.id, name: "Mailroom", startTime: "09:00", endTime: "18:00", contractCode: `1100${index}B` }
    ];
  })
]; // Gives around 34 posts total for the 17 clients
