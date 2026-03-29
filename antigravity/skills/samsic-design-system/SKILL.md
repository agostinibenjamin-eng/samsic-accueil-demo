---
name: samsic-design-system
description: "Charte graphique SAMSIC Facility — Marine #24303b, Sable #bfa894, Bold Geometric, 0px radius. Utiliser pour tout composant UI du projet Samsic Accueil."
risk: safe
source: project-local
date_added: "2026-03-28"
---

# Samsic Accueil — Design System (Bold Geometric)

> **RÈGLE ABSOLUE :** Toute interface créée pour Samsic Accueil DOIT respecter ce design system.  
> Aucun écart n'est toléré. Consulter avant chaque composant.

---

## 1. Palette de couleurs officielle

### Couleurs Principales

| Token CSS | Valeur HEX | Usage |
|-----------|-----------|-------|
| `--samsic-marine` | `#24303b` | Sidebar, textes titres, CTA principal |
| `--samsic-marine-80` | `#5c666e` | Texte secondaire, labels |
| `--samsic-marine-50` | `#999ea3` | Texte tertiaire, placeholders |
| `--samsic-marine-30` | `#c2c4c7` | Bordures légères, séparateurs |
| `--samsic-sable` | `#bfa894` | Accents, bordures gauches actives |
| `--samsic-sable-80` | `#ccbaab` | Hover states subtils |
| `--samsic-sable-50` | `#ded4c9` | Bordures cards |
| `--samsic-sable-30` | `#ede5de` | **Fond de page principal** |
| `--samsic-bleu` | `#0078b0` | Liens, actions secondaires, info |
| `--samsic-bleu-80` | `#3391c2` | Hover liens |
| `--samsic-bleu-50` | `#80bad6` | Badges info |
| `--samsic-bleu-30` | `#cce3f0` | Fond badges info |

### Couleurs Fonctionnelles (OBLIGATOIRES)

| Usage | Couleur texte | Fond | Tailwind |
|-------|--------------|------|---------|
| Succès / Confirmé | `#2E7D32` | `#E8F5E9` | `text-success bg-success-bg` |
| Alerte / Attention | `#E87A1E` | `#FFF3E0` | `text-warning bg-warning-bg` |
| Danger / Critique | `#C62828` | `#FFEBEE` | `text-danger bg-danger-bg` |
| Simulation | `#6B21A8` | `#F3E5F5` | `text-simulation bg-simulation-bg` |
| Info / Neutre | `#0078b0` | `#cce3f0` | `text-samsic-bleu bg-samsic-bleu-30` |

---

## 2. Typographies

### Open Sans (Corps / UI)
```
font-family: 'Open Sans', sans-serif;
variable: --font-body
```
- Poids utilisés : 300 (light), 400 (regular), 600 (semibold), 700 (bold), 800 (extrabold)
- Usage : Tous les textes courants, labels, paragraphes, boutons

### Roboto (Display / KPIs)
```
font-family: 'Roboto', sans-serif;
variable: --font-display
```
- Poids utilisés : 400, 500, 700, 900 (black)
- Usage : Chiffres KPI, métriques, nombres

### Convention typographique

| Rôle | Police | Poids | Taille |
|------|--------|-------|--------|
| H1 Page | Open Sans | 800 | text-3xl |
| H2 Section | Open Sans | 700 | text-xl |
| H3 Card | Open Sans | 600 | text-lg |
| Body | Open Sans | 400 | text-sm |
| Label | Open Sans | 600 | text-xs uppercase tracking-wider |
| KPI Number | Roboto | 900 | text-4xl |
| Badge | Open Sans | 700 | text-xs |

---

## 3. Règles de forme — AUCUN ARRONDI

```css
/* OBLIGATOIRE — Appliqué globalement */
--radius: 0rem;
border-radius: 0 !important;
```

❌ **INTERDIT :** `rounded`, `rounded-md`, `rounded-lg`, `rounded-full`  
✅ **AUTORISÉ :** Angles vifs uniquement. Toutes les cartes, boutons, badges = carrés.

---

## 4. Structure de Layout

### Sidebar (Fond Marine)
```
Largeur : 256px (w-64)
Fond : bg-samsic-marine (#24303b)
Texte : text-white
Nav active : bg-samsic-sable text-samsic-marine font-bold
Nav hover : bg-samsic-marine-80 text-white
```

### Page principale
```
Fond : bg-samsic-sable-30 (#ede5de)
Padding : p-8
```

### Cards
```
Fond : bg-white
Bordure : border border-samsic-sable-50
Ombre : shadow-sm (légère)
Bordure gauche accent : border-l-4 border-samsic-sable (cards normales)
Bordure gauche alerte : border-l-4 border-warning (cards alertes)
```

---

## 5. Composants Standards Samsic

### Bouton Primaire (CTA Marine)
```tsx
className="bg-samsic-marine text-white px-4 py-2 font-body font-semibold 
           text-sm tracking-wide hover:bg-samsic-marine-80 
           transition-colors duration-200"
```

### Bouton Secondaire (Contour Sable)
```tsx
className="border-2 border-samsic-sable text-samsic-marine px-4 py-2 
           font-body font-semibold text-sm tracking-wide
           hover:bg-samsic-sable-30 transition-colors duration-200"
```

### Bouton Action Bleu
```tsx
className="bg-samsic-bleu text-white px-4 py-2 font-body font-semibold 
           text-sm tracking-wide hover:bg-samsic-bleu-80 
           transition-colors duration-200"
```

### Badge Statut
```tsx
// Succès
className="inline-flex items-center px-2 py-0.5 text-xs font-bold 
           bg-success-bg text-success"
// Danger
className="inline-flex items-center px-2 py-0.5 text-xs font-bold 
           bg-danger-bg text-danger"
```

### Card KPI
```tsx
className="bg-white p-6 border-l-4 border-samsic-sable shadow-sm"
// Titre KPI
titleClass="text-samsic-marine-50 uppercase text-xs font-semibold tracking-wider mb-2"
// Valeur KPI
valueClass="text-4xl font-display font-black text-samsic-marine"
```

---

## 6. Codes couleur Planning Matriciel

| Statut affectation | Fond | Texte | Bordure |
|-------------------|------|-------|---------|
| Titulaire confirmé | `#E8F5E9` | `#2E7D32` | `#2E7D32` |
| Backup formé | `#cce3f0` | `#0078b0` | `#0078b0` |
| Backup à former | `#FFF3E0` | `#E87A1E` | `#E87A1E` |
| Non couvert | `#FFEBEE` | `#C62828` | `#C62828` |
| Weekend / Fermé | `#f5f5f5` | `#999ea3` | `#c2c4c7` |
| Mode simulation | `#F3E5F5` | `#6B21A8` | `#6B21A8` |

---

## 7. Mode Simulation

Quand le mode simulation est actif :
```tsx
// Bandeau en haut
className="bg-simulation text-white text-sm font-bold py-2 px-4 text-center"
// Contenu : "MODE SIMULATION — Les modifications ne sont pas sauvegardées"

// Toggle bouton simulation actif
className="bg-simulation-bg text-simulation border-2 border-simulation 
           px-4 py-2 font-bold text-sm"
```

---

## 8. Anti-patterns INTERDITS

❌ Gradient purple/pink/orange générique  
❌ Inter font  
❌ Arrondi (rounded-*)  
❌ Ombre lourde (shadow-lg, shadow-xl)  
❌ Couleurs non-SAMSIC  
❌ Design card "glassmorphism"  
❌ Fond blanc sur fond blanc (pas de contraste)  

---

## 9. DFII Score Samsic (Frontend-Design)

- **Aesthetic Impact:** 4/5 (Industriel / Institutional Utilitarian — mémorable)
- **Context Fit:** 5/5 (B2B workplace scheduling — parfaitement adapté)
- **Implementation Feasibility:** 5/5 (Tailwind + CSS vars — trivial)
- **Performance Safety:** 5/5 (pas d'effets lourds)
- **Consistency Risk:** 1/5 (système simple, répétable)

**DFII = (4+5+5+5) − 1 = 18/15 → EXCELLENT**

## When to Use
Utiliser ce skill pour TOUT composant UI du projet Samsic Accueil.
Ne jamais créer de composant sans consulter ce skill d'abord.
