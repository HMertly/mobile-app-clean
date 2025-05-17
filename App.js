
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert, Vibration } from 'react-native';
import { Audio } from 'expo-av'; // Ses oynatma için gerekli
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/NotificationService';
import { ActivityProvider } from './context/ActivityContext';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import GoogleFitScreen from './screens/googleFitScreen';
import SettingsScreen from './screens/SettingsScreen';
import WalkingScreen from './screens/WalkingScreen';
import StairScreen from './screens/StairScreen';
import RunningScreen from './screens/RunningScreen';
import CyclingScreen from './screens/CyclingScreen';
import ProfileScreen from './screens/ProfileScreen';
//EcLCmGOLcsYeWmYz
//85.153.227.31



const Stack = createStackNavigator();

const THRESHOLD_ACCEL = 22.0; // İvme için eşik değeri
const THRESHOLD_GYRO = 23.0; // Jiroskop için eşik değeri

let alertTriggered = false;

const startGlobalSensorListener = () => {
    const checkForSuddenMovement = (gyro, accel) => {
        if (
            !alertTriggered &&
            (Math.abs(gyro.x) > THRESHOLD_GYRO ||
                Math.abs(gyro.y) > THRESHOLD_GYRO ||
                Math.abs(gyro.z) > THRESHOLD_GYRO ||
                Math.abs(accel.x) > THRESHOLD_ACCEL ||
                Math.abs(accel.y) > THRESHOLD_ACCEL ||
                Math.abs(accel.z) > THRESHOLD_ACCEL)
        ) {
            alertTriggered = true; // Uyarıyı tetikle
            handleAlert(); // Özel alert işlevini çağır

            setTimeout(() => {
                alertTriggered = false;
            }, 2000); // 2 saniye bekle
        }
    };

    const gyroSubscription = Gyroscope.addListener((gyroscopeData) => {
        const accelData = { x: 0, y: 0, z: 0 }; // Varsayılan veri
        checkForSuddenMovement(gyroscopeData, accelData);
    });

    const accelSubscription = Accelerometer.addListener((accelerometerData) => {
        const gyroData = { x: 0, y: 0, z: 0 };
        checkForSuddenMovement(gyroData, accelerometerData);
    });

    return () => {
        gyroSubscription && gyroSubscription.remove();
        accelSubscription && accelSubscription.remove();
    };
};

const handleAlert = async () => {
    let vibrationInterval;
    let soundObject;

    // Telefonu titreştirme
    const startVibration = () => {
        vibrationInterval = setInterval(() => {
            Vibration.vibrate(1000); // 1 saniyelik titreşim
        }, 1000);
    };

    // Titreşimi durdurma
    const stopVibration = () => {
        clearInterval(vibrationInterval);
    };

    // Siren sesini başlatma
    const startSiren = async () => {
        soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync(require('./assets/siren.mp3')); // Siren ses dosyanızın yolu
            await soundObject.setIsLoopingAsync(true); // Döngüye alma
            await soundObject.playAsync(); // Çalma
        } catch (error) {
            console.error("Siren sesi yüklenirken bir hata oluştu:", error);
        }
    };

    // Siren sesini durdurma
    const stopSiren = async () => {
        if (soundObject) {
            try {
                await soundObject.stopAsync();
                await soundObject.unloadAsync();
            } catch (error) {
                console.error("Siren sesi durdurulurken bir hata oluştu:", error);
            }
        }
    };

    // Alert göster
    Alert.alert(
        "Uyarı",
        "Ani hareket algılandı! Durumunuzu bildirin.",
        [
            {
                text: "İyiyim",
                onPress: async () => {
                    stopVibration(); // Titreşimi durdur
                    await stopSiren(); // Siren sesini durdur
                    console.log("Kullanıcı iyi olduğunu belirtti.");
                },
                style: "default",
            },
            {
                text: "Yardım lazım",
                onPress: async () => {
                    stopVibration(); // Titreşimi durdur
                    await stopSiren(); // Siren sesini durdur
                    console.log("Kullanıcı yardım istedi.");
                    // Yardım için ek işlevler burada çağrılabilir
                },
                style: "destructive",
            },
        ],
        { cancelable: false } // Kullanıcının alert'i kapatamamasını sağlar
    );

    startVibration(); // Alert gösterildiğinde titreşimi başlat
    await startSiren(); // Siren sesini başlat
};

// Ana Ekran (HomeScreen)
function HomeScreen({ navigation }) {
    const handleButtonPress = () => {
        navigation.navigate('NewScreen');
    };

    return (
        <View style={styles.container}>
            <Image source={require('./assets/Path72.png')} style={styles.topImage} resizeMode="contain" />
            <Image source={require('./assets/Group91.png')} style={styles.centerImage} resizeMode="contain" />
            <Image source={require('./assets/Group88.png')} style={styles.bottomImage} resizeMode="contain" />

            {/* Google Fit butonu biraz yukarı alındı */}
            <TouchableOpacity onPress={() => navigation.navigate('GoogleFitScreen')} style={styles.googleFitButton}>
                <Text style={styles.buttonText}>Google Fit Verilerini Gör</Text>
            </TouchableOpacity>

            {/* Start Now butonu */}
            <TouchableOpacity onPress={handleButtonPress} style={styles.buttonContainer}>
                <Image source={require('./assets/Group86.png')} style={styles.buttonImage} resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
}

// Yeni Ekran (NewScreen)
function NewScreen({ navigation }) {
    return (
        <View style={styles.newScreenContainer}>
            <Image source={require('./assets/Rectangle26.png')} style={styles.newScreenImage} resizeMode="contain" />
            <Image source={require('./assets/Group78.png')} style={styles.runningTextImage} resizeMode="contain" />
            <Image source={require('./assets/Group80.png')} style={styles.groupImage} resizeMode="contain" />
            <Image source={require('./assets/Component 4 – 1.png')} style={styles.componentImage} resizeMode="contain" />
            <Image source={require('./assets/Group 71.png')} style={styles.group71Image} resizeMode="contain" />
            <Image source={require('./assets/Cycling.png')} style={styles.cyclingImage} resizeMode="contain" />
            <Image source={require('./assets/Component1 – 1.png')} style={styles.component1Image} resizeMode="contain" />
            {/* ✅ Upstairs Card */}
            <Image source={require('./assets/Component 4 – 1.png')} style={styles.upstairsCardImage} resizeMode="contain" />
            <Image source={require('./assets/upstairs.png')} style={styles.upstairsIconImage} resizeMode="contain" />
            <TouchableOpacity onPress={() => navigation.navigate('StairScreen')} style={styles.showUpstairsButton}>
                <Image source={require('./assets/Group79.png')} style={styles.showUpstairsImage} resizeMode="contain" />
            </TouchableOpacity>


            <Image source={require('./assets/Walking.png')} style={styles.walkingImage} resizeMode="contain" />


            <TouchableOpacity onPress={() => navigation.navigate('RunningScreen')} style={styles.showResultsButton}>
                <Image source={require('./assets/Group79.png')} style={styles.showResultsImage} resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('WalkingScreen')} style={styles.showWalkingButton}>
                <Image source={require('./assets/Group73.png')} style={styles.showWalkingImage} resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> navigation.navigate('CyclingScreen')} style={styles.showCyclingButton}>
                <Image source={require('./assets/Group64.png')} style={styles.showCyclingImage} resizeMode="contain" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, styles.buttonHome]}>
                <Image source={require('./assets/Path19.png')} style={styles.iconImage} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={[styles.iconButton, styles.buttonProfile]}>
                <Image source={require('./assets/Group60.png')} style={styles.iconImage} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={[styles.iconButton, styles.buttonSettings]}>
                <Image source={require('./assets/Group62.png')} style={styles.iconImage} />
            </TouchableOpacity>
        </View>
    );
}


export default function App() {
    useEffect(() => {
        const init = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                console.log("🟢 Expo Push Token:", token);

                await fetch("https://mobile-app-backend-1jqt.onrender.com/api/notifications/register-token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                });
            }
        };

        init();

        const stop = startGlobalSensorListener();

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log("🔔 Bildirim geldi:", notification);
        });

        return () => {
            stop();
            notificationListener.remove();
        };
    }, []);

    return (
        <ActivityProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="LoginScreen">
                    <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="NewScreen" component={NewScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CyclingScreen" component={CyclingScreen} options={{ title: 'Cycling Analysis' }} />
                    <Stack.Screen name="StairScreen" component={StairScreen} options={{ title: 'Stair Screen' }} />
                    <Stack.Screen name="RunningScreen" component={RunningScreen} options={{ title: 'Running Screen' }} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Konum Ekranı' }} />
                    <Stack.Screen name="WalkingScreen" component={WalkingScreen} options={{ title: 'Walking Screen' }} />
                    <Stack.Screen name="GoogleFitScreen" component={GoogleFitScreen} />
                    <Stack.Screen name="ProfileScreen" component={require('./screens/ProfileScreen').default} options={{ title: 'Profilim' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </ActivityProvider>
    );

}


// Stil Tanımlamaları
const styles = StyleSheet.create({
    googleFitButton: {
        position: 'absolute',
        bottom: hp('15%'), // Yukarı taşıdık (önce 5%'di, şimdi 15%)
        width: wp('70%'),
        height: hp('7%'),
        justifyContent: 'center',
        alignItems: 'center',
    },

    walkingScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    sensorText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'space-between' },
    topImage: { width: wp('100%'), height: hp('50%'), position: 'absolute', top: hp('-3%') },
    centerImage: { width: wp('50%'), height: hp('45%'), position: 'absolute', top: hp('10%') },
    bottomImage: { width: wp('55%'), height: hp('25%'), position: 'absolute', bottom: hp('20%') },
    buttonContainer: { position: 'absolute', bottom: hp('5%'), width: wp('70%'), height: hp('7%') },
    buttonImage: { width: '100%', height: '100%' , marginBottom: hp('5%')   },
    newScreenContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
    newScreenImage: { width: wp('100%'), height: hp('50%'), position: 'absolute', top: hp('70%') },
    groupImage: { width: wp('20%'), height: hp('14%'), position: 'absolute', top: hp('69%'), left: wp('55%') },
    runningTextImage: { width: wp('90%'), height: hp('45%'), position: 'absolute', bottom: hp('1%'), left: wp('5%') },
    componentImage: { width: wp('90%'), height: hp('45%'), position: 'absolute', bottom: hp('18%'), left: wp('5%') },
    component1Image: { width: wp('90%'), height: hp('45%'), position: 'absolute', bottom: hp('35%'), left: wp('5%') },
    cyclingImage: { width: wp('25%'), height: hp('25%'), position: 'absolute', bottom: hp('32%'), left: wp('10%') },
    walkingImage: { width: wp('25%'), height: hp('25%'), position: 'absolute', bottom: hp('49%'), left: wp('10%') },
    group71Image: { width: wp('30%'), height: hp('30%'), position: 'absolute', bottom: hp('25%'), left: wp('55%') },
    showResultsButton: { position: 'absolute', bottom: hp('18%'), left: wp('9%'), width: wp('30%'), height: hp('5%') },
    showWalkingButton: { position: 'absolute', bottom: hp('52%'), left: wp('9%'), width: wp('30%'), height: hp('5%') },
    showCyclingButton: { position: 'absolute', bottom: hp('35%'), left: wp('9%'), width: wp('30%'), height: hp('5%') },
    showResultsImage: { width: '100%', height: '100%' },
    showWalkingImage: { width: '100%', height: '100%' },
    showCyclingImage: { width: '100%', height: '100%' },
    iconButton: { position: 'absolute', width: moderateScale(60), height: moderateScale(60) },
    iconImage: { width: '50%', height: '50%' },
    buttonHome: { left: wp('10%'), top: hp('92%') },
    buttonSettings: { left: wp('80%'), top: hp('92%') },
    buttonProfile: { left: wp('46%'), top: hp('92%') },
    mapContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    mapHeaderText: { fontSize: moderateScale(18), fontWeight: 'bold', marginBottom: moderateScale(10) },
    coordinateBox: { width: wp('90%'), padding: moderateScale(10), backgroundColor: '#e6f7ff', borderRadius: 8, marginBottom: hp('2%'), alignItems: 'center' },
    coordinateText: { fontSize: moderateScale(16), fontWeight: '500', color: '#333' },
    loadingText: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#888' },
    map: { width: wp('90%'), height: hp('40%'), borderRadius: 10 },

    upstairsCardImage: {
        width: wp('90%'),
        height: hp('45%'),
        position: 'absolute',
        bottom: hp('52%'),
        left: wp('5%'),
    },
    upstairsIconImage: {
        width: wp('40%'),
        height: hp('25%'),
        position: 'absolute',
        bottom: hp('62%'),
        left: wp('52%'),
    },
    showUpstairsButton: {
        position: 'absolute',
        bottom: hp('68.5%'),
        left: wp('9%'),
        width: wp('30%'),
        height: hp('5%'),
        zIndex: 10,
    },
    showUpstairsImage: {
        width: '100%',
        height: '100%',
    },


});