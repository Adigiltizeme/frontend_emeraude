import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const LegalNotices = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>Mentions Légales</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Informations légales concernant l'éditeur et l'hébergeur de la plateforme.
        </p>
      </div>

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: '1.8' }}>
        <h3>1. Éditeur de la Plateforme</h3>
        <p><strong>Nom de l'entreprise :</strong> Emeraude Africa (Société fictive pour démo MVP)</p>
        <p><strong>Forme Juridique :</strong> Société Anonyme (SA)</p>
        <p><strong>Siège Social :</strong> Dakar, Sénégal</p>
        <p><strong>Capital Social :</strong> 10 000 000 FCFA</p>
        <p><strong>Contact :</strong> contact@emeraude-africa.com</p>
        
        <h3>2. Directeur de la Publication</h3>
        <p>Le Directeur de la publication est M. Abdarrahman Samassa.</p>
        
        <h3>3. Hébergement</h3>
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong>Frontend :</strong> Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.</li>
          <li><strong>Backend :</strong> Railway Corp., San Francisco, CA, États-Unis.</li>
        </ul>
        
        <h3>4. Agrément et Régulation</h3>
        <p>Dans le cadre du lancement en production finale, Emeraude Africa sera soumise à l'agrément de l'Autorité des Marchés Financiers (AMF) ou des autorités de régulation locales (CREPMF) compétentes pour le financement participatif (Crowdfunding).</p>
      </section>
    </div>
  );
};

export default LegalNotices;
