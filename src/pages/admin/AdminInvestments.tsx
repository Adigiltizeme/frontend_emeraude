import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef3c7', color: '#d97706' },
  VALIDATED: { bg: '#dcfce7', color: '#16a34a' },
  CONFIRMED: { bg: '#dcfce7', color: '#16a34a' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626' },
  CANCELLED: { bg: '#f1f5f9', color: '#475569' },
  REFUND_PENDING: { bg: '#ffedd5', color: '#c2410c' },
  REFUNDED: { bg: '#e0e7ff', color: '#4338ca' },
};

const AdminInvestments = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/investments`, { headers: authHeaders(token) });
      if (res.ok) setInvestments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Liste : temps réel (nouvel investissement, paiement confirmé) + filet de sécurité toutes les 15 s.
  useEffect(() => {
    if (!socket) return;
    socket.on('investment.new', fetchInvestments);
    socket.on('investment.updated', fetchInvestments);
    return () => {
      socket.off('investment.new', fetchInvestments);
      socket.off('investment.updated', fetchInvestments);
    };
  }, [socket, fetchInvestments]);
  useLiveRefresh(fetchInvestments, 15_000);

  const updateStatus = async (id: string, newStatus: 'VALIDATED' | 'REJECTED') => {
    if (!window.confirm(t(newStatus === 'VALIDATED' ? 'admin.investments.confirmValidate' : 'admin.investments.confirmReject'))) return;
    try {
      const res = await fetch(`${API_URL}/investments/${id}/status`, {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) alert(t('admin.investments.error'));
      fetchInvestments();
    } catch (err) {
      console.error(err);
      alert(t('admin.investments.error'));
    }
  };

  /** Remboursement effectué hors plateforme (virement, Mobile Money) : l'admin en saisit la référence. */
  const confirmRefund = async (id: string) => {
    const reference = window.prompt(t('admin.investments.refundPrompt'))?.trim();
    if (!reference) return;
    const res = await fetch(`${API_URL}/investments/${id}/refund`, {
      method: 'PUT',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    alert(res.ok ? t('admin.investments.refundDone') : t('admin.investments.error'));
    fetchInvestments();
  };

  const renderStatus = (status: string) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.CANCELLED;
    return (
      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: style.bg, color: style.color, fontSize: '0.85rem', fontWeight: 'bold' }}>
        {t(`admin.status.${status}`, { defaultValue: status })}
      </span>
    );
  };

  const renderPayment = (inv: any) => {
    const last = inv.payments?.[0];
    if (!last) return <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('admin.investments.manual')}</span>;
    return (
      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
        <div style={{ fontWeight: 600 }}>{last.provider} · {t(`payment.methods.${last.method}`, { defaultValue: last.method })}</div>
        <div>{t(`admin.payment.${last.status}`, { defaultValue: last.status })}</div>
        <div style={{ color: '#94a3b8' }}>{last.reference}</div>
      </div>
    );
  };

  const th = { padding: '1rem', color: '#475569', fontWeight: 600 } as const;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary-900)', margin: 0, marginBottom: '2rem' }}>{t('admin.investments.title')}</h1>

      {loading ? (
        <p>{t('admin.investments.loading')}</p>
      ) : investments.length === 0 ? (
        <p>{t('admin.investments.empty')}</p>
      ) : (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={th}>{t('admin.investments.colInvestor')}</th>
                  <th style={th}>{t('admin.investments.colProject')}</th>
                  <th style={th}>{t('admin.investments.colAmount')}</th>
                  <th style={th}>{t('admin.investments.colDate')}</th>
                  <th style={th}>{t('admin.investments.colPayment')}</th>
                  <th style={th}>{t('admin.investments.colStatus')}</th>
                  <th style={{ ...th, textAlign: 'right' }}>{t('admin.investments.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{inv.user.firstName} {inv.user.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{inv.user.email}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{inv.user.phone}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500 }}>{inv.project.title}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>{formatMoney(inv.amount, i18n.language, inv.currency)}</td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{new Date(inv.createdAt).toLocaleDateString(i18n.language)}</td>
                    <td style={{ padding: '1rem' }}>{renderPayment(inv)}</td>
                    <td style={{ padding: '1rem' }}>{renderStatus(inv.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {inv.status === 'REFUND_PENDING' && (
                        <button onClick={() => confirmRefund(inv.id)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>
                          {t('admin.investments.refund')}
                        </button>
                      )}
                      {inv.status === 'REFUNDED' && inv.refundReference && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{inv.refundReference}</span>
                      )}
                      {inv.status === 'PENDING' && !inv.payments?.length && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => updateStatus(inv.id, 'VALIDATED')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <CheckCircle size={16} /> {t('admin.investments.validate')}
                          </button>
                          <button
                            onClick={() => updateStatus(inv.id, 'REJECTED')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <XCircle size={16} /> {t('admin.investments.reject')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
