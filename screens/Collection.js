import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('window').width;
const type = "melon";

export default function Collection({ navigation, route }) {

  const [melonItems, setMelonItems] = useState([]);

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
    }
    console.log('=====> melonFavoriteDatas:', melonFavoriteDatas);
    setMelonItems(melonFavoriteDatas);
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
