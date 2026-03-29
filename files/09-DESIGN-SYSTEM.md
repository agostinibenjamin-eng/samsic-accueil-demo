# 09 — Design System — Bold Geometric

> ⚠️ Charte graphique SAMSIC demandée, en attente. Palette provisoire basée sur le branding connu.

## Direction artistique : Bold Geometric / Constructiviste
Formes angulaires (0 arrondi), aplats de couleurs, gros chiffres, rouge SAMSIC dominant, composition asymétrique. Influence Bauhaus. JAMAIS de purple gradients, Inter, Roboto, ou esthétique "AI app" générique.

## Palette

```css
:root {
  --samsic-red: #D42E12;
  --samsic-red-dark: #A82410;
  --samsic-red-light: #F4DDD8;
  --black: #0A0A0A;
  --charcoal: #1C1C1E;
  --slate: #2C2C30;
  --gray: #6B6B70;
  --gray-light: #A8A8AE;
  --cream: #F5F3EF;
  --white: #FFFFFF;
  --green: #1B8C3D; --green-light: #D5F0DD;
  --orange: #E87A1E; --orange-light: #FDE8D0;
  --blue: #1565C0; --blue-light: #D4E6F9;
  --violet: #6B21A8; --violet-light: #EDE5F7;
}
```

## Typographie
- Headings : **Outfit** (weight 700-900, pas de serif)
- Body : **Outfit** (weight 400-600)
- Mono : JetBrains Mono (code, scores)
- JAMAIS : Inter, Roboto, Arial, Space Grotesk

## Composants clés
- **Sidebar** : 220px, fond noir, items actifs = fond rouge + bordure gauche blanche
- **Stat blocks** : Rectangle blanc, trait latéral coloré 4px, chiffre 38-52px weight 900
- **Planning grid** : Bordures fines, code couleur (vert confirmé, rouge absent, orange en attente, violet simulation)
- **Score IA** : Barres horizontales par critère, score total 42px weight 900, confidence badge
- **Alertes** : Barre rouge pleine largeur (critique), bordure gauche colorée (warning/info)
- **Avatars** : Carrés (pas de border-radius), initiales blanches sur fond coloré
- **Boutons** : Rectangulaires, fond noir → rouge au hover, uppercase, letter-spacing 1

## Animations
- Page load : fade 150ms
- Alerte critique : pulse 2s infinite
- Score bars : fill 500ms ease-out
- Toast : slide-in top-right, dismiss 5s
- Hover boutons : transition 150ms
