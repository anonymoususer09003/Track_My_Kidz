import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Alert, Image, FlatList, Linking, TouchableOpacity } from 'react-native'
import { useTheme } from '@/Theme'
// @ts-ignore

import LinearGradient from 'react-native-linear-gradient'
import GetApps from '@/Services/Settings/GetApps'
import FastImage from 'react-native-fast-image'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { AppHeader } from '@/Components'
const AppListScreen = () => {
    const [apps, setapps] = useState([])
    useEffect(() => {
        GetApps()
            .then((response: any) => {
                if (response != null) {
                    setapps(response)

                }
            })
            .catch((error: any) => {
                Alert.alert('Apps not loaded', '', [{ text: 'OK', style: 'cancel' }])
            })
    }, [])
    const renderItem = ({ item }: { item: any }) => (
        <View key={item?.id} style={styles.appContainer}>
            <View style={styles.topContainer}>
                <Text style={styles.appName}>
                    {item?.appName}
                </Text>
                <View
                    style={styles.background}
                >

                    {
                        !item?.comingSoon ? <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                if (item?.downloadLink !== null && item?.downloadLink !== '')
                                    Linking.openURL(item?.downloadLink?.toString())

                            }}
                        >
                            <Text style={styles.button}>Download</Text>
                        </TouchableOpacity> : <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                if (item?.downloadLink !== null)
                                    Linking.openURL(item?.downloadLink?.toString())

                            }}
                        >
                            <Text style={styles.button}>Coming soon...</Text>
                        </TouchableOpacity>
                    }

                </View>
            </View>
            <FastImage source={{ uri: item?.appImage }} style={{ width: '95%', height: 200, marginLeft: 10 }} resizeMode={'contain'} />
            <Text style={styles.appDescription}>
                {item?.appDescription}
            </Text>

        </View>
    );

    return (
        <>
            <AppHeader title="Our Other Apps" />
            <View style={{ flex: 1 }}>

                <FlatList
                    data={apps}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </View>

        </>
    )
}

export default AppListScreen

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        flexDirection: 'column',
    },
    mainLayout: {
        flex: 9,
    },
    appContainer: {
        borderBottomColor: '#A9A9A9',
        borderBottomWidth: 2,

        marginBottom: 10,
        marginTop: 30
    },
    appName: {
        color: '#404040',
        fontWeight: 'bold',
        fontSize: 24,
        marginLeft: 10,
        width: '40%',
    },
    appDescription: {
        fontSize: 16,
        marginLeft: 30,
        marginVertical: 30
    },
    button: {
        paddingVertical: 7,
        fontSize: 15,
        textTransform: 'uppercase',
        width: 150,
        borderRadius: 10,
        textAlign: 'center',
        color: Colors.white,
    },
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 20
    },
    background: {
        width: 150,
        borderRadius: 10,
        backgroundColor: Colors.primary
    }
})
