import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { ActivityContext } from '../context/ActivityContext'; // ✅ context'i al

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUserEmail } = useContext(ActivityContext); // ✅ context'ten al

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen email ve şifre girin.');
            return;
        }

        try {
            const response = await axios.post('https://mobile-app-backend-1jqt.onrender.com/api/auth/login', {
                email,
                password
            });

            const token = response.data.token;
            console.log("🟢 Token:", token);

            await AsyncStorage.removeItem('email'); // eski email sil
            await AsyncStorage.setItem('email', email); // yeni email yaz
            setUserEmail(email); // ✅ context'e bildir

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
            <Button title="Giriş Yap" onPress={handleLogin} />
            <Button title="Hesap Oluştur" onPress={() => navigation.navigate('RegisterScreen')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
});

export default LoginScreen;
