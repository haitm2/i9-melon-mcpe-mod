import React, { useLayoutEffect, useState } from 'react'
import {
    Image, Text,
    View,
    ActivityIndicator,
    ScrollView,
    ImageBackground,
    Alert,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { get, set } from 'lodash';
import { Rating } from 'react-native-ratings';
import { Button } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob';
import { useFocusEffect } from '@react-navigation/native';
import { IAP } from '../utils';
import InAppReview from 'react-native-in-app-review';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import * as Sharing from 'expo-sharing';
import * as FileSystemIOS from 'expo-file-system';

const width = Dimensions.get('window').width;

const MCPEDetail = ({ route, navigation }) => {

    const [addon, setAddon] = useState(null);
    const [images, setImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isBookMark, setIsBookMark] = useState(false);
    const [showBookmarkSpinner, setShowBookmarkSpinner] = useState(false);
    const [downloads, setDownloads] = useState([]);
    const [percent, setPercent] = useState(0);
    const [bannerError, setBannerError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isPurchased, setPurchased] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            IAP.isPurchased().then(result => {
                console.log("isPurchased =", result);
                setPurchased(result)
            });
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functionss
            };
        }, [])
    );

    const getAddon = async () => {
        try {
            const url = 'https://addons.magicdev.fun/addons4/' + route.params.addonId;
            const data = await axios.get(url);
            // const decryptedData = AES.decrypt(get(data, 'data.data'));
            // const addon = JSON.parse(decryptedData);
            setAddon(data.data);
            const images = [];
            for (const img of get(data.data, 'imgs')) {
                images.push('https://storage.uk.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/mcpe-assets/' + img);
            }
            setImages(images);
            console.log('images.length =', images.length);
            console.log("DEN DAY CHUA LOI");
            checkDownloaded(data.data);
        } catch (err) {
            console.log("DMMMMMMMM", err);
        }
    }

    const getReviews = async () => {
        try {
            const url = 'https://addons.magicdev.fun/addons4/' + route.params.addonId + '/reviews';
            const data = await axios.get(url);
            // const decryptedData = AES.decrypt(get(data, 'data.data'));
            // const addon = JSON.parse(decryptedData);
            // console.log(">>>>>>> REVIEWS:", data.data);
            setReviews(data.data);
        } catch (err) {
            console.log(err);
        }
    }

    const checkIsBookMark = async () => {
        const value = await AsyncStorage.getItem("mcpe_" + route.params.addonId);
        if (value) {
            setIsBookMark(true);
        } else {
            setIsBookMark(false);
        }
    }

    function changeDownloadStatus(url, status) {
        const temp = [];
        for (var i in downloads) {
            if (downloads[i].originUrl == url) {
                downloads[i].status = status;
            }
            temp.push(downloads[i]);
        }
        setDownloads(temp);
    }

    const checkDownloaded = (addon) => {
        const TRACK_FOLDER = RNFetchBlob.fs.dirs.DocumentDir;
        RNFetchBlob.fs.ls(TRACK_FOLDER).then(files => {
            console.log(files);
            const temp = []

            for (const download of get(addon, 'downloads')) {
                // console.log(download);
                if (files.includes(getFileName(get(download, 'originUrl')))) {
                    set(download, 'status', 2);
                    temp.push(download);
                } else {
                    set(download, 'status', 0);
                    temp.push(download);
                }
            }

            setDownloads(temp);
        }).catch(error => console.log("DMMMMM", error))
    }

    const showRateDialog = () => {
        const isAvailable = InAppReview.isAvailable();

        if (isAvailable) {
            InAppReview.RequestInAppReview()
                .then((hasFlowFinishedSuccessfully) => {
                    // when return true in android it means user finished or close review flow
                    console.log('InAppReview in android', hasFlowFinishedSuccessfully);

                    // 3- another option:
                    if (hasFlowFinishedSuccessfully) {
                        console.log('rated!');
                    }
                })
                .catch((error) => {
                    console.log(">>>> LMM:", error);
                });
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            if (downloads.length > 0) {
                checkDownloaded(addon);
            }
        }, [])
    );

    const setBookMark = async () => {
        setShowBookmarkSpinner(true);
        try {
            if (!isBookMark) {
                console.log('setting bookmark of addon', route.params.addonId, 'to true');
                if (Object.keys(addon).length !== 0) {
                    await AsyncStorage.setItem(
                        "mcpe_" + route.params.addonId,
                        JSON.stringify(addon)
                    );
                    setIsBookMark(true);
                } else {
                    console.log('Save failed, no addon...');
                }
            } else {
                console.log('setting bookmark of addon', route.params.addonId, 'to false');
                await AsyncStorage.removeItem("mcpe_" + route.params.addonId);
                setIsBookMark(false);
            }
        } catch (err) {
            console.log(err);
        }
        setShowBookmarkSpinner(false);
    }

    const getFileName = (fileUrl) => {
        console.log('fileUrl:', fileUrl);
        const temp = fileUrl.split('/');
        if (temp && temp.length > 0) {
            console.log('fileName:', temp[temp.length - 1]);
            return temp[temp.length - 1];
        }
        return null;
    };

    const downloadFile = (fileUrl) => {
        try {
            console.log('downloading file', fileUrl);
            changeDownloadStatus(fileUrl, 1);
            console.log('changeDownloadStatus to 1');
            let RootDir = RNFetchBlob.fs.dirs.DocumentDir + '/';
            console.log("Downloading file to", RootDir + getFileName(fileUrl))

            RNFetchBlob
                .config({ path: RNFetchBlob.fs.dirs.DocumentDir + '/' + getFileName(fileUrl) })
                .fetch('GET', fileUrl)
                .then((res) => {
                    changeDownloadStatus(fileUrl, 2);
                    showRateDialog();
                    const path = res.path();
                    console.log("File save at path", path);
                })
        } catch (err) {
            console.log(err);
            changeDownloadStatus(fileUrl, 0);
        }
    };

    const shareFile = (fileUrl) => {
        const filePath = FileSystemIOS.documentDirectory + encodeURI(getFileName(fileUrl));
        Sharing.shareAsync('file://' + filePath);
    }

    React.useEffect(() => {
        getAddon();
        getReviews();
        checkIsBookMark();
    }, [])

    const bytesToSize = (bytes) => {
        var sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Mod detail</Text>
                </View>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.main}>
            <StatusBar translucent barStyle="dark-content" />
            <ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ height: width / 2, marginBottom: 10, flexDirection: 'row' }}>
                        {images && images.map(image => (
                            <ImageBackground key={image} source={{ uri: image }} style={{ marginLeft: 10, width: images && images.length == 1 ? width : width * 2 / 3, height: width / 2 }} imageStyle={{ borderRadius: 20 }} />
                        ))}
                    </View>
                </ScrollView>

                {addon && <View style={{ marginTop: 10, alignSelf: 'flex-end', marginRight: 10, width: 100, alignItems: 'center', backgroundColor: 'gray', padding: 5, borderRadius: 5 }}>
                    <Text style={{ color: 'white' }}>
                        {addon.type}
                    </Text>
                </View>}
                <View style={{ padding: 5, backgroundColor: 'white' }}>
                    <Text style={{ alignSelf: 'center', fontSize: 18, fontWeight: "bold" }}>{get(addon, 'title')}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'white' }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginTop: 5 }}>
                            <Rating
                                readonly
                                imageSize={15}
                                startingValue={get(addon, 'stat.rate.avg')}
                                ratingCount={5}
                                style={{ alignSelf: 'flex-start', marginLeft: 10 }}
                            />
                            <Text>({get(addon, 'stat.rate.count')})</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row-reverse', marginTop: 10 }}>
                        <Text>{get(addon, 'stat.download.count')}</Text>
                        <Ionicons name="download-outline" size={20} />
                    </View>
                </View>
                <View style={{ flex: 1, padding: 5 }}>
                    {downloads && downloads.map((item) => (
                        <View key={get(item, 'title')}>
                            <Button
                                icon={<Ionicons name={get(item, 'status') == 2 ? "share-outline" : "download-outline"} size={20} color="white" />}
                                title={'  ' + get(item, 'title') + ' (' + bytesToSize(get(item, 'length')) + ')  '}
                                buttonStyle={{
                                    backgroundColor: get(item, 'status') == 2 ? 'green' : 'orange',
                                    margin: 5,
                                    padding: 20,
                                    borderRadius: 20
                                }}
                                iconRight={get(item, 'status') == 2 ? true : false}
                                loading={get(item, 'status') == 1 ? true : false}
                                onPress={() => {
                                    if (get(item, 'status') == 0) {
                                        downloadFile(get(item, 'originUrl'))
                                    } else if (get(item, 'status') == 2) {
                                        shareFile(get(item, 'originUrl'));
                                    } else {
                                        console.log('downloading, cannot click...')
                                    }
                                }}
                            />
                        </View>
                    ))}
                </View>

                {bannerError || isPurchased ?
                    null :
                    <View style={{ width: '100%', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                        <BannerAd
                            size={BannerAdSize.MEDIUM_RECTANGLE}
                            unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                                ios: TestIds.BANNER,
                                android: TestIds.BANNER,
                            })}
                            // unitId={TestIds.BANNER}
                            onAdFailedToLoad={(error) => {
                                console.log(error);
                                setBannerError(true);
                            }}
                        />
                    </View>
                }

                {addon && <Text style={{ padding: 10 }}>{get(addon, 'text')}</Text>}
                {reviews.map((review) => (
                    <View style={{ backgroundColor: 'white' }} key={get(review, '_id')}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={{ uri: get(review, 'profile_picture') }} style={{ height: 50, width: 50, borderRadius: 25, margin: 10 }} />
                            <View style={{ flex: 1, margin: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>{get(review, 'username')}</Text>
                                <Rating
                                    readonly
                                    imageSize={15}
                                    startingValue={get(review, 'rate')}
                                    ratingCount={5}
                                    style={{ alignSelf: 'flex-start', marginTop: 10 }}
                                />
                                <Text style={{ marginTop: 10 }}>{get(review, 'text')}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: 'lightgray', height: 1 }} />
                    </View>
                ))}
                <View style={{ height: 200 }} />
            </ScrollView>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={{ width: width / 2 - 20, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => navigation.navigate('MCPETutorial')}
                >
                    <Ionicons
                        name="bulb-outline"
                        size={24}
                        color="#000"
                    />
                    <Text style={{ marginTop: 10 }}>Tutorial</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: width / 2 - 20, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setBookMark()}
                >
                    <Ionicons
                        name={isBookMark ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color="#000"
                    />
                    <Text style={{ marginTop: 10 }}>{isBookMark ? 'Remove from favorite' : 'Add to favorite'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
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

export default MCPEDetail