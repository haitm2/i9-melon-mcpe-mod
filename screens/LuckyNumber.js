import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Platform, Linking, Dimensions, ImageBackground, PermissionsAndroid, TextInput, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import InAppReview from 'react-native-in-app-review';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LuckyNumber({ navigation, route }) {

  const [number, setNumber] = useState('');

  useEffect(() => {
  }, [])

  const reachPremium = async () => {
    await AsyncStorage.setItem("lucky_purchased", "ok");
    navigation.goBack();
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#000', alignSelf: 'center', fontWeight: 'bold', fontSize: 18 }}>Lucky number</Text>
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

      <Text style={{ margin: 10, marginTop: 20, fontWeight: 'bold' }}>Enter any 7-digit number, if you are lucky you will get to use the application for free for life.</Text>

      <TextInput
        style={{ margin: 10, borderTopRightRadius: 10, height: 200, padding: 10, backgroundColor: '#ECEFF1' }}
        placeholder='Enter any 7-digit number...'
        value={number}
        multiline
        onChangeText={number => setNumber(number)}
      />

      <TouchableOpacity
        style={{ alignItems: 'center', backgroundColor: number == '' ? 'gray' : '#004D40', margin: 10, padding: 10, width: width - 20 }}
        onPress={() => {
          if (number == '' || number.length !== 7) alert('Enter any 7-digit number');
          else {
            var endDate = 1730961980000;
            const d = new Date().getTime();
            console.log(">>>>>", d)
            if (number == '1846275' && d < endDate) {
              Alert.alert(
                'Congratulations',
                'You are one lucky person. You will get to use this app for free for life.',
                [
                  {
                    text: "OK",
                    onPress: async () => await reachPremium()
                  }
                ]
              );
            } else {
              Alert.alert(
                'You\'re not so lucky',
                'Try again next time',
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            }
          }
        }}
      >
        <Text style={{ color: '#FFF', textAlign: 'center' }}>{"I feel lucky!"}</Text>
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
