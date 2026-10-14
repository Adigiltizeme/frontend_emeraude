import { useCallback, useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from './useLiveRefresh';

export interface PortfolioPosition {
  projectId: string;
  title: string;
  image: string | null;
  projectStatus: string;
  returnRate: number;
  duration: number;
  invested: number;
  pending: number;
  incomeReceived: number;
  capitalRepaid: number;
  upcoming: number;
  state: 'ACTIVE' | 'PENDING' | 'CLOSED';
}

export interface PortfolioTransaction {
  date: string;
  kind: 'INVESTMENT' | 'PAYMENT' | 'REFUND' | 'INCOME' | 'CAPITAL';
  projectId: string;
  project: string;
  amount: number;
  status?: string;
  reference?: string | null;
  period?: string | null;
}

export interface Portfolio {
  summary: { investedActive: number; totalInvested: number; incomeReceived: number; capitalRepaid: number; upcoming: number; activeCount: number; closedCount: number };
  hasPayoutAccount: boolean;
  positions: PortfolioPosition[];
  upcoming: { projectId: string; project: string; amount: number; type: string; period: string | null; scheduledAt: string | null }[];
  transactions: PortfolioTransaction[];
}

/** Portefeuille de l'investisseur (calculé par l'API) : rechargé à chaque événement le concernant et au retour sur l'onglet. */
export function usePortfolio() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/portfolio`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setPortfolio(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);
  useLiveRefresh(refresh, 15_000);
  useEffect(() => {
    if (!socket) return;
    const events = ['notification.new', 'investment.updated', 'payment.updated'];
    events.forEach((e) => socket.on(e, refresh));
    return () => { events.forEach((e) => socket.off(e, refresh)); };
  }, [socket, refresh]);

  return { portfolio, refresh };
}
