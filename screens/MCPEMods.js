import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { View, Text, ActivityIndicator, FlatList, Image, Alert, TouchableOpacity, RefreshControl, Linking, ImageBackground, Dimensions } from 'react-native';
import axios from 'axios';
import { get, set } from 'lodash';
import { Rating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AES, IAP } from '../utils';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
    ios: 'ca-app-pub-8168306793879841/1343150419',
    android: TestIds.INTERSTITIAL,
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);
const width = Dimensions.get('window').width;

let startValue = Math.floor(Math.random() * 4000) + 1;
export default function MCPEMods({ navigation }) {
    const [addons, setAddons] = useState([]);
    const [sort, setSort] = useState('latest');
    const [start, setStart] = useState(startValue);
    const [cat, setCat] = useState('all');
    const [refreshing, setRefreshing] = React.useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isPurchased, setPurchased] = useState(false);
    const [bannerError, setBannerError] = useState(false);

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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Mods for Minecraft</Text>
                </View>
            )
        });
    }, [navigation]);

    // React.useEffect(() => {
    //     console.log("Check IAP when open app to navigate to Inapp")
    //     IAP.isPurchased().then(result => {
    //         if (result === false) {
    //             navigation.navigate('Premium');
    //         }
    //     });
    // }, [])

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        startValue = Math.floor(Math.random() * 4000) + 1;
        setStart(startValue);
        setRefreshing(false);
    }, []);

    const getAddons = async () => {
        // setIsLoading(true);
        // setAddons([]);
        const params = { start, sort, cat };
        const data = await axios.get('https://addons.magicdev.fun/addons4', { params });
        // const decryptedData = AES.decryptMCPE(data.data.data);
        // console.log(decryptedData);
        // const objData = JSON.parse(decryptedData);
        const objData = data.data;
        if (start === startValue) {
            setAddons(objData);
        } else {
            setAddons([...addons, ...objData]);
        }
        setRefreshing(false);
        // setIsLoading(false);
    }

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={{
                    flex: 1,
                    borderRadius: 10,
                    margin: 5
                }}
                onPress={async () => {
                    if (!isPurchased) {
                        if (loaded) {
                            interstitial.show();
                            setLoaded(false);
                            interstitial.load();
                        } else {
                            interstitial.load();
                        }
                    }
                    navigation.navigate('MCPEDetail', {
                        msg: get(item, 'title'),
                        addonId: get(item, '_id'),
                    })
                }}
            >
                <Image source={{ uri: 'https://storage.uk.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/mcpe-assets/' + get(item, 'image') }} style={{ height: width / 2, width: '100%', flex: 1, borderRadius: 20 }} />
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={{ borderRadius: 10, marginTop: 10, marginRight: 10, width: 80, height: 80, backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', padding: 5, fontWeight: 'bold', borderRadius: 5, marginLeft: 5, textAlign: 'center' }}>{get(item, 'type') == "mcworld" ? "MC\nWORLD" : "MC\nPACK"}</Text>
                    </View>
                    <View style={{ width: width - 120 }}>
                        <Text style={{ marginTop: 10 }}>{get(item, 'title')}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', marginTop: 10 }}>
                            <Rating
                                readonly
                                imageSize={15}
                                startingValue={get(item, 'stat.rate.avg')}
                                ratingCount={5}
                                style={{ alignSelf: 'flex-start', color: 'yellow', backgroundColor: 'yellow' }}
                            />
                            <Text style={{ fontSize: 10 }}>({get(item, 'stat.rate.count')})</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', padding: 5 }}>
                            <Ionicons
                                name="download-outline"
                                size={15}
                                color="gray"
                            />
                            <Text style={{ fontSize: 10, padding: 5, color: 'gray' }}>{get(item, 'stat.download.count')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const loadMoreAddon = () => {
        console.log("loading more ....");
        setStart(start + 15);
    }

    useEffect(() => {
        getAddons();
    }, [start])

    useEffect(() => {
        setAddons([])
        getAddons();
    }, [sort, cat])

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ flexDirection: 'row' }}
                    onPress={() => {
                        Alert.alert(
                            "Sort addons",
                            "Please choose sort option",
                            [
                                {
                                    text: "Latest",
                                    onPress: () => {
                                        setSort("latest");
                                        // getAddons(start, 'latest', cat);
                                    },
                                },
                                {
                                    text: "Top rate",
                                    onPress: () => {
                                        setSort("rate");
                                        // getAddons(start, 'rate', cat);
                                    },
                                },
                                {
                                    text: "Most download",
                                    onPress: () => {
                                        setSort("download");
                                        // getAddons(start, 'download', cat);
                                    },
                                }
                            ]
                        );
                    }}
                >
                    <Text style={{ marginRight: 10 }}>Sort</Text>
                    <Ionicons
                        name='list' size={20} style={{ marginRight: 20 }}
                        text="Latest"
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <View style={{ backgroundColor: '#FFF', flex: 1, paddingLeft: 5, paddingRight: 5 }}>
            <StatusBar translucent barStyle="dark-content" />
            <View style={{ width: width, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{ backgroundColor: cat == 'all' ? '#1B5E20' : '#B0BEC5', padding: 10, borderRadius: 10, margin: 5 }}
                    onPress={() => setCat('all')}
                >
                    <Text style={{ color: cat == 'all' ? '#FFF' : '#000' }}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: cat == 'mcworld' ? '#1B5E20' : '#B0BEC5', padding: 10, borderRadius: 10, margin: 5 }}
                    onPress={() => setCat('mcworld')}
                >
                    <Text style={{ color: cat == 'all' ? '#FFF' : '#000' }}>McWorld</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: cat == 'mcpack' ? '#1B5E20' : '#B0BEC5', padding: 10, borderRadius: 10, margin: 5 }}
                    onPress={() => setCat('mcpack')}
                >
                    <Text style={{ color: cat == 'all' ? '#FFF' : '#000' }}>McPack</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ position: 'absolute', top: 10, right: 16 }}
                    onPress={() => navigation.navigate('MCPESearch')}
                >
                    <Ionicons
                        name="search"
                        size={24}
                        color="#000"
                    />
                </TouchableOpacity>
            </View>
            {bannerError || isPurchased ?
                null :
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                    <BannerAd
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                            ios: 'ca-app-pub-9597010572153445/9698538496',
                            android: TestIds.BANNER,
                        })}
                        onAdFailedToLoad={(error) => {
                            console.log(error);
                            setBannerError(true);
                        }}
                    />
                </View>
            }
            {addons.length === 0 ? <ActivityIndicator size="large" color="#0000ff" /> : null}
            <FlatList
                data={addons}
                renderItem={renderItem}
                keyExtractor={item => get(item, '_id')}
                initialNumToRende={15}
                ListFooterComponent={<ActivityIndicator size="large" color="#0000ff" />}
                onEndReached={loadMoreAddon}
                onEndReachedThreshold={1}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </View>
    )
}