import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const TermsOfUse = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Conditions Générales d'Utilisation et de Vente (CGU/CGV)</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Règles d'utilisation de la plateforme et cadre légal des investissements.
        </p>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Dernière mise à jour : 6 octobre 2026</p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Objet</h3>
        <p>Les présentes Conditions Générales régissent l'accès et l'utilisation de la plateforme de financement participatif immobilier Emeraude Africa. En utilisant nos services, vous acceptez sans réserve les présentes CGU/CGV.</p>

        <h3>2. Accès aux Services</h3>
        <p>L'accès aux projets d'investissement nécessite la création d'un compte utilisateur et la fourniture de documents d'identité valides (processus KYC - Know Your Customer), conformément à la législation sur la lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT). Un investissement ne peut être réalisé qu'une fois l'identité vérifiée par notre équipe. Le porteur d'un projet ne peut pas investir dans son propre projet.</p>

        <h3>3. Paiements et Sécurisation des Fonds</h3>
        <p>Les paiements en ligne sont assurés par des prestataires agréés : CinetPay, Wave, PayDunya et Flutterwave (Mobile Money, portefeuilles électroniques et cartes), et Stripe (cartes internationales). Selon le moyen de paiement choisi, la plateforme sélectionne automatiquement un prestataire disponible ; l'investisseur peut aussi indiquer son prestataire préféré. Un virement ou un transfert manuel reste possible : l'investissement est alors validé par notre équipe à réception des fonds.</p>
        <p>Un investissement n'est validé qu'après confirmation du paiement directement auprès du prestataire, pour un montant et une devise identiques à ceux de la souscription. Un paiement non finalisé dans un délai de 24 heures expire et l'investissement correspondant est annulé, sans frais. Le montant minimum de souscription est celui indiqué sur la fiche de chaque projet, dans la limite du montant restant à financer.</p>
        <p>Avant chaque investissement, l'investisseur accepte expressément les présentes conditions et l'avertissement sur les risques ; la date de cette acceptation est conservée. Les fonds investis sont cantonnés dans un compte dédié jusqu'à la clôture de la levée de fonds. Si l'objectif de collecte n'est pas atteint ou si le projet est annulé, les investisseurs sont intégralement remboursés, sans frais supplémentaires.</p>

        <h3>4. Avertissement sur les Risques</h3>
        <p>L'investissement immobilier et le financement participatif comportent des risques inhérents :</p>
        <ul>
          <li><strong>Risque de perte en capital :</strong> Vous pouvez perdre tout ou partie des fonds investis.</li>
          <li><strong>Risque d'illiquidité :</strong> Les investissements sont bloqués pendant la durée du projet (généralement 12 à 36 mois). Il est très difficile, voire impossible, de revendre vos parts avant le terme.</li>
        </ul>
        <p>Nous vous conseillons de ne jamais investir des fonds dont vous pourriez avoir un besoin immédiat et de diversifier vos investissements.</p>

        <h3>5. Propriété Intellectuelle</h3>
        <p>L'ensemble du contenu de la plateforme (textes, images, logos, architecture) est protégé par le droit d'auteur. Toute reproduction non autorisée est strictement interdite.</p>
      </section>
    </div>
  );
};

export default TermsOfUse;
