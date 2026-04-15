const BASE = 'http://127.0.0.1:3000/api';
const J = { 'Content-Type': 'application/json' };

async function post(path, body, token) {
  const h = { ...J }; if (token) h['Authorization'] = `Bearer ${token}`;
  return (await fetch(`${BASE}${path}`, { method: 'POST', headers: h, body: JSON.stringify(body) })).json();
}
async function patch(path, body, token) {
  return (await fetch(`${BASE}${path}`, { method: 'PATCH', headers: { ...J, Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })).json();
}
async function get(path, token) {
  return (await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })).json();
}

async function seed() {
  console.log('=== SEEDING ===');

  // Admin
  const admin = await post('/auth/register', { email: 'admin@davivienda.com', password: 'Admin123!', fullName: 'Jorge Administrador', role: 'ADMIN' });
  const T = admin.accessToken;
  console.log('Admin:', admin.user.email);

  // 10 Clients
  const clientData = [
    { email: 'carlos.gomez@gmail.com', fullName: 'Carlos Gómez' },
    { email: 'maria.lopez@gmail.com', fullName: 'María López' },
    { email: 'andres.martinez@gmail.com', fullName: 'Andrés Martínez' },
    { email: 'laura.rodriguez@gmail.com', fullName: 'Laura Rodríguez' },
    { email: 'juan.perez@gmail.com', fullName: 'Juan Pérez' },
    { email: 'diana.castro@gmail.com', fullName: 'Diana Castro' },
    { email: 'pedro.sanchez@gmail.com', fullName: 'Pedro Sánchez' },
    { email: 'camila.torres@gmail.com', fullName: 'Camila Torres' },
    { email: 'santiago.ruiz@gmail.com', fullName: 'Santiago Ruiz' },
    { email: 'valentina.mora@gmail.com', fullName: 'Valentina Mora' },
  ];
  const clients = [];
  for (const c of clientData) {
    const r = await post('/auth/register', { ...c, password: 'Client123!' });
    clients.push(r.user);
  }
  console.log('Clients:', clients.length);

  // Plans
  const bronze = await post('/plans', { name: 'Plan Bronce', type: 'BRONZE', price: 50000, description: 'Plan básico para emprendedores', features: ['Acceso básico', 'Soporte email', '1 usuario', 'Reportes mensuales'], durationDays: 30 }, T);
  const silver = await post('/plans', { name: 'Plan Plata', type: 'SILVER', price: 120000, description: 'Plan intermedio con 10% descuento', features: ['Acceso completo', 'Soporte prioritario', '5 usuarios', 'Reportes semanales', 'API básica'], durationDays: 60 }, T);
  const gold = await post('/plans', { name: 'Plan Oro', type: 'GOLD', price: 250000, description: 'Plan premium con 25% descuento', features: ['Acceso ilimitado', 'Soporte 24/7', 'Usuarios ilimitados', 'Reportes en tiempo real', 'API completa', 'Gerente dedicado'], durationDays: 90 }, T);
  console.log('Plans:', bronze.name, silver.name, gold.name);

  // Subscriptions: 4 bronze, 3 silver, 3 gold
  const planIds = [bronze.id, bronze.id, bronze.id, bronze.id, silver.id, silver.id, silver.id, gold.id, gold.id, gold.id];
  const subs = [];
  for (let i = 0; i < 10; i++) {
    const s = await post('/subscriptions', { userId: clients[i].id, planId: planIds[i] }, T);
    subs.push(s);
  }
  console.log('Subscriptions:', subs.length);

  // Generate invoices for all
  const invoices = [];
  for (const s of subs) {
    const inv = await post('/subscriptions/payment', { subscriptionId: s.id }, T);
    invoices.push(inv);
  }
  // Extra invoices for some clients
  for (let i = 0; i < 5; i++) {
    const inv = await post('/subscriptions/payment', { subscriptionId: subs[i].id }, T);
    invoices.push(inv);
  }
  console.log('Invoices:', invoices.length);

  // Mark 6 as PAID
  for (let i = 0; i < 6; i++) {
    await patch(`/invoices/${invoices[i].id}/pay`, {}, T);
  }
  // Mark 3 as OVERDUE
  for (let i = 10; i < 13; i++) {
    await patch(`/invoices/${invoices[i].id}/overdue`, {}, T);
  }
  console.log('6 PAID, 3 OVERDUE, rest PENDING');

  // Expire 2 subs, cancel 1
  await patch(`/subscriptions/${subs[7].id}/status`, { status: 'EXPIRED' }, T);
  await patch(`/subscriptions/${subs[8].id}/status`, { status: 'EXPIRED' }, T);
  await patch(`/subscriptions/${subs[9].id}/status`, { status: 'CANCELLED' }, T);
  console.log('2 EXPIRED, 1 CANCELLED');

  // Final report
  const rep = await get('/reports', T);
  console.log('\n=== REPORT ===');
  console.log('Active:', rep.totalActiveSubscriptions, '| Expired:', rep.totalExpiredSubscriptions, '| Cancelled:', rep.totalCancelledSubscriptions);
  console.log('Revenue:', rep.totalRevenue);
  console.log('=== DONE ===');
}
seed().catch(console.error);
