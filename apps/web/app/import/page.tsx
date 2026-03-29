/**
 * /import — Wizard d'import CSV des employés et clients
 * @samsic-design-system — Charte Marine/Sable, 0-radius  
 * @react-patterns — Client Component, wizard multi-étapes
 * @nextjs-best-practices — Pas de fetch localhost
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import { SettingsSidebar } from '@/components/layout/SettingsSidebar';
import { Users, Building2, Upload, Download, CheckCircle2, AlertTriangle, X, ArrowRight, ArrowLeft, FileText } from 'lucide-react';

// ═══════════════ CSV TEMPLATES ═══════════════

const EMPLOYEE_TEMPLATE = `matricule,prenom,nom,email,telephone,type,heures_semaine,langues
20-6338,Mandy,De Melo,mandy.demelo@samsic.lu,+352621000001,TITULAR,40,FR|EN|PT
20-6339,Jessica,Santos,jessica.santos@samsic.lu,+352621000002,TITULAR,40,FR|EN|PT
20-6340,Priya,Nair,priya.nair@samsic.lu,+352621000003,BACKUP,35,FR|EN
20-6341,Karim,Ghazi,karim.ghazi@samsic.lu,+352621000004,TITULAR,40,FR|EN|DE
20-6342,,[Prénom],[Nom],[email]@samsic.lu,[téléphone],TITULAR|BACKUP|TEAM_LEADER,[35-40],FR|EN|DE|LU|PT|IT|ZH`;

const CLIENT_TEMPLATE = `nom,code,secteur,adresse,ville,contact_nom,contact_email,contact_telephone
Bank of China,110045,Banque,37-39 Allée Scheffer,Luxembourg,Wei Zhang,w.zhang@boc.lu,+352278020
Cargolux Airlines,110XXX,Logistique,Aéroport Findel L-2990,Luxembourg,André Wagner,a.wagner@cargolux.com,+352421101
[Nom Client],[Code],[Secteur],[Adresse],[Ville],[Contact Nom],[Contact Email],[Contact Téléphone]`;

// ═══════════════ PARSE CSV (simple) ═══════════════

interface ParsedRow {
  [key: string]: string;
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[]; errors: string[] } {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [], errors: ['Fichier vide ou sans données'] };

  const headers = lines[0].split(',').map(h => h.trim());
  const errors: string[] = [];
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      errors.push(`Ligne ${i + 1} : ${values.length} colonnes attendues, ${headers.length} trouvées`);
      continue;
    }
    const row: ParsedRow = {};
    headers.forEach((h, j) => { row[h] = values[j] || ''; });
    rows.push(row);
  }

  return { headers, rows, errors };
}

// ═══════════════ VALIDATE ROW ═══════════════

function validateEmployeeRow(row: ParsedRow, idx: number): string[] {
  const errs: string[] = [];
  if (!row.matricule) errs.push(`Ligne ${idx + 2} : matricule requis`);
  if (!row.prenom || !row.nom) errs.push(`Ligne ${idx + 2} : prénom et nom requis`);
  if (!['TITULAR', 'BACKUP', 'TEAM_LEADER'].includes(row.type)) errs.push(`Ligne ${idx + 2} : type doit être TITULAR, BACKUP ou TEAM_LEADER`);
  return errs;
}

function validateClientRow(row: ParsedRow, idx: number): string[] {
  const errs: string[] = [];
  if (!row.nom) errs.push(`Ligne ${idx + 2} : nom client requis`);
  if (!row.contact_email) errs.push(`Ligne ${idx + 2} : email contact requis`);
  return errs;
}

// ═══════════════ MAIN PAGE ═══════════════

type ImportType = 'employees' | 'clients' | null;
type WizardStep = 1 | 2 | 3;
type RowStatus = 'valid' | 'warning' | 'error';

interface ParsedResult {
  headers: string[];
  rows: ParsedRow[];
  errors: string[];
  rowStatuses: RowStatus[];
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = useCallback((type: ImportType) => {
    const content = type === 'employees' ? EMPLOYEE_TEMPLATE : CLIENT_TEMPLATE;
    const filename = type === 'employees' ? 'template_employes.csv' : 'template_clients.csv';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows, errors: parseErrors } = parseCSV(text);
      const validationErrors: string[] = [];
      const rowStatuses: RowStatus[] = rows.map((row, idx) => {
        const errs = importType === 'employees' ? validateEmployeeRow(row, idx) : validateClientRow(row, idx);
        validationErrors.push(...errs);
        return errs.length > 0 ? 'error' : 'valid';
      });
      setParsed({ headers, rows, errors: [...parseErrors, ...validationErrors], rowStatuses });
      setStep(2);
    };
    reader.readAsText(file);
  }, [importType]);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    // Simulate import delay
    await new Promise(r => setTimeout(r, 1800));
    setIsImporting(false);
    setImportDone(true);
    setStep(3);
  }, []);

  const reset = useCallback(() => {
    setImportType(null);
    setStep(1);
    setParsed(null);
    setFileName('');
    setImportDone(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const validRows = parsed?.rows.filter((_, i) => parsed.rowStatuses[i] === 'valid') || [];
  const errorRows = parsed?.rows.filter((_, i) => parsed.rowStatuses[i] === 'error') || [];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SettingsSidebar />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <h1 className="text-2xl font-body font-extrabold text-samsic-marine">Import de Données</h1>
          <p className="text-sm text-samsic-marine-50 font-body mt-1">Importez vos employés ou clients depuis un fichier CSV</p>
        </div>

        <div className="px-8 py-6 max-w-4xl">
          {/* Progress indicator */}
          <div className="flex items-center gap-0 mb-8">
            {[
              { n: 1, label: 'Type & Fichier' },
              { n: 2, label: 'Aperçu & Validation' },
              { n: 3, label: 'Résultat' },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 ${step === n ? 'bg-samsic-marine text-white' : step > n ? 'bg-[#2E7D32] text-white' : 'bg-white border border-samsic-sable-50 text-samsic-marine-50'}`}>
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-none font-body">
                    {step > n ? '✓' : n}
                  </span>
                  <span className="text-xs font-body font-semibold">{label}</span>
                </div>
                {i < 2 && <div className={`w-8 h-px ${step > n ? 'bg-[#2E7D32]' : 'bg-samsic-sable-50'}`} />}
              </div>
            ))}
          </div>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Type selection */}
              <div>
                <h2 className="text-base font-body font-bold text-samsic-marine mb-4">Que souhaitez-vous importer ?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: 'employees' as ImportType, icon: Users, label: 'Employés', desc: '44 agents SAMSIC · Matricules, coordonnées, langues, type (Titulaire/Backup)' },
                    { type: 'clients' as ImportType, icon: Building2, label: 'Clients', desc: '17 clients actifs · Nom, code contrat, secteur, contacts, adresse' },
                  ].map(({ type, icon: Icon, label, desc }) => (
                    <button
                      key={type || ''}
                      onClick={() => setImportType(type)}
                      className={`text-left px-6 py-5 border-2 transition-all ${importType === type ? 'border-samsic-marine bg-samsic-marine text-white' : 'border-samsic-sable-50 bg-white hover:border-samsic-marine hover:bg-samsic-sable-30'}`}
                    >
                      <Icon size={24} className={importType === type ? 'text-samsic-sable mb-3' : 'text-samsic-marine mb-3'} />
                      <p className={`font-body font-bold text-base mb-1 ${importType === type ? 'text-white' : 'text-samsic-marine'}`}>{label}</p>
                      <p className={`font-body text-xs ${importType === type ? 'text-white/70' : 'text-samsic-marine-50'}`}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {importType && (
                <div className="space-y-4">
                  {/* Download template */}
                  <div className="bg-white border border-samsic-sable-50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-samsic-sable-30 flex items-center justify-center flex-shrink-0">
                        <Download size={18} className="text-samsic-marine" />
                      </div>
                      <div>
                        <p className="text-sm font-body font-bold text-samsic-marine mb-1">
                          Étape 1 · Télécharger le template CSV
                        </p>
                        <p className="text-xs text-samsic-marine-50 font-body mb-3">
                          Le template contient les colonnes requises et des exemples pré-remplis avec vos données SAMSIC réelles.
                        </p>
                        <button
                          onClick={() => downloadTemplate(importType)}
                          className="flex items-center gap-2 bg-samsic-marine text-white px-4 py-2 text-xs font-body font-bold hover:bg-samsic-marine-80 transition-colors"
                        >
                          <Download size={13} />
                          template_{importType === 'employees' ? 'employes' : 'clients'}.csv
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div className="bg-white border-2 border-dashed border-samsic-sable-50 p-8 text-center hover:border-samsic-marine transition-colors">
                    <Upload size={32} className="text-samsic-marine-50 mx-auto mb-3" />
                    <p className="text-sm font-body font-bold text-samsic-marine mb-1">
                      Étape 2 · Glissez votre fichier CSV ici
                    </p>
                    <p className="text-xs text-samsic-marine-50 font-body mb-4">ou cliquez pour parcourir</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 bg-samsic-bleu text-white px-5 py-2.5 text-xs font-body font-bold cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <FileText size={14} />
                      Choisir un fichier CSV
                    </label>
                    <p className="text-xs text-samsic-marine-50 font-body mt-3">Formats acceptés : .csv · Taille max: 5 MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && parsed && (
            <div className="space-y-4">
              {/* File info */}
              <div className="bg-white border border-samsic-sable-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-samsic-marine-50" />
                  <div>
                    <p className="text-sm font-body font-bold text-samsic-marine">{fileName}</p>
                    <p className="text-xs text-samsic-marine-50 font-body">
                      {parsed.rows.length} ligne{parsed.rows.length > 1 ? 's' : ''} · {validRows.length} valides · {errorRows.length} erreurs
                    </p>
                  </div>
                </div>
                <button onClick={reset} className="flex items-center gap-1 text-xs text-samsic-marine-50 hover:text-samsic-marine font-body">
                  <X size={13} />
                  Changer
                </button>
              </div>

              {/* Errors */}
              {parsed.errors.length > 0 && (
                <div className="bg-[#FFEBEE] border border-[#C62828] p-4">
                  <p className="text-xs font-body font-bold text-[#C62828] mb-2 flex items-center gap-2">
                    <AlertTriangle size={13} />
                    {parsed.errors.length} erreur{parsed.errors.length > 1 ? 's' : ''} détectée{parsed.errors.length > 1 ? 's' : ''}
                  </p>
                  {parsed.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs font-body text-[#C62828]">· {err}</p>
                  ))}
                  {parsed.errors.length > 5 && (
                    <p className="text-xs font-body text-[#C62828] mt-1">... et {parsed.errors.length - 5} autres</p>
                  )}
                </div>
              )}

              {/* Preview table */}
              <div className="bg-white border border-samsic-sable-50 overflow-hidden">
                <div className="px-5 py-3 border-b border-samsic-sable-50 flex items-center justify-between">
                  <h3 className="text-sm font-body font-bold text-samsic-marine">Aperçu des données</h3>
                  <span className="text-xs text-samsic-marine-50 font-body">10 premières lignes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="bg-samsic-marine text-white">
                        <th className="px-3 py-2 text-left font-semibold text-xs">Statut</th>
                        {parsed.headers.map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 10).map((row, i) => {
                        const status = parsed.rowStatuses[i];
                        return (
                          <tr key={i} className={`border-t border-samsic-sable-30 ${status === 'error' ? 'bg-[#FFEBEE]' : i % 2 === 0 ? 'bg-white' : 'bg-samsic-sable-30/40'}`}>
                            <td className="px-3 py-2">
                              {status === 'valid'
                                ? <CheckCircle2 size={13} className="text-[#2E7D32]" />
                                : <AlertTriangle size={13} className="text-[#C62828]" />}
                            </td>
                            {parsed.headers.map(h => (
                              <td key={h} className="px-3 py-2 text-samsic-marine">{row[h]}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2 border border-samsic-sable-50 text-xs font-body font-semibold text-samsic-marine hover:bg-samsic-sable-30 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Retour
                </button>
                <button
                  onClick={handleImport}
                  disabled={validRows.length === 0 || isImporting}
                  className={`flex items-center gap-2 px-6 py-2.5 text-xs font-body font-bold transition-colors ${
                    validRows.length > 0 && !isImporting
                      ? 'bg-samsic-marine text-white hover:bg-samsic-marine-80'
                      : 'bg-samsic-sable-50 text-samsic-marine-50 cursor-not-allowed'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                      Import en cours…
                    </>
                  ) : (
                    <>
                      Importer {validRows.length} ligne{validRows.length > 1 ? 's' : ''}
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && importDone && (
            <div className="space-y-4">
              {/* Success */}
              <div className="bg-[#F1F8E9] border border-[#2E7D32] p-8 text-center">
                <CheckCircle2 size={48} className="text-[#2E7D32] mx-auto mb-4" />
                <h2 className="text-xl font-body font-black text-[#1B5E20] mb-2">
                  Import réussi !
                </h2>
                <p className="text-sm font-body text-[#2E7D32]">
                  {validRows.length} {importType === 'employees' ? 'employé' : 'client'}{validRows.length > 1 ? 's' : ''} importé{validRows.length > 1 ? 's' : ''} avec succès
                </p>
                {errorRows.length > 0 && (
                  <p className="text-xs font-body text-[#F57F17] mt-2">
                    {errorRows.length} ligne{errorRows.length > 1 ? 's' : ''} ignorée{errorRows.length > 1 ? 's' : ''} (erreurs de format)
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white border border-samsic-sable-50 p-5">
                <h3 className="text-sm font-body font-bold text-samsic-marine mb-4">Récapitulatif</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-body font-black text-[#2E7D32]">{validRows.length}</p>
                    <p className="text-xs font-body text-samsic-marine-50">Importés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-body font-black text-[#C62828]">{errorRows.length}</p>
                    <p className="text-xs font-body text-samsic-marine-50">Rejetés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-body font-black text-samsic-marine">{parsed?.rows.length}</p>
                    <p className="text-xs font-body text-samsic-marine-50">Total lignes</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-5 py-2.5 border border-samsic-marine text-xs font-body font-bold text-samsic-marine hover:bg-samsic-sable-30 transition-colors"
                >
                  <Upload size={13} />
                  Nouvel import
                </button>
                <a
                  href={importType === 'employees' ? '/employees' : '/clients'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-samsic-marine text-white text-xs font-body font-bold hover:bg-samsic-marine-80 transition-colors"
                >
                  Voir les {importType === 'employees' ? 'employés' : 'clients'}
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
