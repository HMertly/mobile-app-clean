
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import { useContext } from 'react';
import { ActivityContext } from '../context/ActivityContext';


export default function WalkingScreen({ navigation }) {
    const [duration, setDuration] = useState(0);
    const [isWalking, setIsWalking] = useState(false);
    const [windowData, setWindowData] = useState([]);
    const [predictedClass, setPredictedClass] = useState(null);
    const { updateActivityTime } = useContext(ActivityContext);

    const durationRef = useRef(0);
    const isWalkingRef = useRef(false);
    const modelRef = useRef(null);
    const intervalRef = useRef(null);
    const accelSubscriptionRef = useRef(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                console.log("✅ TensorFlow hazır");

                const modelJson = require('../assets/tfjs_model/model.json');
                const modelWeights = [require('../assets/tfjs_model/group1-shard1of1.bin')];

                const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
                modelRef.current = model;

                console.log("✅ Model başarıyla yüklendi");
            } catch (error) {
                console.error("🛑 Model yükleme hatası:", error);
                Alert.alert("Model yüklenemedi", "Model dosyalarının doğru yüklendiğinden emin olun.");
            }
        };

        const predictLocally = async (featureArray) => {
            try {
                if (!modelRef.current || featureArray.length !== 240) return;

                const reshaped = [];
                for (let i = 0; i < featureArray.length; i += 3) {
                    reshaped.push(featureArray.slice(i, i + 3));
                }

                const inputTensor = tf.tensor3d([reshaped], [1, 80, 3]);
                const prediction = modelRef.current.predict(inputTensor);
                const predicted = prediction.argMax(-1).dataSync()[0];

                console.log("🔍 Tahmin sonucu:", predicted);
                setPredictedClass(predicted);

                const walking = predicted === 5;
                setIsWalking(walking);
                isWalkingRef.current = walking;
            } catch (err) {
                console.error("🛑 Tahmin hatası:", err);
            }
        };

        const startTracking = () => {
            Accelerometer.setUpdateInterval(100);

            accelSubscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
                setWindowData(prev => {
                    const updated = [...prev, x, y, z];
                    if (updated.length >= 240) {
                        predictLocally(updated.slice(-240));
                    }
                    return updated.slice(-240);
                });
            });

            intervalRef.current = setInterval(() => {
                if (isWalkingRef.current) {
                    durationRef.current += 1;
                    setDuration(durationRef.current);
                }
            }, 1000);
        };

        const prepare = async () => {
            await loadModel();
            startTracking();
        };

        prepare();

        return () => {
            if (accelSubscriptionRef.current) {
                accelSubscriptionRef.current.remove();
            }
            clearInterval(intervalRef.current);
            updateActivityTime('walking', durationRef.current);
        };
    }, []);

    const handleGoBack = () => {
        if (accelSubscriptionRef.current) {
            accelSubscriptionRef.current.remove();
        }
        clearInterval(intervalRef.current);
        navigation.navigate('NewScreen'); // goBack yerine bu satırı kullan
    };


    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m} dakika ${s} saniye`;

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yürüyüş Süresi</Text>
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
    backText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});