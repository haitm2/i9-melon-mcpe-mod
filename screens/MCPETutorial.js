import React, { useLayoutEffect, useState } from 'react'
import {
    StyleSheet, Image, Text, Dimensions, ScrollView, View
} from 'react-native';
import step0 from '../assets/mcpesteps/step0.jpg';
import step1 from '../assets/mcpesteps/step1.jpg';
import step2 from '../assets/mcpesteps/step2.jpg';
import { StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

const MCPETutorial = ({ route, navigation }) => {

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
            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.step}>Step 1: Download addon</Text>
                <Image source={step0} style={{ width: width - 20, height: width - 20, margin: 10 }} />
                <Text style={styles.step}>Step 2: Select 'Minecraft' app</Text>
                <Image source={step1} style={{ width: width - 20, height: width - 20, margin: 10 }} />
                <Text style={styles.step}>Enjoy!</Text>
                <Image source={step2} style={{ width: width - 20, height: width - 20, margin: 10 }} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    step: { alignSelf: 'center', justifyContent: 'center', marginTop: 20, fontWeight: 'bold' },
});

export default MCPETutorial