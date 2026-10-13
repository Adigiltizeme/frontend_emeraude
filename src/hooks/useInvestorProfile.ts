import { useCallback, useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';

export type FragilityReason = 'KNOWLEDGE' | 'CONCENTRATION' | 'LOSS_CAPACITY';

export interface InvestorProfile {
  status: 'MISSING' | 'EXPIRED' | 'VALID';
  completedAt: string | null;
  expiresAt: string | null;
  answers: Record<string, string> | null;
  result: { score: number; maxScore: number; fragile: boolean; reasons: FragilityReason[] } | null;
}

/** Profil investisseur de l'utilisateur connecté (calculé par l'API, qui fait autorité). */
export function useInvestorProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me/investor-profile`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setProfile(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  return { profile, loading, refresh, setProfile };
}
