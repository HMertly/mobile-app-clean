import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
    const [activityTimes, setActivityTimes] = useState({
        walking: 0,
        running: 0,
        upstairs: 0,
    });

    const [userEmail, setUserEmail] = useState(null);

    // Kullanıcı login olduktan sonra email geldiğinde veri çek
    useEffect(() => {
        const fetchData = async () => {
            if (!userEmail) return;

            try {
                const res = await axios.get(`https://mobile-app-backend-1jqt.onrender.com/api/activity/${userEmail}`);
                if (res.data) {
                    setActivityTimes({
                        walking: res.data.walking || 0,
                        running: res.data.running || 0,
                        upstairs: res.data.upstairs || 0,
                    });
                    console.log("☁️ Aktivite verileri yüklendi.");
                }
            } catch (err) {
                console.warn("🚫 Aktivite verisi alınamadı:", err.message);
            }
        };

        fetchData();
    }, [userEmail]);

    // Güncelleme fonksiyonu
    const updateActivityTime = async (type, seconds) => {
        setActivityTimes((prev) => {
            const updated = {
                ...prev,
                [type]: prev[type] + seconds,
            };

            // Eğer email belliyse backend'e yaz
            if (userEmail) {
                axios.post(`https://mobile-app-backend-1jqt.onrender.com/api/activity/${userEmail}`, updated)
                    .then(() => console.log("📤 Aktivite güncellendi:", type))
                    .catch((err) => console.warn("🚫 Backend'e yazılamadı:", err.message));
            }

            return updated;
        });
    };

    return (
        <ActivityContext.Provider value={{ activityTimes, updateActivityTime, setUserEmail }}>
            {children}
        </ActivityContext.Provider>
    );
};
