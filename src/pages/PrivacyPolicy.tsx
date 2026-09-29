import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Politique de ConfidentialitÃ© (RGPD)</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Protection de vos donnÃ©es personnelles et respect de votre vie privÃ©e.
        </p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Collecte des DonnÃ©es</h3>
        <p>Lors de votre inscription et de vos investissements, Emeraude Africa collecte les donnÃ©es suivantes :</p>
        <ul>
          <li>DonnÃ©es d'identification (Nom, prÃ©nom, adresse e-mail, numÃ©ro de tÃ©lÃ©phone).</li>
          <li>Documents lÃ©gaux (PiÃ¨ce d'identitÃ©, justificatif de domicile) dans le cadre de nos obligations de vÃ©rification (KYC).</li>
          <li>DonnÃ©es de transaction (Historique d'investissement). Notez que nous ne stockons jamais vos numÃ©ros de carte bancaire (ces derniers sont traitÃ©s directement par nos partenaires Stripe, Moneroo, Paymob).</li>
        </ul>

        <h3>2. FinalitÃ© du Traitement</h3>
        <p>Vos donnÃ©es sont utilisÃ©es exclusivement pour :</p>
        <ul>
          <li>GÃ©rer votre compte et vos investissements.</li>
          <li>GÃ©nÃ©rer vos attestations juridiques et fiscales.</li>
          <li>Se conformer aux obligations lÃ©gales (Lutte contre la fraude et le blanchiment d'argent).</li>
        </ul>

        <h3>3. Partage des DonnÃ©es</h3>
        <p>Vos informations personnelles ne sont jamais vendues Ã  des tiers Ã  des fins commerciales. Elles peuvent Ãªtre transmises uniquement Ã  nos partenaires de paiement (pour valider la transaction) et aux autoritÃ©s compÃ©tentes en cas de rÃ©quisition lÃ©gale.</p>

        <h3>4. DurÃ©e de Conservation</h3>
        <p>ConformÃ©ment Ã  la rÃ©glementation financiÃ¨re, vos donnÃ©es sont conservÃ©es pendant toute la durÃ©e de la relation commerciale, puis archivÃ©es pendant une durÃ©e de 5 ans Ã  des fins de traÃ§abilitÃ© et de preuve.</p>

        <h3>5. Vos Droits</h3>
        <p>ConformÃ©ment aux lois sur la protection des donnÃ©es (notamment le RGPD), vous disposez d'un droit d'accÃ¨s, de rectification, de suppression et de portabilitÃ© de vos donnÃ©es. Pour exercer ce droit, veuillez contacter : privacy@emeraude-africa.com.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
