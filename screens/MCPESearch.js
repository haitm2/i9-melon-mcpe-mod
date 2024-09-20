import React, { useState, useEffect, useLayoutEffect } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Image, Linking, ImageBackground, StyleSheet, TextInput } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Rating } from "react-native-ratings";
import axios from 'axios';
import { get } from 'lodash';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AES } from '../utils';
import { StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const keywords = ['house', 'shader', 'car', 'block', 'furniture', 'op', 'skin', 'city', 'gun'];
export default function MCPESearch({ navigation, route }) {
    const [keyword, setKeyword] = useState('');
    const [searching, setSearching] = useState(false);
    const [addons, setAddons] = useState([]);

    const search = async (keyword) => {
        setSearching(true);
        setAddons([]);
        const data = await axios.get('https://mcpe.megatechlab.com/addons4', { params: { q: keyword } });
        // const decryptedData = AES.decrypt(get(data, 'data.data'));
        // const objData = JSON.parse(decryptedData);
        setAddons(data.data);
        setSearching(false);
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View>
                    <Text style={{ color: '#000', alignSelf: 'center', fontWeight: 'bold', fontSize: 20 }}>Search</Text>
                </View>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.main}>
            <StatusBar translucent barStyle="dark-content" />
            {/* <SearchBar
                placeholder="Search addons..."
                onChangeText={(value) => {
                    console.log(value);
                    setKeyword(value);
                }}
                lightTheme
                value={keyword}
                onSubmitEditing={async () => search(keyword)}
                inputStyle={{ backgroundColor: '#fff' }}
                containerStyle={{ backgroundColor: 'white' }}
                inputContainerStyle={{ backgroundColor: 'white', borderColor: 'lightgray', borderWidth: 1 }}
            /> */}

            <View style={styles.searchbar}>
                <View style={{ margin: 20 }}>
                    <Ionicons
                        name='search' size={24}
                        color='#00695C'
                    />
                </View>
                <TextInput
                    style={{ flex: 1, margin: 20 }}
                    placeholder='Search mods...'
                    value={keyword}
                    onChangeText={(value) => {
                        console.log(value);
                        setKeyword(value);
                    }}
                    onSubmitEditing={async () => search(keyword)}
                />
            </View>

            <ScrollView>
                {keyword === '' ? (
                    <View style={{ flex: 1, alignContent: 'center', alignSelf: 'center', width: '100%' }}>
                        <Text style={{ padding: 20, fontWeight: 'bold', alignSelf: 'center' }}>Top keywords</Text>
                        {keywords.map(k => (
                            <TouchableOpacity onPress={async () => { setKeyword(k); await search(k) }} key={k}>
                                <View style={{ height: 1, marginLeft: 20, marginRight: 20, backgroundColor: 'lightgray' }} />
                                <Text style={{ color: 'green', alignSelf: 'center', padding: 10 }}>{k}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )
                    : null
                }
                {
                    keyword === '' ? null : (
                        <View>
                            {searching ? <ActivityIndicator size="large" color="#0000ff" /> : null}
                            {addons && addons.map(addon => (
                                <View style={{
                                    flex: 1,
                                    borderRadius: 10,
                                    margin: 5,
                                    backgroundColor: '#ffffff'
                                }}
                                    key={get(addon, '_id')}
                                >
                                    <Image source={{ uri: 'https://storage.uk.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/mcpe-assets/' + get(addon, 'image') }} style={{ height: 150, width: '100%', flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5 }}>
                                        <View style={{ flex: 1, flexDirection: 'column' }}>
                                            <Text style={{ alignSelf: 'flex-start', padding: 5 }}>{get(addon, 'title')}</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ backgroundColor: 'gray', color: 'white', padding: 5, fontSize: 10, borderRadius: 5, marginLeft: 5 }}>{get(addon, 'type')}</Text>
                                                <Text style={{ backgroundColor: 'green', color: 'white', padding: 5, fontSize: 10, borderRadius: 5, marginLeft: 5 }}>updated</Text>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'row', marginTop: 5 }}>
                                                <Rating
                                                    readonly
                                                    imageSize={15}
                                                    startingValue={get(addon, 'stat.rate.avg')}
                                                    ratingCount={5}
                                                    style={{ alignSelf: 'flex-start', marginLeft: 10 }}
                                                />
                                                <Text style={{ fontSize: 10 }}>({get(addon, 'stat.rate.count')})</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'column', padding: 5 }}>
                                            <Button
                                                icon={
                                                    <Icon
                                                        name="arrow-right"
                                                        size={15}
                                                        color="white"
                                                    />
                                                }
                                                title="More  "
                                                iconRight
                                                buttonStyle={{
                                                    backgroundColor: "green",
                                                    paddingLeft: 20,
                                                    paddingRight: 20
                                                }}
                                                onPress={async () => {
                                                    navigation.navigate('MCPEDetail', {
                                                        msg: get(addon, 'title'),
                                                        addonId: get(addon, '_id'),
                                                    })
                                                }}
                                            />
                                            <View style={{ flex: 1, flexDirection: 'row-reverse', padding: 5 }}>
                                                <Icon
                                                    name="download"
                                                    size={15}
                                                    color="gray"
                                                />
                                                <Text style={{ fontSize: 10, padding: 5, color: 'gray' }}>{get(addon, 'stat.download.count')}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    searchbar: {
        margin: 16, backgroundColor: '#ECEFF1', flexDirection: 'row', borderRadius: 24,
    }
});
