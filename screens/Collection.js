import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('window').width;

export default function Collection({ navigation, route }) {

  const [melonItems, setMelonItems] = useState([]);
  const [mcpeItems, setMcpeItems] = useState([]);
  const [type, setType] = useState("melon");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Collection</Text>
        </View>
      ),
    });
  }, [navigation]);

  const getAllFavorites = async () => {
    setMelonItems([]);
    setMcpeItems([]);
    const keys = await AsyncStorage.getAllKeys();
    const melonFavoriteDatas = [];
    const mcpeFavoriteDatas = [];
    for (const key of keys) {
      if (key.includes('melon_')) {
        const value = await AsyncStorage.getItem(key);
        console.log("key =", key, ", value =", value);
        const fav = JSON.parse(value);
        melonFavoriteDatas.push(fav);
      }
      if (key.includes('mcpe_')) {
        const value = await AsyncStorage.getItem(key);
        console.log("key =", key, ", value =", value);
        const fav = JSON.parse(value);
        mcpeFavoriteDatas.push(fav);
      }
    }
    console.log('=====> melonFavoriteDatas:', melonFavoriteDatas);
    setMelonItems(melonFavoriteDatas);
    console.log('=====> mcpeFavoriteDatas:', mcpeFavoriteDatas);
    setMcpeItems(mcpeFavoriteDatas);
  }

  useFocusEffect(
    React.useCallback(() => {
      getAllFavorites();
    }, [])
  );

  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        barStyle="dark-content"
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: 200, backgroundColor: type == 'melon' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setType('melon')}
        >
          <Text style={{ fontWeight: type == 'melon' ? 'bold' : null }}>Melon mods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: 200, backgroundColor: type == 'mcpe' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setType('mcpe')}
        >
          <Text style={{ fontWeight: type == 'mcpe' ? 'bold' : null }}>MCPE mods</Text>
        </TouchableOpacity>
      </View>

      {type == 'melon' && melonItems.length === 0 && <Text style={{ color: 'gray', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>Empty</Text>}
      {type == 'melon' && <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 8 }}>
          {melonItems.map(mod => (
            <TouchableOpacity
              style={{ flexDirection: 'row' }} key={mod.name}
              onPress={() => navigation.navigate('MelonDetail', { data: mod })}
            >
              <ImageBackground source={{ uri: mod.image }} style={{ margin: 10, width: 100, height: 100 }} imageStyle={{ borderRadius: 10, resizeMode: 'cover' }} />
              <View style={styles.modItemRight}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00695C' }}>{mod.name}</Text>
                <Text style={{ marginTop: 4, marginBottom: 4 }}>{mod.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>}

      {type == 'mcpe' && mcpeItems.length === 0 && <Text style={{ color: 'gray', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>Empty</Text>}
      {type == 'mcpe' && <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 8 }}>
          {mcpeItems.map(mod => (
            <TouchableOpacity
              style={{ flexDirection: 'row' }} key={mod._id}
              onPress={() => navigation.navigate('MCPEDetail', { msg: mod.title, addonId: mod._id })}
            >
              <ImageBackground source={{ uri: 'https://storage.uk.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/mcpe-assets/' + mod.imgs[0] }} style={{ margin: 10, width: 100, height: 100 }} imageStyle={{ borderRadius: 10, resizeMode: 'cover' }} />
              <View style={styles.modItemRight}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00695C' }}>{mod.title}</Text>
                <Text style={{ marginTop: 4, marginBottom: 4 }}>{mod.text.substr(0, 90) + '...'}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modItemRight: {
    flex: 1, marginTop: 8, marginRight: 8, marginBottom: 8, padding: 8
  },
});
