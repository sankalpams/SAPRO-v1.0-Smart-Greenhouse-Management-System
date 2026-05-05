import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Environment Data Operations
export const addEnvironmentData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'environmentData'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getEnvironmentData = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'environmentData'), orderBy('timestamp', 'desc'))
    );
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Watering Schedule Operations
export const addWateringSchedule = async (scheduleData) => {
  try {
    const docRef = await addDoc(collection(db, 'wateringSchedules'), {
      ...scheduleData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getWateringSchedules = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'wateringSchedules'), orderBy('time', 'asc'))
    );
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWateringSchedule = async (id, updateData) => {
  try {
    await updateDoc(doc(db, 'wateringSchedules', id), updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteWateringSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, 'wateringSchedules', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Planting Schedule Operations
export const addPlantingSchedule = async (plantingData) => {
  try {
    const docRef = await addDoc(collection(db, 'plantingSchedules'), {
      ...plantingData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getPlantingSchedules = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'plantingSchedules'), orderBy('plantedDate', 'desc'))
    );
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updatePlantingSchedule = async (id, updateData) => {
  try {
    await updateDoc(doc(db, 'plantingSchedules', id), updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deletePlantingSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, 'plantingSchedules', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Alerts Operations
export const addAlert = async (alertData) => {
  try {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alertData,
      timestamp: serverTimestamp(),
      read: false
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAlerts = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'alerts'), orderBy('timestamp', 'desc'))
    );
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markAlertAsRead = async (id) => {
  try {
    await updateDoc(doc(db, 'alerts', id), { read: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Settings Operations
export const getSettings = async () => {
  try {
    const settingsDoc = await getDocs(collection(db, 'settings'));
    if (settingsDoc.empty) {
      // Create default settings
      const defaultSettings = {
        tempLimit: 35,
        humidityLimit: 80,
        moistureLimit: 40,
        theme: 'light',
        notifications: true
      };
      await addDoc(collection(db, 'settings'), defaultSettings);
      return { success: true, data: defaultSettings };
    }
    const data = settingsDoc.docs[0].data();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateSettings = async (settingsData) => {
  try {
    const settingsDoc = await getDocs(collection(db, 'settings'));
    if (!settingsDoc.empty) {
      const docId = settingsDoc.docs[0].id;
      await updateDoc(doc(db, 'settings', docId), settingsData);
    } else {
      await addDoc(collection(db, 'settings'), settingsData);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const subscribeToEnvironmentData = (callback) => {
  const q = query(collection(db, 'environmentData'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeToAlerts = (callback) => {
  const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};
