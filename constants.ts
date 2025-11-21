import { Leak, LeakStatus } from './types';

// Center of Querétaro City
export const MAP_CENTER: [number, number] = [20.5888, -100.3899];
export const MAP_ZOOM = 13;

const ZONES = ['Centro Histórico', 'Juriquilla', 'El Pueblito', 'Candiles', 'Milenio III', 'Álamos'];
const STREETS = ['Av. Constituyentes', 'Bernardo Quintana', 'Av. 5 de Febrero', 'Zaragoza', 'Pasteur', 'Corregidora'];

// Generate realistic mock data
export const generateMockLeaks = (count: number): Leak[] => {
  const leaks: Leak[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random position around center
    const lat = MAP_CENTER[0] + (Math.random() - 0.5) * 0.1;
    const lng = MAP_CENTER[1] + (Math.random() - 0.5) * 0.12;
    
    const statuses = [LeakStatus.ACTIVE, LeakStatus.REPAIRING, LeakStatus.REPAIRED];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const reportedDate = new Date();
    reportedDate.setDate(reportedDate.getDate() - Math.floor(Math.random() * 14)); // Last 2 weeks
    
    let repairedDate;
    if (status === LeakStatus.REPAIRED) {
      repairedDate = new Date(reportedDate);
      repairedDate.setHours(repairedDate.getHours() + Math.floor(Math.random() * 48) + 4); // 4-52 hours to repair
    }

    leaks.push({
      id: `LK-${1000 + i}`,
      lat,
      lng,
      status,
      address: `${STREETS[Math.floor(Math.random() * STREETS.length)]} #${Math.floor(Math.random() * 500)}`,
      zone: ZONES[Math.floor(Math.random() * ZONES.length)],
      description: `Reported water leak on the sidewalk. ${Math.random() > 0.5 ? 'Significant flow.' : 'Minor dripping.'}`,
      reporterName: `Citizen ${i + 1}`,
      severity: Math.random() > 0.7 ? 'High' : (Math.random() > 0.4 ? 'Medium' : 'Low'),
      reportedDate: reportedDate.toISOString(),
      repairedDate: repairedDate?.toISOString(),
      imageUrl: `https://picsum.photos/300/200?random=${i}`
    });
  }
  return leaks;
};

export const MOCK_LEAKS = generateMockLeaks(45);
