import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = ()  => {
        if (email && password) {
            Alert.alert('Giriş Başarılı', 'Hoşgeldiniz!');
            navigation.replace('HomeScreen'); // Giriş başarılı olduğunda HomeScreen'e yönlendir
        } else {
            Alert.alert('Hata', 'Lütfen email ve şifre girin.');
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
            <Button style={styles.button} title="Giriş Yap" onPress={handleLogin} />
            <Button style={styles.button} title="Hesap Oluştur" onPress={() => navigation.navigate('RegisterScreen')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
    button:{justifyContent:'center', alignItems:'center'}
});

export default LoginScreen;
