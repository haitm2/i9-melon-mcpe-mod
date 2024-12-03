import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { set } from 'lodash';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AES, IAP } from '../utils';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { TextInput } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
  ios: 'ca-app-pub-1354543839348242/1148828151',
  android: TestIds.INTERSTITIAL,
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function MelonSearch({ navigation, route }) {

  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [topKeywords, setTopKeywords] = useState([
    { keyword: 'skibidi', icon: require('../assets/keywords/skibidi.png') },
    { keyword: 'cameraman', icon: require('../assets/keywords/cameraman.png') },
    { keyword: 'gun', icon: require('../assets/keywords/gun.png') },
    { keyword: 'gojo', icon: require('../assets/keywords/gojo.png') },
    { keyword: 'naruto', icon: require('../assets/keywords/naruto.png') },
    { keyword: 'tank', icon: require('../assets/keywords/tank.png') }
  ]);

  function randomNumOfMods() {
    return Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Search mods</Text>
        </View>
      )
    });
  }, [navigation]);

  const getNewMods = async () => {
    setItems([]);
    setSearching(true);
    console.log("Searching with keyword:", keyword);
    const encryptedNewMods = await axios.get(`https://melon-mods.visionmobi.com/search?q=${keyword}`);
    const newModsStr = await AES.decryptMelon(encryptedNewMods.data)
    const newMods = JSON.parse(newModsStr);
    setItems(newMods.data);
    // if (newMods.keywords) {
    //   setTopKeywords(newMods.keywords);
    // }
    setSearching(false);
  }

  const getNewModsWithKeyword = async (keyword) => {
    setItems([]);
    setSearching(true);
    console.log("Searching with keyword:", keyword);
    const encryptedNewMods = await axios.get(`https://melon-mods.visionmobi.com/search?q=${keyword}`);
    const newModsStr = await AES.decryptMelon(encryptedNewMods.data)
    const newMods = JSON.parse(newModsStr);
    setItems(newMods.data);
    // if (newMods.keywords) {
    //   setTopKeywords(newMods.keywords);
    // }
    setSearching(false);
  }

  const getFileName = (file) => {
    try {
      var temp = file.split('/');
      var fileName = temp[temp.length - 1];
      return fileName;
    } catch {
      return 'unknown';
    }
  }

  useEffect(() => {
    getNewMods();
  }, []);

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

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useFocusEffect(
    React.useCallback(() => {
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result)
      });
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        barStyle="dark-content"
      />

      {bannerError || isPurchased || Platform.OS == 'android' ?
        null :
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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

      <View style={styles.searchbar}>
        <View style={{ margin: 20 }}>
          <Ionicons
            name='search' size={24}
            color='#00695C'
          />
        </View>
        <TextInput
          style={{ flex: 1, margin: 20 }}
          placeholder='Search mods...'
          value={keyword}
          onChangeText={text => setKeyword(text)}
          onSubmitEditing={async () => await getNewMods()}
        />
      </View>

      {searching && <ActivityIndicator size={'large'} color={'#000'} />}

      {items.length === 0 && !searching && <Text style={{ color: 'gray', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>No mods found</Text>}

      <ScrollView showsVerticalScrollIndicator={false}>
        {keyword === '' && topKeywords.length > 0 && <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, marginTop: 10, marginBottom: 10 }}>Explore keywords</Text>}
        {keyword === '' && <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[0].keyword);
              await getNewModsWithKeyword(topKeywords[0].keyword);
            }}
          >
            <Text>{topKeywords[0].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[0].icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[1].keyword);
              await getNewModsWithKeyword(topKeywords[1].keyword);
            }}
          >
            <Text>{topKeywords[1].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[1].icon} />
          </TouchableOpacity>
        </View>}
        {keyword === '' && <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[2].keyword);
              await getNewModsWithKeyword(topKeywords[2].keyword);
            }}
          >
            <Text>{topKeywords[2].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[2].icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[3].keyword);
              await getNewModsWithKeyword(topKeywords[3].keyword);
            }}
          >
            <Text>{topKeywords[3].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[3].icon} />
          </TouchableOpacity>
        </View>}
        {keyword === '' && <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[4].keyword);
              await getNewModsWithKeyword(topKeywords[4].keyword);
            }}
          >
            <Text>{topKeywords[4].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[4].icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#ECEFF1', borderRadius: 20, width: width / 2 - 15, margin: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}
            onPress={async () => {
              setKeyword(topKeywords[5].keyword);
              await getNewModsWithKeyword(topKeywords[5].keyword);
            }}
          >
            <Text>{topKeywords[5].keyword}</Text>
            <ImageBackground style={{ width: 20, height: 20 }} source={topKeywords[5].icon} />
          </TouchableOpacity>
        </View>}
        <View style={{ padding: 8 }}>
          {items.map(mod => (
            <TouchableOpacity
              style={{ flexDirection: 'row' }} key={mod.image + mod.name}
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
                if (!mod.name.includes('empty_')) {
                  var downloads = [];
                  for (var file of mod.files) {
                    downloads.push({ url: file, title: getFileName(file) })
                  }
                  set(mod, 'downloads', downloads);
                  navigation.navigate('MelonDetail', { data: mod });
                }
              }}
            >
              <View style={styles.modItemLeft}>
                <ImageBackground source={{ uri: mod.image }} style={{ width: 120, height: 120, backgroundColor: 'gray', borderRadius: 20 }} resizeMode='cover' imageStyle={{ borderRadius: 20 }}>
                  <View style={styles.lockView}>
                    {isPurchased || mod.isFree === true ? null : <Ionicons name="lock-closed" color='#616161' size={20} />}
                  </View>
                </ImageBackground>
              </View>
              <View style={styles.modItemRight}>
                <Text style={{ fontSize: 16 }}>{mod.name}</Text>
                {isPurchased || mod.isFree === true ? null : <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#222' }}>{"(New item, unlock later)"}</Text>}
                <Text style={{ fontSize: 14, marginTop: 10 }}>{mod.fileCount + " submods"}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 14, marginTop: 10, color: '#90A4AE' }}>{mod.downloads}</Text>
                  <Ionicons name="download-outline" color='#90A4AE' size={20} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 200 }} />
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
  modItemLeft: {
    backgroundColor: 'gray', marginTop: 8, marginBottom: 8, marginLeft: 8,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  modItemRight: {
    flex: 1, margin: 8, padding: 8,
  },
  searchbar: {
    margin: 16, backgroundColor: '#ECEFF1', flexDirection: 'row', borderRadius: 24,
  },
  lockView: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 15 }
});
