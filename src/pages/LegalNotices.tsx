import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const LegalNotices = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Mentions LÃ©gales</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Informations lÃ©gales concernant l'Ã©diteur et l'hÃ©bergeur de la plateforme.
        </p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Ã‰diteur de la Plateforme</h3>
        <p><strong>Nom de l'entreprise :</strong> Emeraude Africa (SociÃ©tÃ© fictive pour dÃ©mo MVP)</p>
        <p><strong>Forme Juridique :</strong> SociÃ©tÃ© Anonyme (SA)</p>
        <p><strong>SiÃ¨ge Social :</strong> Dakar, SÃ©nÃ©gal</p>
        <p><strong>Capital Social :</strong> 10 000 000 FCFA</p>
        <p><strong>Contact :</strong> contact@emeraude-africa.com</p>
        
        <h3>2. Directeur de la Publication</h3>
        <p>Le Directeur de la publication est M. Abdarrahman Samassa.</p>
        
        <h3>3. HÃ©bergement</h3>
        <p>Le site est hÃ©bergÃ© par :</p>
        <ul>
          <li><strong>Frontend :</strong> Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, Ã‰tats-Unis.</li>
          <li><strong>Backend :</strong> Railway Corp., San Francisco, CA, Ã‰tats-Unis.</li>
        </ul>
        
        <h3>4. AgrÃ©ment et RÃ©gulation</h3>
        <p>Dans le cadre du lancement en production finale, Emeraude Africa sera soumise Ã  l'agrÃ©ment de l'AutoritÃ© des MarchÃ©s Financiers (AMF) ou des autoritÃ©s de rÃ©gulation locales (CREPMF) compÃ©tentes pour le financement participatif (Crowdfunding).</p>
      </section>
    </div>
  );
};

export default LegalNotices;
