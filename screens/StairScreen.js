import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import { fft } from 'fft-js';
import axios from 'axios';
import { ActivityContext } from '../context/ActivityContext';

export default function StairScreen({ navigation }) {
    const [duration, setDuration] = useState(0);
    const [predictedClass, setPredictedClass] = useState(null);
    const { updateActivityTime } = useContext(ActivityContext);

    const durationRef = useRef(0);
    const isClimbingRef = useRef(false);
    const accelData = useRef([]);
    const gyroData = useRef([]);
    const accelSub = useRef(null);
    const gyroSub = useRef(null);
    const predictionTimer = useRef(null);
    const intervalRef = useRef(null);

    const SAMPLE_SIZE = 128;

    const extractFeatures = (data) => {
        const channels = [[], [], [], [], [], []]; // ax, ay, az, gx, gy, gz

        data.forEach(([ax, ay, az, gx, gy, gz]) => {
            channels[0].push(ax);
            channels[1].push(ay);
            channels[2].push(az);
            channels[3].push(gx);
            channels[4].push(gy);
            channels[5].push(gz);
        });

        const features = [];

        const stats = (arr) => {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const std = Math.sqrt(arr.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / arr.length);
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return [mean, std, min, max];
        };

        const fftPeak = (arr) => {
            const phasors = fft(arr);
            const magnitudes = phasors.map(p => Math.sqrt(p[0] ** 2 + p[1] ** 2));
            return Math.max(...magnitudes);
        };

        const fftPower = (arr) => {
            const phasors = fft(arr);
            return phasors.map(([re, im]) => re ** 2 + im ** 2).reduce((a, b) => a + b, 0);
        };

        const entropy = (arr) => {
            const total = arr.reduce((a, b) => a + Math.abs(b), 0);
            return -arr.map(x => Math.abs(x) / total).filter(p => p > 0).map(p => p * Math.log2(p)).reduce((a, b) => a + b, 0);
        };

        channels.forEach((channel) => {
            features.push(...stats(channel));
            features.push(fftPeak(channel));
            features.push(fftPower(channel));
            features.push(entropy(channel));
        });

        while (features.length < 562) {
            features.push(0);
        }

        return features.slice(0, 562);
    };

    const predictViaAPI = async (featureArray) => {
        try {
            const response = await axios.post("https://mobile-flask-api.onrender.com/predict", {
                features: featureArray
            });

            const prediction = response.data.prediction;
            setPredictedClass(prediction);
            isClimbingRef.current = prediction === 5; // 5 = WALKING_UPSTAIRS
        } catch (error) {
            console.error("🛑 API tahmin hatası:", error.message);
            Alert.alert("API hatası", "Sunucuya erişilemiyor.");
        }
    };

    const startSensors = () => {
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

        predictionTimer.current = setInterval(() => {
            const combined = accelData.current.map((accel, i) => {
                const gyro = gyroData.current[i] || [0, 0, 0];
                return [...accel, ...gyro];
            });

            if (combined.length === SAMPLE_SIZE) {
                const features = extractFeatures(combined);
                predictViaAPI(features);
            }
        }, 1000);

        intervalRef.current = setInterval(() => {
            if (isClimbingRef.current) {
                durationRef.current += 1;
                setDuration(durationRef.current);
            }
        }, 1000);
    };

    useEffect(() => {
        startSensors();

        return () => {
            accelSub.current?.remove();
            gyroSub.current?.remove();
            clearInterval(intervalRef.current);
            clearInterval(predictionTimer.current);
            updateActivityTime('upstairs', durationRef.current);
        };
    }, []);

    const handleGoBack = () => {
        accelSub.current?.remove();
        gyroSub.current?.remove();
        clearInterval(intervalRef.current);
        clearInterval(predictionTimer.current);
        navigation.navigate('NewScreen');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m} dakika ${s} saniye`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Merdiven Çıkma Süresi</Text>
            <Text style={styles.duration}>{formatTime(duration)}</Text>
            <Text style={styles.prediction}>Tahmin edilen sınıf: {predictedClass !== null ? predictedClass : "..."}</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Text style={styles.backText}>🔙 Geri Dön</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold' },
    duration: { fontSize: 20, marginTop: 10 },
    prediction: { fontSize: 16, marginTop: 10, color: 'gray' },
    backButton: {
        marginTop: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#eee',
        borderRadius: 8,
    },
    backText: { fontSize: 16, fontWeight: 'bold' }
});
