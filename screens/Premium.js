import React, { useState, useEffect } from 'react'
import {
  StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Linking, ActivityIndicator, ScrollView, Platform, Dimensions, ToastAndroid
} from 'react-native';
import { IAP } from '../utils';
import { Button } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const isSendNoti = Platform.select({
  ios: true,
  android: false,
});

const width = Dimensions.get('window').width;

const Premium = () => {

  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isPurchased, setPurchased] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isShowClose, setShowClose] = useState(false);

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  useEffect(() => {
    initIAP();
    delayToShowClose();
  }, [])

  const delayToShowClose = async () => {
    await timeout(3000);
    setShowClose(true);
  }

  useFocusEffect(
    React.useCallback(() => {
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result);
      });
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  const initIAP = async () => {
    const purchased = await IAP.isPurchased();

    if (!purchased) {
      console.log("init iap");
      await IAP.connect();
      const products = await IAP.getIAPItems();
      console.log("products:", products);
      if (products.length > 0) {
        setSelected(products[0])
        setProducts(products);
        setPurchased(purchased);
      } else {
        if (Platform.OS == 'android') ToastAndroid.show('Cannot load in-app purchase!', ToastAndroid.LONG);
        await sleep(3000);
        navigation.goBack();
      }
    } else {
      setProducts([]);
      setPurchased(true);
    }

    setLoading(false);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <ImageBackground source={require('../assets/iap_banner.png')} style={{ alignSelf: 'center', width: width, height: Platform.isPad ? 280 : width / 600 * 338, marginTop: 80 }} imageStyle={{ resizeMode: 'contain' }}/>
          <Text style={{ color: '#000', fontWeight: 'bold', alignSelf: 'center', fontSize: 24 }}>GET UNLIMITED ACCESS</Text>

          <View style={{ width: '75%', margin: 16, alignSelf: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name='cloudy-outline' size={12} color='#000' />
              <Text style={{ color: '#000', margin: 2, textAlign: 'justify', fontSize: 12 }}>{"1000+ mods for Melon PG with weekly update"}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name='add-outline' size={12} color='#000' />
              <Text style={{ color: '#000', margin: 2, textAlign: 'justify', fontSize: 12 }}>{"New mods are added weekly and are moderated"}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name='phone-portrait-outline' size={12} color='#000' />
              <Text style={{ color: '#000', margin: 2, textAlign: 'justify', fontSize: 12 }}>Remove all ads</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name='mail-outline' size={12} color='#000' />
              <Text style={{ color: '#000', margin: 2, textAlign: 'justify', fontSize: 12 }}>{"Support additional mods on user request by contacting the developer directly."}</Text>
            </View>
          </View>
          {isPurchased ?
            <Button
              title="You purchased"
              buttonStyle={styles.unlockBtn}
              onPress={() => alert("You purchased!")} /> :

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {products.map(product => (
                <Button
                  disabled={loading}
                  key={product.productId}
                  title={
                    <View style={{ width: '80%', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000000' }}>
                        {products.length == 0 ? '---' : product.productId.includes('week') ? 'Weekly' : 'Lifetime'}
                      </Text>
                      <Text style={{ color: '#004D40', margin: 16, fontSize: 18, fontWeight: product.productId === selected.productId ? 'bold' : 'normal' }}>
                        {products.length == 0 ? '---' : product.productType === 'inapp' || Platform.OS !== 'android' ? product.localizedPrice : product.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#004D40' }}>
                        {products.length == 0 ? '---' : product.productId.includes('week') ? 'Auto-renew\nevery week' : 'billed\nonce'}
                      </Text>
                    </View>
                  }
                  buttonStyle={[
                    styles.unlockBtn,
                    {
                      backgroundColor: '#FFF',
                      borderWidth: product.productId === selected.productId ? 2 : 1,
                      borderColor: product.productId === selected.productId ? '#00695C' : '#CFD8DC'
                    }
                  ]}
                  onPress={() => setSelected(product)}
                />
              ))}
            </View>
          }
          <View style={{ alignSelf: 'center', width: Platform.isPad ? '70%' : '90%', margin: 10, padding: 10, backgroundColor: 'rgba(52, 52, 52, 0.2)', borderRadius: 10 }}>
            <Text style={{ textAlign: 'justify', fontSize: Platform.isPad ? 16 : 12 }}>With the weekly plan and the Lifetime plan you will need to pay immediately, then you will use the app with full access and no ads. You can unsubscribe from these packages at any time.</Text>
          </View>
        </View>
        <View style={{ height: 200 }} />
      </ScrollView>
      <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {!isPurchased && <Button
          title={<Text style={{ color: '#FFF', margin: 5, fontSize: 24, fontWeight: 'bold' }}>Continue!</Text>}
          buttonStyle={styles.continue}
          onPress={async () => {
            if (products.length > 0 && !loading) {
              setLoading(true);
              // await IAP.purchase(selected);
              if (selected.productType === 'inapp') {
                await IAP.purchase(selected.productId);
              } else {
                if (Platform.OS == 'android') {
                  var offerToken = selected.subscriptionOfferDetails[0].offerToken || null;
                  await IAP.subscribe(selected.productId, offerToken);
                } else {
                  await IAP.subscribe(selected.productId, null);
                }
              }
              await sleep(1000);
              setLoading(false);
              const purchased = await IAP.isPurchased();
              if (purchased && isSendNoti) {
                console.log("da charge, dang gui");
                try {
                  await axios({
                    method: 'post',
                    url: 'https://analytics.megatechlab.com/logging',
                    data: {
                      appId: 'com.gammapp.modsmelon',
                      iapPack: selected.productId.includes('week') ? 'weekly v2.1' : 'onetime v2.1'
                    }
                  });
                } catch (err) {
                  console.log(err);
                }
              }
              setPurchased(purchased);
            }
          }}
        />}
        <View style={{ alignSelf: 'center', marginBottom: 10, width: '80%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity style={{ margin: 5 }} onPress={() => Linking.openURL('https://megatechlab.com/privacy/')}>
            <Text style={{ fontSize: 12, color: '#fff' }}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ margin: 5 }} onPress={() => Linking.openURL('https://megatechlab.com/terms')}>
            <Text style={{ fontSize: 12, color: '#fff' }}>Terms of use</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ margin: 5 }}
            onPress={async () => {
              setLoading(true);
              await IAP.restore(products)
              await sleep(1000);
              setLoading(false);
              const purchased = await IAP.isPurchased();
              setPurchased(purchased);
              alert("Restore Successful");
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>Restore</Text>
          </TouchableOpacity>
        </View>
      </View>
      {(loading || products.length == 0) && !isPurchased && <View style={{ position: 'absolute', width: 80, height: 80, backgroundColor: '#9fa8da', alignSelf: 'center', top: '50%', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size='large' color="#ffffff" />
      </View>}
      {isShowClose && <TouchableOpacity
        style={{ position: 'absolute', top: 60, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(52, 52, 52, 0.5)', alignItems: 'center', justifyContent: 'center' }}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Ionicons
          name='close' size={40} color='#FFF'
        />
      </TouchableOpacity>}
    </View>
  )
}

const styles = StyleSheet.create({
  step: { alignSelf: 'center', fontSize: 18, justifyContent: 'center', marginTop: 30, fontWeight: 'bold' },
  bonus: { fontSize: 20, margin: 5, color: '#fff' },
  unlockBtn: {
    alignSelf: 'center', width: width / 2 - 20, margin: 5, borderRadius: 20, padding: 10
  },
  continue: { width: '80%', alignSelf: 'center', backgroundColor: '#00695C', margin: 20, borderRadius: 10, padding: 10 }
});

export default Premium
