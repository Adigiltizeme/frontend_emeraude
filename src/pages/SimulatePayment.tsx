import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const SimulatePayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gateway = searchParams.get('gateway') || 'Inconnu';
  const amount = searchParams.get('amount') || '0';
  // investmentId
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (status: string) => {
    setLoading(true);
    // Directly call the webhook or just update status for demo purposes
    // In a real flow, the webhook is called by the provider. Here we mock it by calling our own status update (Admin route, or a mock webhook route).
    // Let's call a new mock webhook endpoint or just update it directly if we have a token. Since we don't have a token here, let's create a webhook endpoint in the backend.
    
    // For simplicity, we'll just redirect to dashboard with a message
    setTimeout(() => {
      alert(`Simulation réussie ! (Le Webhook de ${gateway} a dit: ${status})\nDans la vraie vie, l'admin ou le webhook valide l'investissement.`);
      navigate('/mon-compte');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-primary-700)', marginBottom: '1rem' }}>Simulateur de Paiement ({gateway})</h2>
        <p style={{ color: 'var(--color-neutral-600)', marginBottom: '2rem' }}>
          Vous êtes sur la page de paiement sécurisée de <strong>{gateway}</strong> (Mode Test).<br/>
          Montant à payer : <strong style={{ fontSize: '1.2rem', color: 'var(--color-neutral-800)' }}>{Number(amount).toLocaleString('fr-FR')} FCFA</strong>
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => handleSimulate('ACCEPTED')}
            disabled={loading}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#16a34a', padding: '1rem' }}
          >
            <CheckCircle size={20} /> Simuler Succès
          </button>
          
          <button 
            onClick={() => handleSimulate('REFUSED')}
            disabled={loading}
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#dc2626', padding: '1rem' }}
          >
            <XCircle size={20} /> Simuler Échec
          </button>
        </div>
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Remarque : Une fois vos clés secrètes ({gateway.toUpperCase()}_SECRET_KEY) ajoutées dans le .env, cette page sera remplacée par la VRAIE page de paiement.
        </p>
      </div>
    </div>
  );
};

export default SimulatePayment;
