import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Platform, Linking, Dimensions, ImageBackground, PermissionsAndroid } from 'react-native';
import { StatusBar } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import InAppReview from 'react-native-in-app-review';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useFocusEffect } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import { get, set } from 'lodash';
import { Button } from 'react-native-elements';
import { IAP } from '../utils';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import * as FileSystemIOS from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyNativeModule = NativeModules.MyNativeModule;


const { width } = Dimensions.get('window');
var isIpad = Platform.isPad;
const PACKAGE_NAME = 'com.magicdev.mods.melon.playground';

export default function MelonDetail({ navigation, route }) {

  const mod = route.params.data;
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [isBookMark, setIsBookMark] = useState(false);

  const checkIsBookMark = async () => {
    console.log("Checking bookmark");
    const value = await AsyncStorage.getItem('melon_' + route.params.data.description.substr(0, 20).toLowerCase());
    if (value) {
      setIsBookMark(true);
    } else {
      setIsBookMark(false);
    }
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
          console.log(error);
        });
    }
  }

  const getFileName = (file) => {
    try {
      var temp = file.split('/');
      var fileName = temp[temp.length - 1];
      return fileName;
    } catch {
      return 'unknown';
    }
  }

  useFocusEffect(
    React.useCallback(() => {

      if (Platform.OS == 'android') {
        console.log('Check downloaded on android');
        checkAndroidDownloaded(mod);
      } else {
        console.log('Check downloaded on ios');
        checkIOSDownloaded(mod);
      }
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result)
      });
    }, [])
  );

  const shareAndroidFile = async (fileUrl) => {
    var fileToImport = getFileName(fileUrl);
    var type = fileToImport.includes('.melmod') ? 'Mods' : 'Saves';

    MyNativeModule.createOpenDocumentTreeIntent(fileToImport, type, async (_uri) => {
      console.log(">>>>>>>>>>>>>>>>", _uri);
      // await AsyncStorage.setItem("uri", _uri);
    });

    // const TRACK_FOLDER = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/`;
    // const filePath = TRACK_FOLDER + encodeURI(getFileName(fileUrl));

    // FileViewer.open(filePath, { showOpenWithDialog: true })
    //   .then(() => {
    //     console.log('success');
    //   })
    //   .catch(error => {
    //     console.log('err:', error);
    //   });


  }

  const shareIOSFile = (fileUrl) => {
    const filePath = FileSystemIOS.documentDirectory + encodeURI(getFileName(fileUrl));
    Sharing.shareAsync('file://' + filePath);

    // FileViewer.open(filePath, { showOpenWithDialog: true })
    //   .then(() => {
    //     console.log('success');
    //   })
    //   .catch(error => {
    //     console.log('err:', error);
    //   });
  }


  function changeDownloadStatus(url, status) {
    const temp = [];
    for (var i in downloads) {
      if (encodeURI(downloads[i].url) == url) {
        downloads[i].status = status;
      }
      temp.push(downloads[i]);
    }
    console.log(temp);
    setDownloads(temp);
  }

  const checkAndroidDownloaded = async (mod) => {
    try {

      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
    } catch (err) {
      console.warn(err);
    }
    // const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    // const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    // if (!readGranted || !writeGranted) {
    //   console.log('Read and write permissions have not been granted');
    //   const temp = []
    //   for (const download of get(mod, 'downloads')) {
    //     set(download, 'status', 0);
    //     temp.push(download);
    //   }
    //   setDownloads(temp)
    //   return;
    // } else {
    //   console.log('Read and write permissions have been granted');
    // }

    const TRACK_FOLDER = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
    RNFetchBlob.fs.ls(TRACK_FOLDER).then(files => {
      console.log("FILES:", files);
      const temp = []

      // console.log("Downloads:", get(mod, 'downloads'));

      for (const download of get(mod, 'downloads')) {
        // console.log(download);
        if (files.includes(getFileName(download.url))) {
          set(download, 'status', 2);
          temp.push(download);
        } else {
          set(download, 'status', 0);
          temp.push(download);
        }
      }

      setDownloads(temp);
    }).catch(error => {
      console.log("Dit me", error);
      const temp = []
      for (const download of get(mod, 'downloads')) {
        set(download, 'status', 0);
        temp.push(download);
      }
      setDownloads(temp)
    })
  }

  const checkIOSDownloaded = async (mod) => {
    const TRACK_FOLDER = RNFetchBlob.fs.dirs.DocumentDir;
    console.log("CHECKING TRACK_FOLDER", TRACK_FOLDER);
    RNFetchBlob.fs.ls(TRACK_FOLDER).then(files => {
      console.log("FILES >>>>>>>>>>", JSON.stringify(files));
      const temp = []

      for (const download of get(mod, 'downloads')) {
        if (files.includes(encodeURI(getFileName(download.url)))) {
          set(download, 'status', 2);
          temp.push(download);
        } else {
          set(download, 'status', 0);
          temp.push(download);
        }
      }

      setDownloads(temp);
    }).catch(error => console.log(error))
  }

  const downloadAndroidFile = async (fileUrl) => {
    try {
      console.log('downloading file', fileUrl);
      changeDownloadStatus(fileUrl, 1);
      console.log('changeDownloadStatus to 1');
      let RootDir = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
      console.log('RootDir:', RootDir);
      const { config } = RNFetchBlob;
      let options = {
        fileCache: true,
        addAndroidDownloads: {
          //Related to the Android only
          useDownloadManager: true,
          notification: true,
          path: RootDir + '/' + getFileName(fileUrl),
        },
      };
      config(options)
        .fetch('GET', fileUrl)
        .then(res => {
          changeDownloadStatus(fileUrl, 2);
          showRateDialog();
        })
        .catch(err => {
          console.log(err.message, err.code);
          if (err.message.includes('Download manager download failed')) {
            changeDownloadStatus(fileUrl, 2);
            showRateDialog();
          }
        });
    } catch (err) {
      console.log(err);
      changeDownloadStatus(fileUrl, 0);
    }
  };

  const downloadIOSFile = async (fileUrl) => {
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

  useEffect(() => {
    checkIsBookMark();
  }, [])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#000', alignSelf: 'center', fontWeight: 'bold', fontSize: 18 }}>Mods Detail</Text>
        </View>
      )
    });
  }, [navigation]);

  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        barStyle="dark-content"
      />
      <ScrollView>
        <View style={{ alignItems: 'center' }}>
          <Image source={{ uri: mod.image }} style={{ width: width, height: width * 2 / 3, backgroundColor: '#FFF', resizeMode: 'contain' }} />
          <Text style={{ margin: 10, marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>{mod.name}</Text>
          {bannerError || isPurchased || Platform.OS == 'android' ?
            null :
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
              <BannerAd
                size={BannerAdSize.LARGE_BANNER}
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
          <Text style={{ textAlign: 'justify', margin: 10 }}>{mod.description}</Text>
        </View>

        {downloads.map((item) => (
          <View key={item.title}>
            <Button
              icon={<Ionicons name={get(item, 'status') == 2 ? "share-outline" : "download-outline"} size={Platform.isPad ? 24 : 20} color="white" />}
              title={<Text style={{ color: '#fff' }}>{get(item, 'status') == 2 && (route.params.data.isFree === true || isPurchased === true) ? get(item, 'title') + '-Import mod' : get(item, 'status') == 2 ? get(item, 'title') + ' - Subscribe to import' : get(item, 'title') + '  '}</Text>}
              buttonStyle={{
                width: Platform.isPad ? '70%' : width - 20,
                alignSelf: 'center',
                backgroundColor: get(item, 'status') == 2 && (route.params.data.isFree === true || isPurchased === true) ? '#0097A7' : get(item, 'status') == 2 ? '#E65100' : '#004D40',
                margin: 5,
                padding: 20,
                borderRadius: 20,
                marginLeft: 20,
                marginRight: 20
              }}
              iconRight={get(item, 'status') == 2 ? true : false}
              loading={get(item, 'status') == 1 ? true : false}
              onPress={async () => {
                if (get(item, 'status') == 0) {
                  Platform.OS == 'android' ? await downloadAndroidFile(encodeURI(get(item, 'url'))) : await downloadIOSFile(encodeURI(get(item, 'url')))
                } else if (get(item, 'status') == 2) {
                  if (isPurchased || (!isPurchased && route.params.data.isFree === true)) {
                    Platform.OS == 'android' ? await shareAndroidFile(get(item, 'url')) : await shareIOSFile(encodeURI(get(item, 'url')));
                  } else {
                    navigation.navigate('Premium');
                  }
                } else {
                  console.log('downloading, cannot click...')
                }
              }}
            // onPress={testWrite}
            />
          </View>
        ))}

        <View style={{ height: 200 }} />
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={{ width: width / 2 - 20, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.navigate('MelonTutorial')}
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
          onPress={async () => {
            if (!isBookMark) {
              await AsyncStorage.setItem('melon_' + route.params.data.description.substr(0, 20).toLowerCase(), JSON.stringify(route.params.data));
              setIsBookMark(true);
            } else {
              await AsyncStorage.removeItem('melon_' + route.params.data.description.substr(0, 20).toLowerCase());
              setIsBookMark(false);
            }

          }}
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
