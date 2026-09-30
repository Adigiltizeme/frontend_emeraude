import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Briefcase, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>Erreur de chargement des données.</div>;
  }

  const COLORS = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#64748b'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--color-primary-600)' }}>
            Levée : {payload[0].value.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h1 style={{ color: 'var(--color-primary-900)', marginBottom: '2rem' }}>Tableau de Bord Analytique</h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Fonds Levés</p>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>{stats.totalRaised.toLocaleString('fr-FR')} FCFA</h2>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: '#4f46e5' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Utilisateurs</p>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>{stats.totalUsers} inscrits</h2>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Briefcase size={32} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Projets Actifs</p>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>{stats.totalProjects} projets</h2>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Evolution Chart */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '2rem', color: '#1e293b' }}>Évolution des Investissements</h3>
          <div style={{ height: '350px' }}>
            {stats.investmentsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.investmentsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value: any) => `${value / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                Aucune donnée d'investissement disponible.
              </div>
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '2rem', color: '#1e293b' }}>Répartition des Projets (Statut)</h3>
          <div style={{ height: '350px' }}>
            {stats.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.projectsByStatus.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Projets']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                Aucun projet enregistré.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
