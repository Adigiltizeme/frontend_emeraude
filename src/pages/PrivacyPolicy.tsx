import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Politique de Confidentialité (RGPD)</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Protection de vos données personnelles et respect de votre vie privée.
        </p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Collecte des Données</h3>
        <p>Lors de votre inscription et de vos investissements, Emeraude Africa collecte les données suivantes :</p>
        <ul>
          <li>Données d'identification (Nom, prénom, adresse e-mail, numéro de téléphone).</li>
          <li>Documents légaux (Pièce d'identité, justificatif de domicile) dans le cadre de nos obligations de vérification (KYC).</li>
          <li>Données de transaction (Historique d'investissement). Notez que nous ne stockons jamais vos numéros de carte bancaire (ces derniers sont traités directement par nos partenaires Stripe, Moneroo, Paymob).</li>
        </ul>

        <h3>2. Finalité du Traitement</h3>
        <p>Vos données sont utilisées exclusivement pour :</p>
        <ul>
          <li>Gérer votre compte et vos investissements.</li>
          <li>Générer vos attestations juridiques et fiscales.</li>
          <li>Se conformer aux obligations légales (Lutte contre la fraude et le blanchiment d'argent).</li>
        </ul>

        <h3>3. Partage des Données</h3>
        <p>Vos informations personnelles ne sont jamais vendues à des tiers à des fins commerciales. Elles peuvent être transmises uniquement à nos partenaires de paiement (pour valider la transaction) et aux autorités compétentes en cas de réquisition légale.</p>

        <h3>4. Durée de Conservation</h3>
        <p>Conformément à la réglementation financière, vos données sont conservées pendant toute la durée de la relation commerciale, puis archivées pendant une durée de 5 ans à des fins de traçabilité et de preuve.</p>

        <h3>5. Vos Droits</h3>
        <p>Conformément aux lois sur la protection des données (notamment le RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ce droit, veuillez contacter : privacy@emeraude-africa.com.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
