// Data simulation utilities for greenhouse monitoring
export const generateEnvironmentData = () => {
  const now = new Date();
  
  // Generate realistic sensor data with some randomness
  const baseTemp = 25;
  const baseHumidity = 60;
  const baseMoisture = 50;
  
  // Add time-based variation (warmer during day, cooler at night)
  const hour = now.getHours();
  const timeVariation = Math.sin((hour - 6) * Math.PI / 12) * 5; // ±5°C variation
  
  // Add random variation
  const randomTemp = (Math.random() - 0.5) * 4; // ±2°C random
  const randomHumidity = (Math.random() - 0.5) * 20; // ±10% random
  const randomMoisture = (Math.random() - 0.5) * 20; // ±10% random
  
  const temperature = Math.round((baseTemp + timeVariation + randomTemp) * 10) / 10;
  const humidity = Math.max(20, Math.min(90, Math.round(baseHumidity + randomHumidity)));
  const soilMoisture = Math.max(10, Math.min(100, Math.round(baseMoisture + randomMoisture)));
  
  return {
    temperature,
    humidity,
    soilMoisture,
    timestamp: now.toISOString()
  };
};

export const generateHistoricalData = (days = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate hourly data for each day
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      const baseTemp = 25 + Math.sin((hour - 6) * Math.PI / 12) * 8;
      const baseHumidity = 60 + Math.sin((hour - 12) * Math.PI / 12) * 15;
      const baseMoisture = 50 + Math.sin((hour - 6) * Math.PI / 12) * 10;
      
      data.push({
        temperature: Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10,
        humidity: Math.max(20, Math.min(90, Math.round(baseHumidity + (Math.random() - 0.5) * 20))),
        soilMoisture: Math.max(10, Math.min(100, Math.round(baseMoisture + (Math.random() - 0.5) * 20))),
        timestamp: timestamp.toISOString()
      });
    }
  }
  
  return data;
};

export const generateWateringSchedules = () => {
  const schedules = [];
  const now = new Date();
  
  // Generate schedules for the past 7 days and next 7 days
  for (let i = -7; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Morning watering (7 AM)
    schedules.push({
      id: `wtr_${i}_morning`,
      zone: 'A',
      time: new Date(date.setHours(7, 0, 0, 0)).toISOString(),
      duration: '15min',
      status: i < 0 ? 'completed' : 'pending'
    });
    
    // Evening watering (6 PM)
    schedules.push({
      id: `wtr_${i}_evening`,
      zone: 'B',
      time: new Date(date.setHours(18, 0, 0, 0)).toISOString(),
      duration: '20min',
      status: i < 0 ? 'completed' : 'pending'
    });
  }
  
  return schedules;
};

export const generatePlantingSchedules = () => {
  const crops = ['Tomato', 'Lettuce', 'Cucumber', 'Pepper', 'Spinach', 'Basil', 'Carrot', 'Broccoli'];
  const statuses = ['seeded', 'growing', 'harvested'];
  const zones = ['A', 'B', 'C', 'D'];
  
  const schedules = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const plantedDate = new Date(now);
    plantedDate.setDate(plantedDate.getDate() - Math.floor(Math.random() * 60));
    
    const harvestDate = new Date(plantedDate);
    harvestDate.setDate(harvestDate.getDate() + 60 + Math.floor(Math.random() * 30));
    
    schedules.push({
      id: `plant_${i + 1}`,
      crop: crops[Math.floor(Math.random() * crops.length)],
      plantedDate: plantedDate.toISOString().split('T')[0],
      harvestDate: harvestDate.toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      zone: zones[Math.floor(Math.random() * zones.length)],
      quantity: Math.floor(Math.random() * 50) + 10,
      createdAt: now.toISOString()
    });
  }
  
  return schedules;
};

export const generateAlerts = () => {
  const alertTypes = [
    { type: 'High Temperature', message: 'Temperature above 35°C detected' },
    { type: 'Low Moisture', message: 'Soil moisture below 40%' },
    { type: 'High Humidity', message: 'Humidity above 80%' },
    { type: 'Watering Due', message: 'Scheduled watering time approaching' },
    { type: 'Planting Due', message: 'Planting schedule due today' }
  ];
  
  const alerts = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const alertTime = new Date(now);
    alertTime.setHours(alertTime.getHours() - Math.floor(Math.random() * 48));
    
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    alerts.push({
      type: alertType.type,
      message: alertType.message,
      timestamp: alertTime.toISOString(),
      read: Math.random() > 0.5
    });
  }
  
  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
