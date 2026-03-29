'use client';
/**
 * use-samsic-store — Store global persisté en localStorage
 * Permet de persister les modifications démo (fiches + acceptations IA)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CLIENTS_DATA, type ClientData, type ClientPost, type ClientContact } from '@/lib/data/clients-data';
import { EMPLOYEES_DATA, type EmployeeFullProfile } from '@/lib/data/employees-data';

// ─── Types d'actions IA persistées ───────────────────────────────────────────

export interface AcceptedSuggestion {
  id: string;
  type: 'REASSIGN' | 'FILL_SLOT' | 'OPTIMIZE';
  employeeId: string;
  employeeName: string;
  clientId: string;
  clientName: string;
  postName: string;
  date: string;                // YYYY-MM-DD
  acceptedAt: string;          // ISO
  revenueImpact: number;       // €
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface SamsicStore {
  // Data
  employees: EmployeeFullProfile[];
  clients: ClientData[];
  acceptedSuggestions: AcceptedSuggestion[];
  totalRecoveredRevenue: number;

  // Employee actions
  updateEmployee: (id: string, patch: Partial<EmployeeFullProfile>) => void;
  updateEmployeeLanguages: (id: string, languages: EmployeeFullProfile['languages']) => void;
  updateEmployeeSkills: (id: string, skills: EmployeeFullProfile['skills']) => void;
  updateEmployeeAvailability: (id: string, availability: any) => void;
  updateEmployeeTraining: (id: string, trainedPosts: EmployeeFullProfile['trainedPosts']) => void;

  // Client actions
  updateClient: (id: string, patch: Partial<ClientData>) => void;
  updateClientPost: (clientId: string, postIndex: number, patch: Partial<ClientPost>) => void;
  addClientPost: (clientId: string, post: ClientPost) => void;
  removeClientPost: (clientId: string, postIndex: number) => void;
  updateClientContact: (clientId: string, contactIndex: number, patch: Partial<ClientContact>) => void;
  addClientContact: (clientId: string, contact: ClientContact) => void;
  removeClientContact: (clientId: string, contactIndex: number) => void;

  // AI actions
  acceptSuggestion: (suggestion: AcceptedSuggestion) => void;
  rejectSuggestion: (id: string) => void;

  // Reset
  resetToDefaults: () => void;
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useSamsicStore = create<SamsicStore>()(
  persist(
    (set, get) => ({
      employees: EMPLOYEES_DATA,
      clients: CLIENTS_DATA,
      acceptedSuggestions: [],
      totalRecoveredRevenue: 0,

      // ── Employee updates ──
      updateEmployee: (id, patch) =>
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, ...patch } : e),
        })),

      updateEmployeeLanguages: (id, languages) =>
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, languages } : e),
        })),

      updateEmployeeSkills: (id, skills) =>
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, skills } : e),
        })),

      updateEmployeeAvailability: (id, availability) =>
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, availability } : e),
        })),

      updateEmployeeTraining: (id, trainedPosts) =>
        set(state => ({
          employees: state.employees.map(e => e.id === id ? { ...e, trainedPosts } : e),
        })),

      // ── Client updates ──
      updateClient: (id, patch) =>
        set(state => ({
          clients: state.clients.map(c => c.id === id ? { ...c, ...patch } : c),
        })),

      updateClientPost: (clientId, postIndex, patch) =>
        set(state => ({
          clients: state.clients.map(c => {
            if (c.id !== clientId) return c;
            const posts = [...c.posts];
            posts[postIndex] = { ...posts[postIndex], ...patch };
            return { ...c, posts };
          }),
        })),

      addClientPost: (clientId, post) =>
        set(state => ({
          clients: state.clients.map(c =>
            c.id === clientId ? { ...c, posts: [...c.posts, post] } : c
          ),
        })),

      removeClientPost: (clientId, postIndex) =>
        set(state => ({
          clients: state.clients.map(c => {
            if (c.id !== clientId) return c;
            const posts = c.posts.filter((_, i) => i !== postIndex);
            return { ...c, posts };
          }),
        })),

      updateClientContact: (clientId, contactIndex, patch) =>
        set(state => ({
          clients: state.clients.map(c => {
            if (c.id !== clientId) return c;
            const contacts = [...c.contacts];
            contacts[contactIndex] = { ...contacts[contactIndex], ...patch };
            return { ...c, contacts };
          }),
        })),

      addClientContact: (clientId, contact) =>
        set(state => ({
          clients: state.clients.map(c =>
            c.id === clientId ? { ...c, contacts: [...c.contacts, contact] } : c
          ),
        })),

      removeClientContact: (clientId, contactIndex) =>
        set(state => ({
          clients: state.clients.map(c => {
            if (c.id !== clientId) return c;
            const contacts = c.contacts.filter((_, i) => i !== contactIndex);
            return { ...c, contacts };
          }),
        })),

      // ── AI actions ──
      acceptSuggestion: (suggestion) =>
        set(state => ({
          acceptedSuggestions: [...state.acceptedSuggestions, suggestion],
          totalRecoveredRevenue: state.totalRecoveredRevenue + suggestion.revenueImpact,
          // Update employee hours
          employees: state.employees.map(e => {
            if (e.id !== suggestion.employeeId) return e;
            const newAssigned = e.weeklyAssignedHours + 8; // approx 8h/jour
            return {
              ...e,
              weeklyAssignedHours: newAssigned,
              utilizationGap: Math.max(0, e.weeklyContractHours - newAssigned),
              occupancyRate: Math.min(100, Math.round((newAssigned / e.weeklyContractHours) * 100)),
            };
          }),
        })),

      rejectSuggestion: (id) =>
        set(state => ({
          acceptedSuggestions: state.acceptedSuggestions.filter(s => s.id !== id),
        })),

      resetToDefaults: () =>
        set({
          employees: EMPLOYEES_DATA,
          clients: CLIENTS_DATA,
          acceptedSuggestions: [],
          totalRecoveredRevenue: 0,
        }),
    }),
    {
      name: 'samsic-store-v1',
      partialize: (state) => ({
        employees: state.employees,
        clients: state.clients,
        acceptedSuggestions: state.acceptedSuggestions,
        totalRecoveredRevenue: state.totalRecoveredRevenue,
      }),
    }
  )
);
