# 09 — Design System — Charte graphique officielle SAMSIC Facility

> ✅ Basé sur la charte graphique officielle SAMSIC Facility reçue le 27/03/2026
> Direction : **Bold Geometric** appliquée aux couleurs officielles SAMSIC

---

## Identité SAMSIC Facility

### Logo
- Logo SAMSIC Facility sur tous les supports. Pantone 432C.
- Couleur : `#24303b` sur clair, blanc sur sombre. Versions N&B et monochrome.

### Typographies officielles
- **Open Sans** : Extra Bold / Bold (titres), Regular (texte courant), Light (labels)
- **Roboto** : Black / Bold (gros chiffres KPIs, titres forts)

```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
```

---

## Palette officielle

### Couleurs principales
| Nom | Hex | Usage |
|-----|-----|-------|
| **Bleu marine SAMSIC** | `#24303b` | Primaire — sidebar, headers, textes |
| **Beige sable SAMSIC** | `#bfa894` | Secondaire — accents, badges, traits |

### Déclinaisons marine
`#24303b` → `#5c666e` → `#999ea3` → `#c2c4c7`

### Déclinaisons sable
`#bfa894` → `#ccbaab` → `#ded4c9` → `#ede5de`

### Bleus web
`#0078b0` → `#3391c2` → `#80bad6` → `#cce3f0`

### Fonctionnels
| Statut | Couleur | Fond |
|--------|---------|------|
| Succès/Confirmé | `#2E7D32` | `#E8F5E9` |
| Alerte/En cours | `#E87A1E` | `#FFF3E0` |
| Danger/Non couvert | `#C62828` | `#FFEBEE` |
| Info | `#0078b0` | `#cce3f0` |
| Simulation | `#6B21A8` | `#F3E5F5` |

---

## CSS Variables

```css
:root {
  --samsic-marine: #24303b;
  --samsic-marine-80: #5c666e;
  --samsic-marine-50: #999ea3;
  --samsic-marine-30: #c2c4c7;
  --samsic-sable: #bfa894;
  --samsic-sable-80: #ccbaab;
  --samsic-sable-50: #ded4c9;
  --samsic-sable-30: #ede5de;
  --samsic-bleu: #0078b0;
  --samsic-bleu-80: #3391c2;
  --samsic-bleu-50: #80bad6;
  --samsic-bleu-30: #cce3f0;
  --color-success: #2E7D32; --color-success-bg: #E8F5E9;
  --color-warning: #E87A1E; --color-warning-bg: #FFF3E0;
  --color-danger: #C62828; --color-danger-bg: #FFEBEE;
  --color-simulation: #6B21A8; --color-simulation-bg: #F3E5F5;
  --bg-page: #ede5de;
  --bg-card: #FFFFFF;
  --bg-sidebar: #24303b;
  --text-primary: #24303b;
  --text-secondary: #5c666e;
  --text-tertiary: #999ea3;
  --text-on-dark: #FFFFFF;
  --border-default: #ded4c9;
  --border-strong: #bfa894;
  --font-heading: 'Open Sans', sans-serif;
  --font-body: 'Open Sans', sans-serif;
  --font-display: 'Roboto', sans-serif;
}
```

---

## Composants Bold Geometric × SAMSIC

### Sidebar
Fond `#24303b`, logo SAMSIC blanc, item actif = fond `#bfa894` texte `#24303b`, inactifs = `#999ea3`. 0 arrondi.

### KPI Stat blocks
Blanc, trait latéral 4px sable ou fonctionnel. Chiffre Roboto Black 38-52px `#24303b`. Label Open Sans 600 uppercase `#999ea3`.

### Planning : code couleur
| Statut | Trait gauche | Fond |
|--------|-------------|------|
| Confirmé titulaire | `#2E7D32` | `#E8F5E9` |
| Backup formé | `#0078b0` | `#cce3f0` |
| Backup remplacement | `#E87A1E` | `#FFF3E0` |
| Non couvert | `#C62828` | `#FFEBEE` |
| En attente | `#bfa894` | `#ede5de` |
| Simulation | `#6B21A8` | `#F3E5F5` |

### Boutons
- Primaire : fond `#24303b`, hover `#0078b0`, texte blanc
- CTA : fond `#0078b0`, hover `#3391c2`
- Danger : fond `#C62828`
- Tous : border-radius 0, uppercase, letter-spacing 0.5-1px

### Avatars (carrés, 0 arrondi)
- Titulaires : fond `#24303b` · Backups : fond `#bfa894` · Team leaders : fond `#0078b0`

### Alertes
- Critique : barre pleine `#C62828` blanc
- Warning : bordure gauche `#E87A1E`, fond `#FFF3E0`
- Info : bordure gauche `#0078b0`, fond `#cce3f0`

### Pictogrammes
Utiliser les pictos métier SAMSIC. "Accueil" = visage femme. Contour `#24303b` sur clair, blanc sur pastille marine/sable.

---

## Échelle typographique

| Classe | Font | Size | Weight |
|--------|------|------|--------|
| display | Roboto | 2.5rem | 900 |
| kpi | Roboto | 2rem | 900 |
| h1 | Open Sans | 1.5rem | 800 |
| h2 | Open Sans | 1.25rem | 700 |
| h3 | Open Sans | 1.125rem | 700 |
| body | Open Sans | 0.875rem | 400 |
| small | Open Sans | 0.8125rem | 400 |
| caption | Open Sans | 0.75rem | 300 (uppercase, spaced) |
