import React, { useLayoutEffect, useState } from 'react'
import {
    StyleSheet, Image, Text, Dimensions, ScrollView, View, TouchableOpacity, Platform
} from 'react-native';
import step0 from '../assets/melonsteps/step1.jpg';
import step1 from '../assets/melonsteps/step2.jpg';
import step2 from '../assets/melonsteps/step3.jpg';
import { StatusBar } from 'react-native';

const width = Platform.isPad ? Dimensions.get('window').width * 0.7 : Dimensions.get('window').width;

const MelonTutorial = ({ route, navigation }) => {

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Tutorial</Text>
                </View>
            ),
        });
    }, [navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
            <StatusBar translucent barStyle="dark-content" />
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>How to import mod to Melon Playground</Text>
                    <Text style={styles.step}>Step 1: Download mod and click import</Text>
                    <Image source={step0} style={{ borderRadius: 20, width: width - 20, height: width - 20, marginBottom: 10, resizeMode: 'contain' }} />
                    <Text style={styles.step}>Step 2: Click on Melon PG game icon</Text>
                    <Image source={step1} style={{ borderRadius: 20, width: width - 20, height: width - 20, marginBottom: 10, resizeMode: 'contain' }} />
                    <Text style={styles.step}>Open Melon game and enjoy</Text>
                    <Image source={step2} style={{ borderRadius: 20, width: width - 20, height: width - 20, marginBottom: 10, resizeMode: 'contain' }} />
                </View>
                <View style={{ height: 200 }}></View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    step: { alignSelf: 'center', justifyContent: 'center', margin: 20, marginTop: 50 },
});

export default MelonTutorial