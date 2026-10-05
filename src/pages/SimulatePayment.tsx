import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const SimulatePayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const gateway = searchParams.get('gateway');
  const amount = searchParams.get('amount');
  const investmentId = searchParams.get('investmentId');

  const handleSimulateSuccess = async () => {
    setLoading(true);
    try {
      // In a real app, the webhook handles this. Since this is a pure simulation, we'll hit the webhook manually.
      // Wait, since we are doing a simulation, we can just redirect to success. 
      // The backend will remain PENDING unless we hit the webhook.
      
      // Hit the webhook manually to simulate the provider calling it
      let webhookUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/webhooks/${gateway?.toLowerCase()}`;
      
      let payload = {};
      if (gateway === 'CINETPAY') {
        payload = { cpm_trans_status: 'ACCEPTED', cpm_trans_id: 'SIM_CINET_' + investmentId };
      } else if (gateway === 'PAYDUNYA') {
        payload = { status: 'completed', hash: 'SIM_PAYDUNYA_' + investmentId };
      } else if (gateway === 'Paymob') {
        payload = { obj: { success: true, id: 'SIM_PAYMOB_' + investmentId } };
      } else if (gateway === 'Stripe') {
        payload = { type: 'checkout.session.completed', data: { object: { id: 'SIM_STRIPE_' + investmentId } } };
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Redirect to dashboard
      navigate('/mon-compte?success=true&simulated=true');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la simulation du webhook');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <ShieldAlert size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
      <h1 style={{ color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>Simulation de Paiement : {gateway}</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Vous Ãªtes en mode "Sandbox". Aucune clÃ© API rÃ©elle n'est configurÃ©e pour {gateway}.
      </p>

      <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
        <h3 style={{ marginTop: 0 }}>DÃ©tails de la transaction</h3>
        <p><strong>Montant :</strong> {Number(amount).toLocaleString()} FCFA</p>
        <p><strong>ID Investissement :</strong> {investmentId}</p>
        <p><strong>Passerelle :</strong> {gateway}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={() => navigate('/mon-compte?canceled=true')} className="btn btn-outline" disabled={loading}>
          Annuler le paiement
        </button>
        <button onClick={handleSimulateSuccess} className="btn btn-primary" disabled={loading}>
          {loading ? 'Validation en cours...' : 'Simuler un succÃ¨s'}
        </button>
      </div>
    </div>
  );
};

export default SimulatePayment;
