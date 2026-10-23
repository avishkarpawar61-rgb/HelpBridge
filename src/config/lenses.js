/**
 * Domain Lens Configuration
 * HelpBridge AI is architected around pluggable domain lenses.
 * Currently active: Medical Lens.
 * Civic and Disaster lenses are defined with matching schema hooks for future expansion.
 */

export const DOMAIN_LENSES = {
  medical: {
    id: 'medical',
    name: 'Medical & Healthcare',
    badge: 'Active — Polished',
    isAvailable: true,
    tagline: 'Messy prescriptions, lab tests & symptoms → Verified Care Plan & ER Handoff Card',
    icon: 'fa-solid fa-notes-medical',
    primaryColor: '#0d9488', // Teal
    emergencyContact: {
      ambulance: '108',
      nationalEmergency: '112',
      mentalHealthKiran: '1800-599-0019',
      teleManas: '14416',
    },
    urgencyLevels: [
      { id: 'EMERGENCY', label: 'Immediate Emergency', color: '#ef4444', bg: '#fee2e2' },
      { id: 'URGENT_24H', label: 'Urgent Care (Within 24 Hours)', color: '#f59e0b', bg: '#fef3c7' },
      { id: 'SOON_THIS_WEEK', label: 'Consult This Week', color: '#0284c7', bg: '#e0f2fe' },
      { id: 'ROUTINE', label: 'Routine Care / Self-Care', color: '#10b981', bg: '#d1fae5' },
      { id: 'INSUFFICIENT_INFO', label: 'Insufficient Information', color: '#6b7280', bg: '#f3f4f6' }
    ],
    handoffDocumentName: 'Emergency Handoff Card (20-Sec ER Summary)'
  },
  civic: {
    id: 'civic',
    name: 'Civic & Municipal Grievance',
    badge: 'Expansion Lens (Architecture Ready)',
    isAvailable: false,
    tagline: 'Broken roads, sewage leaks & utility disruptions → Ward Officer Action Dossier',
    icon: 'fa-solid fa-city',
    primaryColor: '#6366f1',
    emergencyContact: { helpline: '1916' }
  },
  disaster: {
    id: 'disaster',
    name: 'Disaster & Relief Triage',
    badge: 'Expansion Lens (Architecture Ready)',
    isAvailable: false,
    tagline: 'Flood reports, trapped citizens & shortages → Rescue Coordinator Manifest',
    icon: 'fa-solid fa-triangle-exclamation',
    primaryColor: '#ea580c',
    emergencyContact: { ndrf: '1078', national: '112' }
  }
};

export const ACTIVE_LENS_ID = 'medical';
export const getActiveLens = () => DOMAIN_LENSES[ACTIVE_LENS_ID];
