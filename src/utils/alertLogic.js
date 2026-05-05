// Alert logic for monitoring greenhouse conditions
export const checkTemperatureAlert = (temperature, threshold = 35) => {
  if (temperature > threshold) {
    return {
      type: 'High Temperature',
      message: `Temperature ${temperature}°C is above threshold of ${threshold}°C`,
      severity: 'high',
      timestamp: new Date().toISOString()
    };
  }
  return null;
};

export const checkHumidityAlert = (humidity, threshold = 80) => {
  if (humidity > threshold) {
    return {
      type: 'High Humidity',
      message: `Humidity ${humidity}% is above threshold of ${threshold}%`,
      severity: 'medium',
      timestamp: new Date().toISOString()
    };
  }
  return null;
};

export const checkMoistureAlert = (moisture, threshold = 40) => {
  if (moisture < threshold) {
    return {
      type: 'Low Moisture',
      message: `Soil moisture ${moisture}% is below threshold of ${threshold}%`,
      severity: 'high',
      timestamp: new Date().toISOString()
    };
  }
  return null;
};

export const checkWateringDue = (schedules) => {
  const now = new Date();
  const dueSchedules = schedules.filter(schedule => {
    const scheduleTime = new Date(schedule.time);
    const timeDiff = scheduleTime - now;
    return timeDiff > 0 && timeDiff <= 30 * 60 * 1000; // 30 minutes
  });
  
  if (dueSchedules.length > 0) {
    return {
      type: 'Watering Due',
      message: `${dueSchedules.length} watering schedule(s) due soon`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      schedules: dueSchedules
    };
  }
  return null;
};

export const checkPlantingDue = (plantingSchedules) => {
  const today = new Date().toISOString().split('T')[0];
  const duePlantings = plantingSchedules.filter(schedule => 
    schedule.plantedDate === today && schedule.status === 'seeded'
  );
  
  if (duePlantings.length > 0) {
    return {
      type: 'Planting Due',
      message: `${duePlantings.length} planting(s) scheduled for today`,
      severity: 'low',
      timestamp: new Date().toISOString(),
      plantings: duePlantings
    };
  }
  return null;
};

export const checkAllAlerts = (environmentData, wateringSchedules, plantingSchedules, settings) => {
  const alerts = [];
  
  // Check environmental conditions
  if (environmentData) {
    const tempAlert = checkTemperatureAlert(environmentData.temperature, settings?.tempLimit);
    if (tempAlert) alerts.push(tempAlert);
    
    const humidityAlert = checkHumidityAlert(environmentData.humidity, settings?.humidityLimit);
    if (humidityAlert) alerts.push(humidityAlert);
    
    const moistureAlert = checkMoistureAlert(environmentData.soilMoisture, settings?.moistureLimit);
    if (moistureAlert) alerts.push(moistureAlert);
  }
  
  // Check watering schedules
  if (wateringSchedules) {
    const wateringAlert = checkWateringDue(wateringSchedules);
    if (wateringAlert) alerts.push(wateringAlert);
  }
  
  // Check planting schedules
  if (plantingSchedules) {
    const plantingAlert = checkPlantingDue(plantingSchedules);
    if (plantingAlert) alerts.push(plantingAlert);
  }
  
  return alerts;
};

export const getAlertSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getAlertIcon = (type) => {
  switch (type) {
    case 'High Temperature':
      return '🌡️';
    case 'Low Moisture':
      return '💧';
    case 'High Humidity':
      return '💨';
    case 'Watering Due':
      return '🚿';
    case 'Planting Due':
      return '🌱';
    default:
      return '⚠️';
  }
};
