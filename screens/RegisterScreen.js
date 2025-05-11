import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen email ve şifre girin.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler uyuşmuyor!');
            return;
        }

        try {
            await axios.post('https://mobile-app-backend-1jqt.onrender.com/api/auth/register', {
                email,
                password
            });


            Alert.alert('Kayıt Başarılı', 'Artık giriş yapabilirsiniz.');
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error("❌ Kayıt hatası:", JSON.stringify(error, null, 2));
            Alert.alert('Kayıt Başarısız', error.response?.data?.message || 'Sunucu hatası');
        }

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hesap Oluştur</Text>
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
            <TextInput
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
            />
            <Button title="Kayıt Ol" onPress={handleRegister} />
            <Button title="Geri Dön" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
});

export default RegisterScreen;
