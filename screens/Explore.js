import { ActivityIndicator, Alert, Dimensions, FlatList, ImageBackground, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { Image } from 'react-native';
import { IAP, ModGetter } from '../utils';
import { set } from 'lodash';
import {
    requestTrackingPermissionsAsync
} from 'expo-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const categories = [
    { name: "Skibidi", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/skibidi-toilet-v5-small.jpeg" },
    { name: "Superheroes", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Superheroes/tor.jpg" },
    { name: "Christmas", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Christmas/752018d2-18a0-1730-2651-7516df37d2a0.png" },
    { name: "Anime", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/ItadoriAndSukuna.png" },
    { name: "FNAF", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/FNaF-Animatronics.webp" },
    { name: "Robot", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/BipedalMecha.png" },
    { name: "Military", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Military/20221023024305-6354aa39ab2cf.jpg" },
    { name: "Weapons", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/20220924024252-632e6eac312a5.webp" },
    { name: "Helicopter", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Items/20221023024137-6354a9e1ad305.jpg" },
    { name: "Buildings", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/Miniature-Medieval.webp" },
    { name: "Cars", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Cars/20221023024136-6354a9e0b7464.jpg" },
    { name: "Ship", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Buildings/20221023024151-6354a9efab8c6.jpg" },
    { name: "Items", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Items/20221023023550-6354a886396b9.jpg" },
    { name: "NPC", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/NPC/beth.jpg" },
    { name: "Minecraft", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/Minecraft-Blocks-Tools-Weapons-Item-Mods.webp" },
    { name: "Game", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/PLANTS-VS-ZOMBIES-.webp" },
    { name: "Wubbox", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/mods/plant_wubbox.jpg" },
    { name: "Animals", image: "https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/melon-mods/Animals/vltzyu0t.jpg" },
    { name: "empty_0", image: "" },
    { name: "empty_1", image: "" }
]

const width = Dimensions.get('window').width;
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
    ios: 'ca-app-pub-1354543839348242/1148828151',
    android: TestIds.INTERSTITIAL,
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

const isShowATT = Platform.select({
    ios: true,
    android: false,
});

const emptyArr = [{ name: "empty_0" }, { name: "empty_1" }, { name: "empty_3" }, { name: "empty_4" }];

export default function Explore() {

    const [bannerError, setBannerError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isPurchased, setPurchased] = useState(false);
    const [isShowWarning, setShowWarning] = useState(false);
    const [newItems, setNewItems] = useState([])

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
                    <Image source={require('../assets/title.png')} style={{ width: 80, height: 30, resizeMode: 'contain' }} />
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


    const getNewMods = async () => {
        setNewItems([]);
        const newMods = await axios.get('https://melon-mods.megatechlab.com/mods/New');
        setNewItems(newMods.data.data);
    }

    // const getCategories = async () => {
    //     // await AsyncStorage.clear();
    //     const categories = await axios.get('https://melon-mods.megatechlab.com/categories');
    //     // const temp = ['Buildings'];
    //     const temp = [];
    //     for (const category of categories.data.data) {
    //         // if (category !== 'New') temp.push(category);
    //         temp.push(category);
    //     }
    //     setCategories(temp);
    // }

    // useEffect(() => {
    //     getCategories();
    // }, [])

    useEffect(() => {
        getNewMods();
    }, [])

    useEffect(() => {
        requestATT();
    }, [])

    return (
        <View style={styles.container}>
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

            <ScrollView>
                <Text style={[styles.categoryText]}>New mods</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} height={width / 2} >
                    {newItems.length === 0 && <ActivityIndicator size={'large'} color={'#000'} />}
                    {newItems.length > 0 && <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 0, height: width / 2 - 15 }}>
                        {newItems.slice(0, 12).map(item => (
                            <TouchableOpacity
                                key={'mods_' + item.name}
                                activeOpacity={1}
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
                                    if (!item.name.includes('empty_')) {
                                        var downloads = [];
                                        for (var file of item.files) {
                                            downloads.push({ url: file, title: getFileName(file) })
                                        }
                                        set(item, 'downloads', downloads);
                                        navigation.navigate('MelonDetail', { data: item });
                                    }
                                }}
                            >
                                {!item.name.includes('empty_') ? <View>
                                    <Image source={{ uri: item.image }} style={[styles.item, { width: width / 2 - 15, height: width / 2 - 15 }]} />
                                    <View style={[styles.itemtextBg, { width: width / 2 - 15 }]}>
                                        <Text style={styles.itemtext}>{item.name}</Text>
                                    </View>
                                    <View style={{ position: 'absolute', top: 10, right: 10 }}>
                                        {isPurchased || item.isFree === true ? null : <Ionicons name="lock-closed" color='#fff' size={20} />}
                                    </View>
                                </View> : <View style={{ height: 200 }} />}
                            </TouchableOpacity>
                        ))}
                    </View>}
                </ScrollView>

                <Text style={[styles.categoryText]}>Categories</Text>

                {categories.map(category => (
                    <TouchableOpacity
                        key={'mods_' + category.name}
                        activeOpacity={1}
                    >
                        {!category.name.includes('empty_') ? <View>
                            <Image source={{ uri: category.image }} style={[styles.item, { margin: 10, width: width - 20, height: width / 4 }]} />
                            <View style={[styles.itemtextBg, { width: width - 20, margin: 10, height: width / 4, justifyContent: 'center' }]}>
                                <Text style={[styles.itemtext, { fontSize: 24, alignSelf: 'center' }]}>{category.name}</Text>
                            </View>
                        </View> : <View style={{ height: 100 }} />}
                    </TouchableOpacity>
                ))}
            </ScrollView>

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

        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#BDBDBD',
        alignItems: 'center',
    },
    item: {
        margin: 5,
        borderWidth: 2,
        borderColor: '#424242'
    },
    itemtext: {
        color: 'white',
        fontSize: 12,
        flexShrink: 1
    },

    categoryText: {
        color: '#000',
        fontSize: 18,
        flexShrink: 1,
        marginTop: 16,
        marginLeft: 8
    },

    itemtextBg: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: 10,
        margin: 5,
        resizeMode: 'contain',
        backgroundColor: 'rgba(52, 52, 52, 0.25)',
    },
    bottombar: {
        position: 'absolute', bottom: 0, left: 0, right: 0, width: width, justifyContent: 'center', height: 60,
        backgroundColor: '#424242',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 2,
    },
    capturebtn: {
        backgroundColor: '#616161', borderWidth: 8, borderColor: '#424242', width: 80, height: 80, position: 'absolute', bottom: 10, alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center'
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
});
