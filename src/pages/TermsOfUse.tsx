import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const TermsOfUse = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Conditions GÃ©nÃ©rales d'Utilisation et de Vente (CGU/CGV)</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          RÃ¨gles d'utilisation de la plateforme et cadre lÃ©gal des investissements.
        </p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Objet</h3>
        <p>Les prÃ©sentes Conditions GÃ©nÃ©rales rÃ©gissent l'accÃ¨s et l'utilisation de la plateforme de financement participatif immobilier Emeraude Africa. En utilisant nos services, vous acceptez sans rÃ©serve les prÃ©sentes CGU/CGV.</p>

        <h3>2. AccÃ¨s aux Services</h3>
        <p>L'accÃ¨s aux projets d'investissement nÃ©cessite la crÃ©ation d'un compte utilisateur et la fourniture de documents d'identitÃ© valides (processus KYC - Know Your Customer), conformÃ©ment Ã  la lÃ©gislation sur la lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT).</p>

        <h3>3. Paiements et SÃ©curisation des Fonds</h3>
        <p>Les transactions financiÃ¨res sont assurÃ©es par des prestataires de paiement sÃ©curisÃ©s (Stripe, Moneroo, Paymob). Les fonds investis sont cantonnÃ©s dans un compte dÃ©diÃ© jusqu'Ã  la clÃ´ture de la levÃ©e de fonds. Si l'objectif de collecte n'est pas atteint ou si le projet est annulÃ©, les investisseurs sont intÃ©gralement remboursÃ©s, sans frais supplÃ©mentaires.</p>

        <h3>4. Avertissement sur les Risques</h3>
        <p>L'investissement immobilier et le financement participatif comportent des risques inhÃ©rents :</p>
        <ul>
          <li><strong>Risque de perte en capital :</strong> Vous pouvez perdre tout ou partie des fonds investis.</li>
          <li><strong>Risque d'illiquiditÃ© :</strong> Les investissements sont bloquÃ©s pendant la durÃ©e du projet (gÃ©nÃ©ralement 12 Ã  36 mois). Il est trÃ¨s difficile, voire impossible, de revendre vos parts avant le terme.</li>
        </ul>
        <p>Nous vous conseillons de ne jamais investir des fonds dont vous pourriez avoir un besoin immÃ©diat et de diversifier vos investissements.</p>

        <h3>5. PropriÃ©tÃ© Intellectuelle</h3>
        <p>L'ensemble du contenu de la plateforme (textes, images, logos, architecture) est protÃ©gÃ© par le droit d'auteur. Toute reproduction non autorisÃ©e est strictement interdite.</p>
      </section>
    </div>
  );
};

export default TermsOfUse;
