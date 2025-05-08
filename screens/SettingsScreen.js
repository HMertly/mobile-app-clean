import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function SettingsScreen() {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Konum izni reddedildi!');
                return;
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 1,
                },
                (position) => {
                    setLocation(position.coords);
                }
            );
        })();
    }, []);

    return (
        <View style={styles.mapContainer}>
            <Text style={styles.mapHeaderText}>Anlık Konum Bilgisi</Text>
            {location ? (
                <>
                    <View style={styles.coordinateBox}>
                        <Text style={styles.coordinateText}>Enlem: {location.latitude.toFixed(5)}</Text>
                        <Text style={styles.coordinateText}>Boylam: {location.longitude.toFixed(5)}</Text>
                    </View>
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker coordinate={location} title="Mevcut Konum" description="Buradasınız!" />
                    </MapView>
                </>
            ) : (
                <Text>Konum bilgisi alınıyor...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    mapHeaderText: { fontSize: moderateScale(18), fontWeight: 'bold', marginBottom: moderateScale(10) },
    coordinateBox: { width: wp('90%'), padding: moderateScale(10), backgroundColor: '#e6f7ff', borderRadius: 8, marginBottom: hp('2%'), alignItems: 'center' },
    coordinateText: { fontSize: moderateScale(16), fontWeight: '500', color: '#333' },
    map: { width: wp('90%'), height: hp('40%'), borderRadius: 10 },
});
