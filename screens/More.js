import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import InAppReview from 'react-native-in-app-review';
import { Divider } from 'react-native-elements';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import { useFocusEffect } from '@react-navigation/native';

var isIpad = Platform.isPad;

const width = Dimensions.get('window').width;
const DOMAIN = 'megatechlab.com';
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
  ios: 'ca-app-pub-1354543839348242/1148828151',
  android: TestIds.INTERSTITIAL,
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function More({ navigation }) {

  const [isPurchased, setPurchased] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Da load xong ad")
      setLoaded(true);
    });

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  const showRateDialog = () => {
    const isAvailable = InAppReview.isAvailable();

    if (isAvailable) {
      InAppReview.RequestInAppReview()
        .then((hasFlowFinishedSuccessfully) => {
          // when return true in android it means user finished or close review flow
          console.log('InAppReview in android', hasFlowFinishedSuccessfully);

          // 3- another option:
          if (hasFlowFinishedSuccessfully) {
            console.log('rated!');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result)
      });
    }, [])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>More</Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        barStyle="dark-content"
      />
      <ScrollView style={{ padding: 10 }}>
        <View style={{ backgroundColor: '#ECEFF1', borderRadius: 20 }}>
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => Linking.openURL(`https://${DOMAIN}/privacy/`)}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="finger-print" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => Linking.openURL(`https://${DOMAIN}/terms/`)}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="attach" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Terms of use</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.moreItem}
            onPress={showRateDialog}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="rocket-outline" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Rate app</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => navigation.navigate('RequestMod')}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="mail-outline" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Request mod</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>
          {!isPurchased && <Divider />}
          {!isPurchased && <TouchableOpacity
            style={styles.moreItem}
            onPress={() => {
              if (!isPurchased) {
                if (loaded) {
                  interstitial.show();
                  setLoaded(false);
                  interstitial.load();
                } else {
                  interstitial.load();
                }
              }
              navigation.navigate('LuckyNumber');
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="gift-outline" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Luckly number</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>}
          {!isPurchased && <Divider />}
          {!isPurchased && <TouchableOpacity
            style={styles.moreItem}
            onPress={() => navigation.navigate('Premium')}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="cash-outline" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>Subscribe</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>}
        </View>

        {bannerError || isPurchased ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginBottom: 10, marginTop: 20 }}>
            <BannerAd
              size={BannerAdSize.MEDIUM_RECTANGLE}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: 'ca-app-pub-1354543839348242/6029581755',
                android: TestIds.BANNER,
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }

        <View style={{ backgroundColor: '#ECEFF1', borderRadius: 20, marginTop: 10 }}>
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => navigation.navigate('MelonTutorial')}
          >
            <View style={{ flexDirection: 'row' }}>
              <Ionicons name="body-outline" color='#00796B' size={20} />
              <Text style={{ color: '#00796B', marginLeft: 20, fontSize: 18 }}>How to install mods for Melon PG</Text>
            </View>
            <Ionicons name="chevron-forward-outline" color='#00796B' size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  moreItem: {
    flexDirection: 'row', padding: 15, justifyContent: 'space-between',
    margin: 5
  }
});
