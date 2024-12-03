import { Dimensions, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { AppOpenAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__ ? TestIds.APP_OPEN : Platform.select({
  ios: 'ca-app-pub-1354543839348242/8835746488',
  android: TestIds.APP_OPEN,
});

const width = Dimensions.get('window').width;
const appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

export default function Splash({ navigation }) {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const unsubscribe = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log("Da load xong open ad");
      });
      return unsubscribe;
    }
  }, [])

  useEffect(() => {
    initData();
  }, [])

  async function initData() {
    // await AsyncStorage.clear();
    const result = await IAP.isPurchased();
    if (Platform.OS == 'ios') {
      console.log("isPurchased =", result);
      // Start loading the interstitial straight away
      appOpenAd.load();
    }
    await sleep(6000);
    console.log(">>>>>>>> SHOW OPEN ADS");
    if (Platform.OS == 'ios' && result === false) {
      try {
        appOpenAd.show();
      } catch (err) { }
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });

  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/iap_banner.png')} style={{ alignSelf: 'center', width: width, height: width }} imageStyle={{ resizeMode: 'contain' }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
