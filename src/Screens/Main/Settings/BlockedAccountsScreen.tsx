import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import { useTheme } from '@/Theme'
import { Input, Icon, Text, SelectItem, } from '@ui-kitten/components';
// @ts-ignore

import { GetBlockedUsers } from '@/Services/Settings'
import Colors from '@/Theme/Colors';
const Divider = () => (
    <View
        style={{
            borderBottomColor: '#E0E0E0',
            borderBottomWidth: 1,
        }}
    />
);

const BlockedAccountsScreen = () => {
    const { Layout } = useTheme()
    const [users, setusers] = useState([])


    useEffect(() => {
        GetBlockedUsers()
            .then((response: any) => {
                if (response != null) {
                    setusers(response?.data?.data)

                }
            })
            .catch((error: any) => {
                Alert.alert('Users not loaded', '', [{ text: 'OK', style: 'cancel' }])
            })
    }, [])


    const renderAvatar = (props: any) => (
        <Icon {...props} name={'person-outline'} fill={Colors.primary} size={25} style={{ width: 26, height: 26 }} />
    );
    const renderFollowers = () => {

        return users.map((item: any) =>
            <>
                <SelectItem
                    style={{ minHeight: 55, backgroundColor: Colors.transparent }}
                    accessoryLeft={renderAvatar}
                    title={item?.firstName.concat(' ').concat(item?.lastName)}
                />
                <Divider />
            </>
        )
    }

    return (
        <>
            <View style={styles.layout}>

                <View style={{ marginTop: 20, paddingHorizontal: 20 }}>


                    <View style={[[Layout.rowCenter, { marginTop: 20 }]]}>
                        <Text style={{ fontSize: 20, color: "#404040", fontWeight: 'bold', marginBottom: 20 }}>List of blocked accounts</Text>
                    </View>

                    { }


                    {users.length === 0 ?
                        <Text style={{ color: Colors.gray, fontSize: 16, textAlign: 'center', marginVertical: 100 }}>
                            No blocked users
                        </Text>

                        :
                        <View style={{ flex: 1, backgroundColor: 'red' }}>
                            {renderFollowers()}
                        </View>
                    }

                </View>
            </View>
        </>
    )
}

export default BlockedAccountsScreen

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
})
