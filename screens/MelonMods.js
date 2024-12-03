import { ActivityIndicator, Alert, Dimensions, FlatList, ImageBackground, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { Image } from 'react-native';
import { AES, IAP, ModGetter } from '../utils';
import { set } from 'lodash';
import {
    requestTrackingPermissionsAsync
} from 'expo-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
        console.log('Permission status:', authorizationStatus);
    }
}

const width = Dimensions.get('window').width;
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
    ios: 'ca-app-pub-1354543839348242/1148828151',
    android: TestIds.INTERSTITIAL,
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);
const numColumns = 1;

const isShowATT = Platform.select({
    ios: true,
    android: false,
});

const emptyArr = [{ _id: "empty_0", name: "empty_0" }, { _id: "empty_1", name: "empty_1" }];

export default function Category() {

    const [categories, setCategories] = useState([
        {
            name: 'Skibidi',
            image: require('../assets/categories/Skibidi.jpeg')
        },
        {
            name: 'Anime',
            image: require('../assets/categories/Anime.jpeg')
        },
        {
            name: 'Robot',
            image: require('../assets/categories/Robot.jpeg')
        },
        {
            name: 'Super\nheroes',
            image: require('../assets/categories/Superheroes.jpeg')
        },
        {
            name: 'Buildings',
            image: require('../assets/categories/Buildings.jpeg')
        },
        {
            name: 'Cars',
            image: require('../assets/categories/Cars.jpeg')
        },
        {
            name: 'Weapons',
            image: require('../assets/categories/Weapons.jpeg')
        },
    ])
    const [bannerError, setBannerError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isPurchased, setPurchased] = useState(false);
    const [isShowWarning, setShowWarning] = useState(false);
    const [selectedCat, setSelectedCat] = useState('Skibidi');
    const [items, setItems] = useState([]);
    const [newMods, setNewMods] = useState([]);

    function sleep(ms) {
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

    let requestATT = async () => {
        if (isShowATT) {
            console.log("Requesting ATT");
            try {
                const { status } = await requestTrackingPermissionsAsync();
                if (status === 'granted') {
                    console.log('Yay! I have user permission to track data');
                } else {
                    console.log("ATT status =", status);
                }
            } catch (err) {
                console.log("ATT error:", err);
            }
        }
        await requestNotifyPermission();
    }

    const requestNotifyPermission = async () => {
        console.log(">>>>>>> requestNotifyPermission")
        await requestUserPermission();

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });

        messaging()
            .subscribeToTopic('melonmod')
            .then(() => console.log('Subscribed to topic!'));
    }

    React.useEffect(() => {
        console.log("Check IAP when open app to navigate to Inapp")
        IAP.isPurchased().then(result => {
            if (result === false) {
                navigation.navigate('Premium');
            }
        });
    }, [])

    const getFileName = (file) => {
        try {
            var temp = file.split('/');
            var fileName = temp[temp.length - 1];
            return fileName;
        } catch {
            return 'unknown';
        }
    }

    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Mods for Melon</Text>
                </View>
            )
        });
    }, [navigation]);

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

    const getModOfCategory = async () => {
        // await AsyncStorage.clear();
        setItems([]);
        const encryptedModsOfCategory = await axios.get('https://melon-mods.megatechlab.com/melonMods/' + selectedCat);
        const modsOfCategoryStr = await AES.decryptMelon(encryptedModsOfCategory.data)
        const modsOfCategory = JSON.parse(modsOfCategoryStr);
        setItems([]);
        setItems([...modsOfCategory.data, ...emptyArr]);
    }

    const getNewMods = async () => {
        // await AsyncStorage.clear();
        setNewMods([]);
        const encryptedModsOfCategory = await axios.get('https://melon-mods.megatechlab.com/melonMods/New');
        const modsOfCategoryStr = await AES.decryptMelon(encryptedModsOfCategory.data)
        const modsOfCategory = JSON.parse(modsOfCategoryStr);

        setNewMods(modsOfCategory.data);
    }

    const getCategories = async () => {
        // await AsyncStorage.clear();
        const encryptedCategories = await axios.get('https://melon-mods.megatechlab.com/melonCategories');

        const categoriesStr = await AES.decryptMelon(encryptedCategories.data)
        const categories = JSON.parse(categoriesStr);

        const temp = [];
        for (const category of categories.data) {
            // if (category !== 'New') temp.push(category);
            temp.push(category);
        }
        setCategories(temp);
    }

    useEffect(() => {
        // getCategories();
    }, [])

    useEffect(() => {
        getModOfCategory();
    }, [selectedCat])

    useEffect(() => {
        getNewMods();
    }, [])

    useEffect(() => {
        requestATT();
    }, [])

    return (
        <ScrollView style={styles.container}>
            <StatusBar
                translucent
                barStyle="dark-content"
            />

            <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, marginTop: 10 }}>New releases</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                    {newMods.map(mod => (
                        <TouchableOpacity
                            key={mod._id} style={{ margin: 10 }}
                            onPress={async () => {
                                // if (!isPurchased) {
                                //     if (loaded) {
                                //         interstitial.show();
                                //         setLoaded(false);
                                //         interstitial.load();
                                //     } else {
                                //         interstitial.load();
                                //     }
                                // }
                                var downloads = [];
                                for (var file of mod.files) {
                                    downloads.push({ url: file, title: getFileName(file) })
                                }
                                set(mod, 'downloads', downloads);
                                await sleep(100);
                                navigation.navigate('MelonDetail', { data: mod });
                            }}
                        >
                            <ImageBackground style={styles.newItemImage} source={{ uri: mod.image }} imageStyle={{ borderRadius: 20 }} />
                            <View style={{ width: 200, flexDirection: 'row', marginTop: 10 }}>
                                <View style={{ width: Platform.isPad ? 80 : 40, height: Platform.isPad ? 80 : 40, marginRight: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#004D40' }}>
                                    <View style={{ position: 'absolute', top: 5, right: 5 }}>
                                        <Ionicons name="flame" color='#FFF' size={Platform.isPad ? 30 : 10} />
                                    </View>
                                    <Text style={{ fontWeight: 'bold', fontSize: Platform.isPad ? null : 10, color: '#FFF' }}>new</Text>
                                </View>
                                <View style={{ width: 150 }}>
                                    <Text style={{ width: 150, fontSize: 16 }}>{mod.name.length < 30 ? mod.name : mod.name.substr(0, 30) + '...'}</Text>
                                    <Text style={{ width: 150, fontSize: 14, marginTop: 10 }}>{mod.fileCount + " submods"}</Text>
                                    <View style={{ width: 150, flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 14, marginTop: 10, color: '#90A4AE' }}>{mod.downloads}</Text>
                                        <Ionicons name="download-outline" color='#90A4AE' size={20} />
                                    </View>
                                </View>
                            </View>
                            {!isPurchased && !mod.isFree && <View style={styles.lockView}>
                                <Ionicons name="lock-closed" color='#616161' size={20} />
                            </View>}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {bannerError || isPurchased ?
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

            <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, marginTop: 10 }}>Quick actions</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={styles.quickAction}
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
                        navigation.navigate('MelonSearch')
                    }}>
                    <View style={{ margin: 20 }}>
                        <Ionicons
                            name='search' size={24}
                            color='#00695C'
                        />
                    </View>
                    <Text style={{ flex: 1, margin: 20 }}>{"Search\nmods"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickAction}
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
                        navigation.navigate('RequestMod')
                    }}
                >
                    <View style={{ margin: 20 }}>
                        <Ionicons
                            name='mail' size={24}
                            color='#00695C'
                        />
                    </View>
                    <Text style={{ flex: 1, margin: 20 }}>{"Request\nmods"}</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, marginTop: 20 }}>Categories</Text>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: Platform.isPad ? 200 : 100 }}>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.name}
                            style={{ backgroundColor: selectedCat === category.name ? '#B0BEC5' : '#FFF', width: Platform.isPad ? 190 : 90, height: Platform.isPad ? 190 : 90, marginTop: 10, marginLeft: 10 }}
                            onPress={() => {
                                setSelectedCat(category.name);
                            }}
                        >
                            <Image source={category.image} style={{ width: Platform.isPad ? 180 : 80, height: Platform.isPad ? 180 : 80, marginLeft: 5, marginTop: 5 }} />
                            <Text style={{ position: 'absolute', bottom: 8, left: 18, fontSize: 12, fontWeight: 'bold', color: '#FFF' }}>{category.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ width: Platform.isPad ? width - 200 : width - 100 }}>
                    {items.length === 0 && <ActivityIndicator size={'large'} color={'#000'} />}
                    {items.map(item => (
                        <TouchableOpacity
                            style={styles.melonItem}
                            key={'modsss_' + item._id}
                            activeOpacity={1}
                            onPress={async () => {
                                // if (!isPurchased) {
                                //     if (loaded) {
                                //         interstitial.show();
                                //         setLoaded(false);
                                //         interstitial.load();
                                //     } else {
                                //         interstitial.load();
                                //     }
                                // }
                                if (!item.name.includes('empty_')) {
                                    var downloads = [];
                                    for (var file of item.files) {
                                        downloads.push({ url: file, title: getFileName(file) })
                                    }
                                    set(item, 'downloads', downloads);
                                    await sleep(100);
                                    navigation.navigate('MelonDetail', { data: item });
                                }
                            }}
                        >
                            {!item.name.includes('empty_') && <ImageBackground source={{ uri: item.image }} style={styles.itemImg} imageStyle={{ borderRadius: 10 }} >
                                {!isPurchased && !item.isFree && <View style={styles.lockView}>
                                    <Ionicons name="lock-closed" color='#616161' size={20} />
                                </View>}
                            </ImageBackground>}
                            {!item.name.includes('empty_') && <View style={{ width: width - 240 }}>
                                <Text style={styles.itemtext}>{item.name}</Text>
                                <Text style={{ fontSize: 14, marginTop: 10 }}>{item.fileCount + " submods"}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 14, marginTop: 10, color: '#90A4AE' }}>{item.downloads}</Text>
                                    <Ionicons name="download-outline" color='#90A4AE' size={20} />
                                </View>
                            </View>}
                        </TouchableOpacity>
                    ))}

                </View>
            </View>

            {isShowWarning && <View
                style={{ width: width - 20, height: width / 2 + 20, backgroundColor: '#2c2c2c', padding: 8, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 200, alignSelf: 'center', borderWidth: 2, borderColor: '#EEEEEE' }}
            >
                <Text style={{ color: '#fff' }}> Please install "Melon Playground" before using this application. </Text>
                <TouchableOpacity
                    style={{ width: 150, height: 50, backgroundColor: '#fff', padding: 8, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: -20, alignSelf: 'center', borderWidth: 2, borderColor: '#EEEEEE' }}
                    onPress={() => setShowWarning(false)}
                >
                    <Text style={{ color: '#000' }}> OK </Text>
                </TouchableOpacity>
            </View>}

        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        height: '100%'
    },
    item: {
        margin: 5,
        borderWidth: 2,
        borderColor: '#424242'
    },
    itemImg: {
        margin: 10, width: Platform.isPad ? 180 : 100, height: Platform.isPad ? 180 : 100, borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    itemtext: {
        width: '100%',
        color: '#000',
        fontSize: 16,
        marginTop: 10,
        flexShrink: 1
    },
    itemtextBg: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: 10,
        margin: 5,
        resizeMode: 'contain',
        backgroundColor: 'rgba(52, 52, 52, 0.6)',
    },
    centerbarbtn: {
        position: 'absolute',
        alignSelf: 'center',
        top: -15
    },
    homebarbtn: {
        position: 'absolute',
        left: width / 4 - 30,
        top: -15
    },
    historybarbtn: {
        position: 'absolute',
        right: width / 4 - 30,
        top: -15
    },
    melonItem: {
        flexDirection: 'row', width: Platform.isPad ? width - 220 : width - 120, height: Platform.isPad ? 220 : 120, marginLeft: 10, marginTop: 10, marginRight: 10, borderRadius: 20,
    },
    newItemImage: {
        width: Platform.isPad ? 400 : 200, height: Platform.isPad ? 300 : 150,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    quickAction: {
        width: width / 2 - 30,
        margin: 10, backgroundColor: '#ECEFF1', flexDirection: 'row', borderRadius: 24,
    },
    lockView: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 15 }
});
