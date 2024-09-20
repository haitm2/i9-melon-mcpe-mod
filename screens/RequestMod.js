import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Platform, Linking, Dimensions, ImageBackground, PermissionsAndroid, TextInput } from 'react-native';
import { StatusBar } from 'react-native';
import InAppReview from 'react-native-in-app-review';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useFocusEffect } from '@react-navigation/native';
import { IAP } from '../utils';
import email from 'react-native-email';

const { width } = Dimensions.get('window');

export default function RequestMod({ navigation, route }) {

  const [type, setType] = useState('melon');
  const [selectedMelonType, setSelectedMelonType] = useState('Skibidi');
  const [selectedMCPEType, setSelectedMCPEType] = useState('Addons');
  const [message, setMessage] = useState('');

  useEffect(() => {
  }, [])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#000', alignSelf: 'center', fontWeight: 'bold', fontSize: 18 }}>Request mod</Text>
        </View>
      )
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.main}>
      <StatusBar
        translucent
        barStyle="dark-content"
      />

      <Text style={{ margin: 10, marginTop: 20, fontWeight: 'bold' }}>Do you want mods for Melon PG game or for MCPE?</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: 200, backgroundColor: type == 'melon' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setType('melon')}
        >
          <Text>Melon mods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: 200, backgroundColor: type == 'mcpe' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setType('mcpe')}
        >
          <Text style={{ fontWeight: type == 'mcpe' ? 'bold' : null }}>MCPE mods</Text>
        </TouchableOpacity>
      </View>

      {type == 'melon' && <Text style={{ margin: 10, marginTop: 20, fontWeight: 'bold' }}>Choose the type of melon mod you want</Text>}
      {type == 'melon' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Skibidi' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Skibidi')}
        >
          <Text>Skibidi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Anime' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Anime')}
        >
          <Text>Anime</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Cars' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Cars')}
        >
          <Text>Cars</Text>
        </TouchableOpacity>
      </View>}
      {type == 'melon' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Buildings' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Buildings')}
        >
          <Text>Buildings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Superheroes' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Superheroes')}
        >
          <Text>Superheroes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Weapons' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Weapons')}
        >
          <Text>Weapons</Text>
        </TouchableOpacity>
      </View>}
      {type == 'melon' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Robot' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Robot')}
        >
          <Text>Robot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Tank' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Tank')}
        >
          <Text>Tank</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMelonType == 'Others' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMelonType('Others')}
        >
          <Text>Others</Text>
        </TouchableOpacity>
      </View>}

      {type == 'mcpe' && <Text style={{ margin: 10, marginTop: 20, fontWeight: 'bold' }}>Choose the type of mcpe mod you want</Text>}
      {type == 'mcpe' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMCPEType == 'Addons' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMCPEType('Addons')}
        >
          <Text>Addons</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMCPEType == 'Maps' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMCPEType('Maps')}
        >
          <Text>Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMCPEType == 'Seeds' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMCPEType('Seeds')}
        >
          <Text>Seeds</Text>
        </TouchableOpacity>
      </View>}
      {type == 'mcpe' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMCPEType == 'Skins' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMCPEType('Skins')}
        >
          <Text>Skins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: width / 3, backgroundColor: selectedMCPEType == 'Textures' ? '#CFD8DC' : '#ECEFF1', padding: 20, alignItems: 'center' }}
          onPress={() => setSelectedMCPEType('Textures')}
        >
          <Text>Textures</Text>
        </TouchableOpacity>
      </View>}

      <Text style={{ margin: 10, marginTop: 20, fontWeight: 'bold' }}>Detailed description of this mod or link of the mod you want me to add to the app</Text>
      <TextInput
        style={{ margin: 10, borderTopRightRadius: 10, height: 200, padding: 10, backgroundColor: '#ECEFF1' }}
        placeholder='Write more here...'
        value={message}
        multiline
        onChangeText={message => setMessage(message)}
      />
      <TouchableOpacity
        style={{ alignItems: 'center', backgroundColor: message == '' ? 'gray' : '#004D40', margin: 10, padding: 10, width: width - 20 }}
        onPress={() => {
          if (message == '') alert('Please write a detailed description of the mod you want me to add to this app');
          else {
            const to = 'ducvippro2k5@gmail.com'
            const body = type == 'melon' ? 'Mod type: ' + selectedMelonType + "\nDescription: " + message : 'Mod type: ' + selectedMCPEType + "\nDescription: " + message;
            email(to, {
              subject: 'Request mod for game' + type,
              body
            }).catch(
              alert("Install an email app on your phone to send mod requests to the developer")
            )
          }
        }}
      >
        <Text style={{ color: '#FFF', textAlign: 'center' }}>{"Send mod request email\nto developer"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: width, backgroundColor: '#ECEFF1', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row',
    paddingTop: 20, paddingBottom: 40, alignSelf: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  }
});
