import React from "react";
import {Linking, StyleSheet, TouchableOpacity, View} from "react-native";
import FastImage from "react-native-fast-image";
import {CountAdvertisementClick, CountAdvertisementView} from "@/Services/Advertisement";
import {Text} from "@ui-kitten/components";
import {VisibilitySensor} from "@/Components";
import Colors from "@/Theme/Colors";


const Advertisement = ({advertisement}: { advertisement: any }) => {
    const changeUrl = (e: any) => {
        const urlPattern = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
        let string = e;

        if (urlPattern.test(string)) {
            ///clear http && https from string
            string = string.replace("https://", "").replace("http://", "");

            //add https to string
        }
        string = `https://${string}`;
        return string
    }
    const handleAdVisibility = () => {
        CountAdvertisementView({
            advertType: advertisement.advertType,
            advertisementId: advertisement.id,
        }).then()
    }
    return <VisibilitySensor onChange={handleAdVisibility}>
        <View style={styles.containerAdvertisement}>

            <View style={{backgroundColor: 'red', width: '100%', justifyContent: 'center'}}>
                <FastImage source={{
                    uri: advertisement.mediaUrl,
                }} accessibilityLabel="BlogImage" resizeMode={'cover'}
                           style={{width: '100%', height: 250}}/>

            </View>
            <TouchableOpacity
                style={styles.backgroundOutline}
                onPress={() => {
                    if (advertisement?.redirectUrl !== null && advertisement.redirectUrl !== '') {
                        const tempUrl = changeUrl(advertisement.redirectUrl)
                        Linking.openURL(tempUrl).then()
                    }
                    const data = {
                        advertType: advertisement?.advertType,
                        advertisementId: advertisement?.id,
                    }
                    CountAdvertisementClick(data).then(r => {});
                }}
            >
                <Text style={styles.buttonOutline}>
                    See more
                </Text>
            </TouchableOpacity>
        </View>
    </VisibilitySensor>
}
export default React.memo(Advertisement);

const styles = StyleSheet.create({
    containerAdvertisement: {
        maxHeight: 320,
        backgroundColor: Colors.white,
        shadowColor: "grey",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 10,
        elevation: 7,
        paddingVertical: 15,
        paddingHorizontal: 7,
        flexDirection: 'column',
        marginTop: 10,
    },
    backgroundOutline: {
        backgroundColor: Colors.transparent,
        marginBottom: 10,
        width: '100%',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        color: Colors.primaryTint,
        paddingBottom: 6,
        borderWidth: 1,
        borderColor: Colors.primary,
        marginTop: 10,
    },

    buttonOutline: {
        fontSize: 15,
        color: Colors.primary,
        borderRadius: 10,
        paddingTop: 6,
    }
});
