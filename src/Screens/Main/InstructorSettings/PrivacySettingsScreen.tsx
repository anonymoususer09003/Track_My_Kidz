import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Switch, Pressable, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native'
import { useTheme } from '@/Theme'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { Input, Icon, Text, Toggle, SelectItem, CheckBox } from '@ui-kitten/components';
import { ChangeAllFollowersPrivacy, ChangeSingleFollowerPrivacy, ChangeSingleFollowerBlock } from '@/Services/SettingsServies'
// @ts-ignore
import { UpdateFollowerPrivacy, GetBlockedUsers } from '@/Services/Settings'
import { useFollowersPagination } from '@/Utils/Hooks'

import LinearGradient from 'react-native-linear-gradient'
import Colors from '@/Theme/Colors';
// @ts-ignore

const RenderRadio = ({ item }: any) => {
    const [isCheck, setIsCheck] = useState(item?.showPosts)
    // const updateFollowerPrivacy = async (item: any) => {
    //     await UpdateFollowerPrivacy(item?.user?.id)
    // }

    return (
        <CheckBox
            checked={isCheck}
            onChange={nextChecked => {
                setIsCheck(nextChecked)
            }
            }
        >
        </CheckBox>
    )
}

const PrivacySettingsScreen = ({ route, navigation }) => {
    const { Layout } = useTheme()
    const [checked, setChecked] = React.useState(false);
    const [onEndReachedMomentum, setOnEndReachedMomentum] = useState(false)
    const [followers, setFollowers, fetchMore, searchParam, setSearchParam, shouldFetch] = useFollowersPagination()
    const [blockedFollowers, setBlockedFollowers] = useState([])
    const swipeableRef = useRef(null)
    const onCheckedChange = (isChecked: any) => {
        setChecked(isChecked);
        let objectToPass = {
            enable: isChecked
        }
        ChangeAllFollowersPrivacy(objectToPass)
            .then((response: any) => {
                if (response.status == 204) {

                }
            })
            .catch((error: any) => {
                Alert.alert(
                    error.data.title,

                    error.message,
                    [{ text: 'OK', style: 'cancel' }],
                )

            })
    };

    const [value, setValue] = React.useState('');

    const fetchBlockedUsers = () => {
        GetBlockedUsers(1, 100)
            .then(res => {
                if (res && res.data && res.data.data) {
                    setBlockedFollowers(res.data.data)
                }
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const renderIcon = (props: any) => (
        <Icon {...props} name={'search'} />
    );

    const renderAvatar = (props: any) => (
        <Icon {...props} name={'person-outline'} />
    );

    const pressRightAction = (item) => {
        ChangeSingleFollowerBlock(item?.id).then(data => fetchBlockedUsers())
    }

    const RightActions = (dragX: any, item) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        })
        return (
            <>

                <Pressable
                    onPress={() => pressRightAction(item)}
                    style={{
                        paddingHorizontal: 10,
                        backgroundColor: Colors.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Icon
                        style={{ width: 25, height: 25 }} fill={Colors.primary}
                        // onPress={() => setopenDeleteModal(true)}
                        name="trash-2" />
                </Pressable>

            </>
        )
    }

    const renderItem = (item: any, index: number) => {

        return (<Swipeable
            ref={swipeableRef}
            renderRightActions={(e) => RightActions(e, item)}

        >
            <SelectItem
                key={item?.id}
                style={{ minHeight: 55, backgroundColor: Colors.transparent }}
                accessoryLeft={renderAvatar}

                // accessoryRight={<RenderRadio item={item} />}
                title={item?.username}
            />
        </Swipeable>)
    }

    const renderLoader = () => {
        return <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={'large'} color={Colors.primary} />
        </View>
    }

    const renderFollowers = () => {

        //@ts-ignore
        return <FlatList
            onEndReachedThreshold={.5}
            // onEndReached={() => {
            //     if (!onEndReachedMomentum) {
            //         fetchMore()
            //         setOnEndReachedMomentum(true)
            //     }
            // }}
            contentContainerStyle={{ paddingBottom: 20 }}
            data={blockedFollowers}
            renderItem={({ item, index }: any) => renderItem(item, index)}
            keyExtractor={(item) => item?.user?.id}
            style={{ marginBottom: 40 }}
        // onMomentumScrollBegin={() => setOnEndReachedMomentum(false)}
        // ListFooterComponent={onEndReachedMomentum && shouldFetch && renderLoader()}
        />
    }

    return (
        <>
            <View style={styles.layout}>

                <View
                    style={styles.background}
                >
                    <View style={[Layout.alignItemsStart, { width: '100%', minHeight: 50 }]}>
                        <View style={[[Layout.rowCenter]]}>
                            <Input
                                //@ts-ignore
                                value={searchParam}
                                style={{ width: '100%' }}
                                placeholder='Search'
                                accessoryLeft={renderIcon}
                                onChangeText={nextValue => {
                                    setValue(nextValue)
                                    //@ts-ignore
                                    setSearchParam(nextValue)
                                }}
                            />

                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 20, paddingHorizontal: 20, flex: 1 }}>
                    <View style={[[Layout.row, Layout.justifyContentBetween, Layout.alignItemsCenter]]}>
                        <View style={{ maxWidth: 270 }}>
                            <Text style={{ fontSize: 16, color: '#404040' }}>When your account is private, only selected followers can see your photos and videos.</Text>
                        </View>
                        <Toggle checked={checked} onChange={onCheckedChange} />
                    </View>

                    <View style={[[Layout.rowCenter, { marginTop: 20 }]]}>
                        <Text style={{ fontSize: 20, color: Colors.lightgray, fontWeight: 'bold' }}>Blocked Followers</Text>
                    </View>
                    {renderFollowers()}
                </View>
            </View>
        </>
    )
}

export default PrivacySettingsScreen

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        flexDirection: 'column',
    },
    mainLayout: {
        flex: 9,
        marginTop: 40,
    },
    icon: {
        width: 32,
        height: 32
    },
    card: {
        height: 'auto',
        margin: 2,
    }, 
    background: {
        flex: 0,
        color: Colors.white,
        zIndex: -1,
        padding: 20,
        width: "100%",
        backgroundColor: Colors.primary
    },
})
