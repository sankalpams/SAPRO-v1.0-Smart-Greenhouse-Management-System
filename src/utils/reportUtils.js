// Utility functions for generating reports and analytics
export const calculateAverage = (data, field) => {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
  return Math.round((sum / data.length) * 10) / 10;
};

export const calculateMinMax = (data, field) => {
  if (!data || data.length === 0) return { min: 0, max: 0 };
  const values = data.map(item => item[field] || 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
};

export const generateWeeklyReport = (environmentData, wateringSchedules, plantingSchedules) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter data for the last week
  const weeklyEnvData = environmentData.filter(item => 
    new Date(item.timestamp) >= weekAgo
  );
  
  const weeklyWatering = wateringSchedules.filter(schedule => 
    new Date(schedule.time) >= weekAgo
  );
  
  const weeklyPlanting = plantingSchedules.filter(schedule => 
    new Date(schedule.plantedDate) >= weekAgo.toISOString().split('T')[0]
  );
  
  return {
    period: 'Last 7 days',
    environment: {
      avgTemperature: calculateAverage(weeklyEnvData, 'temperature'),
      avgHumidity: calculateAverage(weeklyEnvData, 'humidity'),
      avgMoisture: calculateAverage(weeklyEnvData, 'soilMoisture'),
      tempRange: calculateMinMax(weeklyEnvData, 'temperature'),
      humidityRange: calculateMinMax(weeklyEnvData, 'humidity'),
      moistureRange: calculateMinMax(weeklyEnvData, 'soilMoisture')
    },
    watering: {
      totalSessions: weeklyWatering.length,
      completedSessions: weeklyWatering.filter(s => s.status === 'completed').length,
      pendingSessions: weeklyWatering.filter(s => s.status === 'pending').length
    },
    planting: {
      totalPlantings: weeklyPlanting.length,
      byStatus: {
        seeded: weeklyPlanting.filter(p => p.status === 'seeded').length,
        growing: weeklyPlanting.filter(p => p.status === 'growing').length,
        harvested: weeklyPlanting.filter(p => p.status === 'harvested').length
      },
      byCrop: weeklyPlanting.reduce((acc, planting) => {
        acc[planting.crop] = (acc[planting.crop] || 0) + 1;
        return acc;
      }, {})
    }
  };
};

export const generateMonthlyReport = (environmentData, wateringSchedules, plantingSchedules) => {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Filter data for the last month
  const monthlyEnvData = environmentData.filter(item => 
    new Date(item.timestamp) >= monthAgo
  );
  
  const monthlyWatering = wateringSchedules.filter(schedule => 
    new Date(schedule.time) >= monthAgo
  );
  
  const monthlyPlanting = plantingSchedules.filter(schedule => 
    new Date(schedule.plantedDate) >= monthAgo.toISOString().split('T')[0]
  );
  
  return {
    period: 'Last 30 days',
    environment: {
      avgTemperature: calculateAverage(monthlyEnvData, 'temperature'),
      avgHumidity: calculateAverage(monthlyEnvData, 'humidity'),
      avgMoisture: calculateAverage(monthlyEnvData, 'soilMoisture'),
      tempRange: calculateMinMax(monthlyEnvData, 'temperature'),
      humidityRange: calculateMinMax(monthlyEnvData, 'humidity'),
      moistureRange: calculateMinMax(monthlyEnvData, 'soilMoisture')
    },
    watering: {
      totalSessions: monthlyWatering.length,
      completedSessions: monthlyWatering.filter(s => s.status === 'completed').length,
      pendingSessions: monthlyWatering.filter(s => s.status === 'pending').length,
      avgSessionsPerWeek: Math.round(monthlyWatering.length / 4)
    },
    planting: {
      totalPlantings: monthlyPlanting.length,
      byStatus: {
        seeded: monthlyPlanting.filter(p => p.status === 'seeded').length,
        growing: monthlyPlanting.filter(p => p.status === 'growing').length,
        harvested: monthlyPlanting.filter(p => p.status === 'harvested').length
      },
      byCrop: monthlyPlanting.reduce((acc, planting) => {
        acc[planting.crop] = (acc[planting.crop] || 0) + 1;
        return acc;
      }, {}),
      byZone: monthlyPlanting.reduce((acc, planting) => {
        acc[planting.zone] = (acc[planting.zone] || 0) + 1;
        return acc;
      }, {})
    }
  };
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        typeof row[header] === 'string' && row[header].includes(',') 
          ? `"${row[header]}"` 
          : row[header]
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to convert Firestore timestamps or date strings to Date objects
const convertToDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a string (ISO format or date string)
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  
  return null;
};

// Crop Status Distribution Utilities
export const aggregateCropsByStatus = (plantingSchedules) => {
  if (!plantingSchedules || plantingSchedules.length === 0) {
    return {
      seeded: 0,
      growing: 0,
      harvested: 0,
      total: 0
    };
  }

  const statusCounts = plantingSchedules.reduce((acc, schedule) => {
    const status = schedule.status || 'seeded';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    seeded: statusCounts.seeded || 0,
    growing: statusCounts.growing || 0,
    harvested: statusCounts.harvested || 0,
    total: plantingSchedules.length
  };
};

export const getCropStatusPieData = (plantingSchedules) => {
  const statusCounts = aggregateCropsByStatus(plantingSchedules);
  
  return [
    { 
      name: 'Seeded', 
      value: statusCounts.seeded, 
      count: statusCounts.seeded,
      color: '#eab308' // yellow
    },
    { 
      name: 'Growing', 
      value: statusCounts.growing, 
      count: statusCounts.growing,
      color: '#22c55e' // green
    },
    { 
      name: 'Harvested', 
      value: statusCounts.harvested, 
      count: statusCounts.harvested,
      color: '#3b82f6' // blue
    }
  ].filter(item => item.value > 0);
};

export const getCropStatusBarData = (plantingSchedules) => {
  const statusCounts = aggregateCropsByStatus(plantingSchedules);
  
  return [
    { status: 'Seeded', count: statusCounts.seeded },
    { status: 'Growing', count: statusCounts.growing },
    { status: 'Harvested', count: statusCounts.harvested }
  ];
};

export const getCropGrowthTimelineData = (plantingSchedules) => {
  if (!plantingSchedules || plantingSchedules.length === 0) {
    return [];
  }

  // Create a map of dates to active crop counts
  const dateMap = new Map();
  
  plantingSchedules.forEach(schedule => {
    const plantedDate = convertToDate(schedule.plantedDate);
    const harvestDate = schedule.harvestDate ? convertToDate(schedule.harvestDate) : null;
    const status = schedule.status || 'seeded';
    
    if (!plantedDate) return;
    
    // Only count if status is seeded or growing (active crops)
    if (status === 'seeded' || status === 'growing') {
      // Add entry for planted date
      const plantedKey = plantedDate.toISOString().split('T')[0];
      dateMap.set(plantedKey, (dateMap.get(plantedKey) || 0) + 1);
      
      // If harvested, subtract from harvest date onwards
      if (harvestDate && status === 'harvested') {
        const harvestKey = harvestDate.toISOString().split('T')[0];
        dateMap.set(harvestKey, (dateMap.get(harvestKey) || 0) - 1);
      }
    }
  });

  // Convert to sorted array and calculate cumulative counts
  const sortedDates = Array.from(dateMap.keys()).sort();
  const timelineData = [];
  let activeCount = 0;
  
  sortedDates.forEach(date => {
    activeCount += dateMap.get(date);
    timelineData.push({
      date: date,
      activeCrops: activeCount,
      formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  });

  return timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getPlantingHarvestScatterData = (plantingSchedules) => {
  if (!plantingSchedules || plantingSchedules.length === 0) {
    return [];
  }

  return plantingSchedules
    .filter(schedule => schedule.plantedDate && schedule.harvestDate)
    .map(schedule => {
      const plantedDate = convertToDate(schedule.plantedDate);
      const harvestDate = convertToDate(schedule.harvestDate);
      
      if (!plantedDate || !harvestDate) return null;
      
      const daysToHarvest = Math.ceil((harvestDate - plantedDate) / (1000 * 60 * 60 * 24));
      
      // Format date string for display
      const dateString = plantedDate instanceof Date 
        ? plantedDate.toISOString().split('T')[0]
        : schedule.plantedDate;
      
      return {
        plantedDate: dateString,
        daysToHarvest: daysToHarvest,
        crop: schedule.crop || 'Unknown',
        zone: schedule.zone || 'N/A',
        x: plantedDate.getTime(), // Use timestamp for plotting
        y: daysToHarvest
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.x - b.x);
};

export const getCropsByZoneData = (plantingSchedules) => {
  if (!plantingSchedules || plantingSchedules.length === 0) {
    return [];
  }

  const zoneCounts = plantingSchedules.reduce((acc, schedule) => {
    const zone = schedule.zone || 'Unknown';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  // Sort zones alphabetically
  return Object.entries(zoneCounts)
    .map(([zone, count]) => ({
      zone: `Zone ${zone}`,
      count: count
    }))
    .sort((a, b) => a.zone.localeCompare(b.zone));
};

// Export functions for charts
export const exportChartToPDF = async (chartRef, filename) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Wait a bit to ensure chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(chartRef, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: chartRef.offsetWidth,
      height: chartRef.offsetHeight
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Center the image if it's smaller than page
    const xOffset = 0;
    const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
    
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export chart to PDF. Please try again.');
  }
};

export const exportChartDataToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Plant Summary Data Computation
export const computePlantSummaryData = (plantingSchedules) => {
  if (!plantingSchedules || plantingSchedules.length === 0) {
    return {
      totalPlants: 0,
      growingPlants: 0,
      harvestedPlants: 0,
      seededPlants: 0,
      upcomingHarvests: 0,
      byStatus: {
        seeded: 0,
        growing: 0,
        harvested: 0
      },
      byCrop: {},
      tableData: []
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Calculate metrics
  const totalPlants = plantingSchedules.length;
  const growingPlants = plantingSchedules.filter(p => p.status === 'growing').length;
  const harvestedPlants = plantingSchedules.filter(p => p.status === 'harvested').length;
  const seededPlants = plantingSchedules.filter(p => p.status === 'seeded').length;

  // Calculate upcoming harvests (within next 7 days)
  const upcomingHarvests = plantingSchedules.filter(schedule => {
    if (!schedule.harvestDate || schedule.status === 'harvested') return false;
    const harvestDate = convertToDate(schedule.harvestDate);
    if (!harvestDate) return false;
    harvestDate.setHours(0, 0, 0, 0);
    return harvestDate >= today && harvestDate <= nextWeek;
  }).length;

  // Group by status
  const byStatus = {
    seeded: seededPlants,
    growing: growingPlants,
    harvested: harvestedPlants
  };

  // Group by crop
  const byCrop = plantingSchedules.reduce((acc, schedule) => {
    const crop = schedule.crop || 'Unknown';
    acc[crop] = (acc[crop] || 0) + 1;
    return acc;
  }, {});

  // Prepare table data with days remaining
  const tableData = plantingSchedules.map(schedule => {
    const harvestDate = schedule.harvestDate ? convertToDate(schedule.harvestDate) : null;
    let daysRemaining = null;
    
    if (harvestDate && schedule.status !== 'harvested') {
      harvestDate.setHours(0, 0, 0, 0);
      const diffTime = harvestDate - today;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      id: schedule.id,
      cropName: schedule.crop || 'Unknown',
      zone: schedule.zone || 'N/A',
      status: schedule.status || 'seeded',
      plantedDate: schedule.plantedDate || '',
      harvestDate: schedule.harvestDate || '',
      daysRemaining: daysRemaining
    };
  });

  return {
    totalPlants,
    growingPlants,
    harvestedPlants,
    seededPlants,
    upcomingHarvests,
    byStatus,
    byCrop,
    tableData
  };
};
