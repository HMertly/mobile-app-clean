import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { ActivityContext } from '../context/ActivityContext';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} dk ${s} sn`;
};

export default function ProfileScreen() {
    const { activityTimes } = useContext(ActivityContext);

    const totalTime = activityTimes.walking + activityTimes.running + activityTimes.upstairs || 1;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Günlük Aktivite Özeti</Text>

            <View style={styles.progressRow}>
                <ActivityCircle label="Yürüyüş" value={activityTimes.walking} color="#F28B30" />
                <ActivityCircle label="Koşu" value={activityTimes.running} color="#FF7F50" />
                <ActivityCircle label="Merdiven" value={activityTimes.upstairs} color="#FF6347" />
            </View>

            <View style={styles.textRow}>
                <Text style={styles.detailText}>🚶‍♂️ Yürüyüş: {activityTimes.walking} sn</Text>
                <Text style={styles.detailText}>🏃‍♂️ Koşu: {activityTimes.running} sn</Text>
                <Text style={styles.detailText}>🧗‍♂️ Merdiven: {activityTimes.upstairs} sn</Text>
            </View>
        </View>
    );
}

const ActivityCircle = ({ label, value, color }) => {
    const { activityTimes } = useContext(ActivityContext);
    const total = activityTimes.walking + activityTimes.running + activityTimes.upstairs || 1;
    const percent = Math.round((value / total) * 100);

    return (
        <View style={styles.circleContainer}>
            <AnimatedCircularProgress
                size={100}
                width={10}
                fill={percent}
                tintColor={color}
                backgroundColor="#eee"
                rotation={0}
                arcSweepAngle={270}
            >
                {() => <Text style={styles.percentText}>{percent}%</Text>}
            </AnimatedCircularProgress>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 },
    circleContainer: { alignItems: 'center', marginHorizontal: 10 },
    percentText: { fontSize: 20, fontWeight: 'bold' },
    label: { marginTop: 8, fontSize: 16 },

    textRow: {
        alignItems: 'center',
    },
    detailText: {
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 4,
        color: '#444',
    },
});
