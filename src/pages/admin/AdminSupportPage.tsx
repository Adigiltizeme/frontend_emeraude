
import { AdminSupport } from '../../components/support/AdminSupport';

const AdminSupportPage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>Support Client</h1>
      </div>
      <AdminSupport />
    </div>
  );
};

export default AdminSupportPage;
