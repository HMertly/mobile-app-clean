import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { ActivityContext } from '../context/ActivityContext';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');
    const [guardianPassword, setGuardianPassword] = useState('');
    const { setUserEmail } = useContext(ActivityContext);

    const registerPushToken = async (guardianEmail) => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('İzin Gerekli', 'Bildirim izni verilmedi');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId,
            })).data;

            await axios.post('https://mobile-app-backend-1jqt.onrender.com/api/notifications/register-token', {
                token,
                email: guardianEmail // gözetmen email'ini eşleştiriyoruz
            });

            console.log('🔔 Gözetmen token kaydedildi:', token);
        } catch (error) {
            console.error('❌ Token kaydında hata:', error);
        }
    };


    const handleLogin = async () => {
        if (!email || !password || !guardianEmail || !guardianPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            const response = await axios.post('https://mobile-app-backend-1jqt.onrender.com/api/auth/login', {
                email,
                password
            });

            const token = response.data.token;
            console.log("🟢 Token:", token);

            await AsyncStorage.multiSet([
                ['email', email],
                ['guardianEmail', guardianEmail],
                ['guardianPassword', guardianPassword]
            ]);

            setUserEmail(email);
            await registerPushToken(guardianEmail);

            Alert.alert('Giriş Başarılı', 'Hoşgeldiniz!');
            navigation.replace('HomeScreen');
        } catch (error) {
            console.error("❌ Giriş hatası:", JSON.stringify(error, null, 2));
            Alert.alert('Giriş Başarısız', error.response?.data?.message || 'Sunucu hatası');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giriş Yap</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />

            <Text style={styles.subtitle}>Gözetmen Bilgileri</Text>
            <TextInput
                placeholder="Gözetmen Email"
                value={guardianEmail}
                onChangeText={setGuardianEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Gözetmen Şifre"
                value={guardianPassword}
                onChangeText={setGuardianPassword}
                style={styles.input}
                secureTextEntry
            />

            <Button title="Giriş Yap" onPress={handleLogin} />
            <Button title="Hesap Oluştur" onPress={() => navigation.navigate('RegisterScreen')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 18, marginTop: 30, marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
});

export default LoginScreen;