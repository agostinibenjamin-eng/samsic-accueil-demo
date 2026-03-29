'use client';

/**
 * /login — Page de connexion SAMSIC Accueil
 * CEO priority: première impression = crédibilité totale
 * Credentials démo : mandy@samsic.lu / demo2026
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, Zap } from 'lucide-react';

const DEMO_CREDENTIALS = { email: 'mandy@samsic.lu', password: 'demo2026' };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation auth (démo)
    await new Promise(r => setTimeout(r, 900));

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // Stocker session démo
      sessionStorage.setItem('samsic_user', JSON.stringify({
        name: 'Mandy De Melo',
        role: 'Chef de service',
        email,
      }));
      router.push('/');
    } else {
      setError('Identifiants incorrects. Utilisez les credentials de démo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-samsic-marine flex">
      {/* Panneau gauche — Branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 relative overflow-hidden">
        {/* Motif géométrique discret */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #bfa894 0px, #bfa894 1px,
            transparent 1px, transparent 40px
          )`,
        }} />

        {/* Logo SAMSIC officiel */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
            <Image
              src="/samsic-logo.png"
              alt="SAMSIC Facility"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="text-white font-display font-black text-2xl tracking-widest leading-none">SAMSIC</div>
            <div className="text-samsic-sable text-sm font-body tracking-[0.2em] uppercase mt-0.5">Accueil</div>
          </div>
        </div>

        {/* Message central */}
        <div className="relative z-10">
          <h1 className="text-white font-display font-black text-5xl leading-tight mb-6">
            La gestion d&apos;accueil,<br />
            <span className="text-samsic-sable">réinventée.</span>
          </h1>
          <p className="text-samsic-marine-30 font-body text-lg leading-relaxed max-w-md">
            L&apos;IA qui remplace les appels téléphoniques. 
            16 critères de scoring. Résultat en&nbsp;&lt;&nbsp;5&nbsp;ms.
          </p>
        </div>

        {/* Stats démo */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { value: '96%', label: 'Taux de couverture moyen' },
            { value: '8 sec', label: 'Délai suggestion IA' },
            { value: '−6h', label: 'Travail manuel/semaine' },
          ].map(({ value, label }) => (
            <div key={label} className="border-t border-samsic-marine-80 pt-4">
              <div className="text-samsic-sable font-display font-black text-3xl">{value}</div>
              <div className="text-samsic-marine-30 text-xs font-body mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — Formulaire */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col justify-center px-10 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 overflow-hidden flex-shrink-0">
            <Image
              src="/samsic-logo.png"
              alt="SAMSIC Facility"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-black text-samsic-marine text-lg tracking-widest">SAMSIC ACCUEIL</span>
        </div>

        <div style={{ animation: 'slideInUp 0.4s ease forwards' }}>
          <div className="mb-8">
            <h2 className="text-2xl font-display font-black text-samsic-marine">Connexion</h2>
            <p className="text-samsic-marine-50 font-body text-sm mt-1">
              Accès sécurisé à votre espace de gestion
            </p>
          </div>

          {/* Badge démo */}
          <div className="bg-samsic-sable-30 border-l-4 border-l-samsic-sable px-4 py-3 mb-6 flex items-center gap-2">
            <Zap size={14} className="text-samsic-marine flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-samsic-marine font-body">Mode démo activé</p>
              <p className="text-xs text-samsic-marine-50 font-body">Credentials pré-remplis · Données réelles</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-samsic-marine font-body uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-samsic-marine-50" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-3 text-sm border border-samsic-sable-50 bg-white text-samsic-marine font-body focus:outline-none focus:border-samsic-marine transition-colors"
                  placeholder="votre@email.lu"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-samsic-marine font-body uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-samsic-marine-50" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-3 text-sm border border-samsic-sable-50 bg-white text-samsic-marine font-body focus:outline-none focus:border-samsic-marine transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-samsic-marine-50 hover:text-samsic-marine transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-danger-bg border-l-4 border-l-danger px-3 py-2 text-xs text-danger font-body font-bold">
                {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-samsic-marine text-white py-3.5 text-sm font-bold font-body tracking-wide hover:bg-samsic-marine-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-samsic-sable-50">
            <p className="text-xs text-samsic-marine-50 font-body text-center">
              Accès réservé aux équipes SAMSIC Facility Luxembourg
            </p>
            <p className="text-xs text-samsic-marine-30 font-body text-center mt-1">
              v0.9.0-demo · Hébergé en Europe · RGPD conforme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
