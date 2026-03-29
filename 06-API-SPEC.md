# 06 — Spécification API REST

> Base URL : `https://api.samsic-accueil.eu/v1` · Format JSON · Auth Bearer JWT

## Auth
| Méthode | Endpoint | Rôle min |
|---------|----------|----------|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Authentifié |
| POST | `/auth/logout` | Authentifié |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |

## Users
| POST/GET/PATCH/DELETE | `/users`, `/users/:id` | Admin |

## Employees
| GET | `/employees` | Operator | Filtres: division, skills, languages, active |
| GET | `/employees/:id` | Operator | Détail complet + scores IA |
| POST/PATCH/DELETE | `/employees/:id` | Admin |
| GET | `/employees/:id/assignments` | Operator |
| GET | `/employees/:id/absences` | Operator |
| PUT | `/employees/:id/languages` | Admin |
| PUT | `/employees/:id/skills` | Admin |
| POST | `/employees/:id/certifications` | Admin |
| GET | `/employees/:id/backup-trainings` | Operator | Sites où formé |

## Clients & Sites & Posts
| GET/POST/PATCH/DELETE | `/clients`, `/clients/:id` | Admin |
| GET/POST | `/clients/:id/sites`, `/clients/:id/contacts` | Admin |
| GET/POST/PATCH | `/sites/:id/posts` | Admin |
| PUT | `/posts/:id/requirements` | Admin |
| PUT | `/posts/:id/backup-trainings` | Admin | Gérer formé/à former |

## Planning & Assignments
| GET | `/planning?weekStart=&divisionId=&clientId=` | Operator | Planning matriciel |
| GET | `/planning/daily` | Operator |
| POST/PATCH/DELETE | `/assignments` | Operator |
| POST | `/planning/simulate` | Operator | Ne sauvegarde pas |
| POST | `/planning/export-pdf` | Operator |
| POST | `/planning/send-to-client` | Operator |

## Absences
| GET/POST/PATCH/DELETE | `/absences` | Operator | Auto-déclenche IA |

## Moteur IA
| GET | `/ai/suggestions/:replacementId` | Operator |
| POST | `/ai/suggestions/:id/accept` | Operator |
| POST | `/ai/suggestions/:id/reject` | Operator | Avec motif |
| POST | `/ai/find-replacement` | Operator | Recherche manuelle |
| GET | `/ai/risk-report` | Operator |
| GET/PUT | `/ai/config` | Super Admin | Pondérations |

## Alertes
| GET | `/alerts`, `/alerts/count` | Operator |
| PATCH | `/alerts/:id/acknowledge`, `/alerts/:id/resolve` | Operator |

## Emails
| GET | `/emails/logs` | Admin |
| POST | `/emails/send-planning` | Operator |

## Dashboard & KPIs
| GET | `/dashboard/today`, `/dashboard/week`, `/dashboard/kpis` | Viewer |
| GET | `/dashboard/coverage-rate`, `/dashboard/replacement-rate` | Viewer |
| GET | `/dashboard/employee-load` | Operator |

## Import/Export
| POST | `/import/employees`, `/import/clients` | Admin |
| GET | `/export/planning-pdf`, `/export/employees-csv` | Operator |

## Config
| GET/POST | `/config/divisions`, `/config/languages`, `/config/skills` | Admin |
| GET/POST | `/config/time-slots`, `/config/absence-types` | Admin |

## Audit
| GET | `/audit?user=&entity=&date=` | Admin |
