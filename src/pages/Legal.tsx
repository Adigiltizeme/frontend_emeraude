import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

const Legal = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <Scale size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>{t('legal.title', 'Mentions LÃ©gales & Conditions')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          {t('legal.subtitle', 'Transparence, sÃ©curitÃ© et conformitÃ© rÃ©glementaire de la plateforme Emeraude Africa.')}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '3rem' }}>
        {/* Section 1 : Mentions LÃ©gales */}
        <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary-800)', marginTop: 0 }}>
            <FileText size={28} /> {t('legal.legalNotices.title', 'Mentions LÃ©gales')}
          </h2>
          <div style={{ color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
            <p><strong>Ã‰diteur de la plateforme :</strong> Emeraude Africa (SociÃ©tÃ© fictive pour dÃ©mo MVP)</p>
            <p><strong>SiÃ¨ge social :</strong> Dakar, SÃ©nÃ©gal</p>
            <p><strong>Contact :</strong> contact@emeraude-africa.com</p>
            <p><strong>HÃ©bergement :</strong> Vercel Inc. (Frontend) & Railway.app (Backend)</p>
            <p><em>Note : Ceci est une version MVP (Minimum Viable Product). La vÃ©ritable structure juridique sera intÃ©grÃ©e lors du passage en production officielle.</em></p>
          </div>
        </section>

        {/* Section 2 : CGU & CGV */}
        <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary-800)', marginTop: 0 }}>
            <ShieldCheck size={28} /> {t('legal.terms.title', 'Conditions GÃ©nÃ©rales d\'Utilisation (CGU) et de Vente (CGV)')}
          </h2>
          <div style={{ color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
            <h3>1. Objet</h3>
            <p>Les prÃ©sentes conditions rÃ©gissent l'utilisation de la plateforme de financement participatif immobilier Emeraude Africa.</p>
            
            <h3>2. Investissements et Paiements</h3>
            <p>Les paiements sont sÃ©curisÃ©s par nos prestataires <strong>Stripe</strong>, <strong>Moneroo</strong> et <strong>Paymob</strong>. Les fonds sont cantonnÃ©s dans l'attente de la validation totale de l'opÃ©ration. En cas d'annulation du projet, les fonds sont intÃ©gralement restituÃ©s selon la mÃ©thode de paiement originale.</p>
            
            <h3>3. Risques</h3>
            <p>Le financement participatif immobilier comporte des risques, notamment un risque de perte totale ou partielle du capital investi, ainsi qu'un risque d'illiquiditÃ©. Investissez uniquement des fonds dont vous n'avez pas un besoin immÃ©diat.</p>

            <h3>4. DonnÃ©es Personnelles (RGPD)</h3>
            <p>Vos donnÃ©es personnelles (KYC, piÃ¨ces d'identitÃ©) sont cryptÃ©es et strictement utilisÃ©es pour se conformer Ã  la lÃ©gislation sur la lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT). Elles ne seront jamais revendues Ã  des tiers.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Legal;
