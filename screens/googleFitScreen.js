import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GoogleFit from 'react-native-google-fit';
import { GOOGLE_FIT_CONFIG } from '../googleFitConfig';

const GoogleFitScreen = () => {
    const [heartRate, setHeartRate] = useState([]);

    useEffect(() => {
        const authorizeAndFetch = async () => {
            try {
                const options = { scopes: GOOGLE_FIT_CONFIG.scopes };
                const authResult = await GoogleFit.authorize(options);

                if (authResult.success) {
                    console.log("✅ Yetkilendirme başarılı");
                    const data = await GoogleFit.getHeartRateSamples({
                        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        endDate: new Date().toISOString()
                    });
                    setHeartRate(data);
                } else {
                    console.log("❌ Yetkilendirme başarısız");
                }
            } catch (err) {
                console.error("🚨 Hata:", err);
            }
        };

        authorizeAndFetch();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Google Fit Kalp Verileri</Text>
            {heartRate.length > 0 ? (
                heartRate.map((item, index) => (
                    <Text key={index}>{item.value} bpm - {new Date(item.startDate).toLocaleString()}</Text>
                ))
            ) : (
                <Text>Veri yok</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});

export default GoogleFitScreen;
