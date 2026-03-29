# 11 — Déploiement et infrastructure

## Environnements
| Env | Usage | URL |
|-----|-------|-----|
| development | Dev local | localhost:3000 / :4000 |
| staging | Validation SAMSIC | staging.samsic-accueil.eu |
| production | Production | app.samsic-accueil.eu |

## Infrastructure cible (Cloud UE)
| Service | Choix | Coût estimé/mois |
|---------|-------|------------------|
| Serveur app | VPS 4 vCPU, 8GB RAM | ~30€ |
| BDD | PostgreSQL Managed | ~40€ |
| Stockage | S3-compatible 10GB | ~5€ |
| Emails | Resend (free tier 3000/mois) | 0€ |
| CDN + WAF | Cloudflare | 0-20€ |
| Monitoring | Uptime Kuma (self-hosted) | 0€ |
| **TOTAL** | | **~75-95€/mois** |

Couvert par les 200€ HT/mois de maintenance.

## Docker Compose
Next.js (web:3000) + NestJS (api:4000) + PostgreSQL + Nginx reverse proxy. Tous `restart: unless-stopped`.

## CI/CD — GitHub Actions
Push `develop` → deploy staging. Push `main` → deploy production. Pipeline : test → lint → build → deploy.

## Sauvegardes
- Full backup quotidien 2h (`pg_dump` + S3), rétention 30j
- WAL archiving continu, restauration point-in-time
- Test restauration mensuel. SLA restauration < 4h.

## Monitoring
Uptime (<99.5%), temps réponse API (p95 <2s), CPU (<80%), RAM (<85%), erreurs 5xx (<10/h), échecs email (<5%).

## Sécurité infra
UFW (ports 80/443), SSH clé uniquement, unattended upgrades, Docker non-root, secrets en .env (non commité), HTTPS via Cloudflare, Helmet + rate limiting.
