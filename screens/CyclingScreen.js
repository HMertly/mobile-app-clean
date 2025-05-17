import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import { fft } from 'fft-js';
import axios from 'axios';

const SAMPLE_SIZE = 128;
const BACKEND_URL = 'https://mobile-flask-api.onrender.com/probabilities';

const LABELS = ["Downstairs", "Jogging", "Upstairs", "Standing", "Sitting", "Walking"];

const CyclingScreen = () => {
    const [probabilities, setProbabilities] = useState(null);
    const [loading, setLoading] = useState(true);

    const accelData = useRef([]);
    const gyroData = useRef([]);
    const accelSub = useRef(null);
    const gyroSub = useRef(null);
    const predictionTimer = useRef(null);

    const extractFeatures = (data) => {
        const channels = [[], [], [], [], [], []];
        data.forEach(([ax, ay, az, gx, gy, gz]) => {
            channels[0].push(ax); channels[1].push(ay); channels[2].push(az);
            channels[3].push(gx); channels[4].push(gy); channels[5].push(gz);
        });

        const stats = (arr) => {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const std = Math.sqrt(arr.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / arr.length);
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return [mean, std, min, max];
        };

        const fftPeak = (arr) => Math.max(...fft(arr).map(p => Math.sqrt(p[0] ** 2 + p[1] ** 2)));
        const fftPower = (arr) => fft(arr).map(([re, im]) => re ** 2 + im ** 2).reduce((a, b) => a + b, 0);
        const entropy = (arr) => {
            const total = arr.reduce((a, b) => a + Math.abs(b), 0);
            return -arr.map(x => Math.abs(x) / total).filter(p => p > 0).map(p => p * Math.log2(p)).reduce((a, b) => a + b, 0);
        };

        let features = [];
        channels.forEach((channel) => {
            features.push(...stats(channel), fftPeak(channel), fftPower(channel), entropy(channel));
        });

        while (features.length < 562) features.push(0);
        return features.slice(0, 562);
    };

    const predictProbabilities = async (featureArray) => {
        try {
            console.log("📤 API'ye gönderilen veri:", featureArray.slice(0, 5)); // İlk birkaç elemanı logla
            const res = await axios.post(BACKEND_URL, { features: featureArray });
            console.log("📥 API cevabı:", res.data);
            setProbabilities(res.data.probabilities);
        } catch (err) {
            console.error("❌ API hatası:", err.response?.data || err.message);
            Alert.alert("API Hatası", "Veri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Accelerometer.setUpdateInterval(20);
        Gyroscope.setUpdateInterval(20);

        accelSub.current = Accelerometer.addListener(data => {
            accelData.current.push([data.x, data.y, data.z]);
            if (accelData.current.length > SAMPLE_SIZE) accelData.current.shift();
        });

        gyroSub.current = Gyroscope.addListener(data => {
            gyroData.current.push([data.x, data.y, data.z]);
            if (gyroData.current.length > SAMPLE_SIZE) gyroData.current.shift();
        });

        // 🔁 Tahminleri gerçek zamanlı hale getiren kısım
        predictionTimer.current = setInterval(() => {
            const combined = accelData.current.map((accel, i) => {
                const gyro = gyroData.current[i] || [0, 0, 0];
                return [...accel, ...gyro];
            });

            if (combined.length >= SAMPLE_SIZE) {
                const padded = [...combined];
                while (padded.length < SAMPLE_SIZE) padded.push([0, 0, 0, 0, 0, 0]);
                const features = extractFeatures(padded);
                predictProbabilities(features);

                // eski verileri temizle
                accelData.current = [];
                gyroData.current = [];
            }
        }, 3000); // ⏱️ 3 saniyede bir tahmin yapılacak

        // Temizlik
        return () => {
            accelSub.current?.remove();
            gyroSub.current?.remove();
            clearInterval(predictionTimer.current); // 🧼 interval temizle
        };
    }, []);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚴‍♀️ Aktivite Olasılıkları</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : probabilities ? (
                <ScrollView style={styles.scrollBox}>
                    {LABELS.map(label => (
                        <View key={label} style={styles.row}>
                            <Text style={styles.label}>{label}</Text>
                            <Text style={styles.prob}>{(probabilities[label] * 100).toFixed(2)}%</Text>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.label}>❌ Veri alınamadı</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    scrollBox: { marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
    label: { fontSize: 18, color: '#333' },
    prob: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' }
});

export default CyclingScreen;
