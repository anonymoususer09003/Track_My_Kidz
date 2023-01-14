import React, { useState } from "react";
import { PostContents } from "@/Models/PostDTOS/post.interface";
import { Dimensions, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Text, Linking } from "react-native";
import FastImage from 'react-native-fast-image'
import Carousel, { Pagination } from "react-native-snap-carousel";
import { BaftrendsVideo } from "@/Components";
import { Card, Modal } from "@ui-kitten/components";
import { ReactNativeZoomableView } from "@dudigital/react-native-zoomable-view/dist";
import RNDeviceInfo from 'react-native-device-info';
import Colors from '@/Theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';

const BaftrendsPost = ({ postContentList, post }: { postContentList: PostContents[], post: any }) => {
    const [media, setMedia] = useState<PostContents | null>(null)
    const [openImagesModal, setOpenImagesModal] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)

    const window = Dimensions.get('window');

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
    return (
        <>{
            media ? <Modal
                style={{
                    width: '100%',
                    height: '100%',
                    padding: 0,
                }}
                visible={openImagesModal}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => setOpenImagesModal(false)}>
                <ReactNativeZoomableView
                    maxZoom={2}
                    minZoom={0.5}
                    zoomStep={0.5}
                    initialZoom={1.2}
                    bindToBorders={true}
                >
                    <View style={{ alignItems: 'center', zIndex: 1 }}>
                        {media?.mediaType !== undefined ? (media?.mediaType != 'video' ?
                            <FastImage
                                style={styles.container}
                                source={{
                                    uri: media?.mediaUrl,
                                    priority: FastImage.priority.normal,
                                }
                                }
                                resizeMode="contain"
                            /> :
                            <BaftrendsVideo uri={media?.mediaUrl} style={styles.container} />) :
                            <View style={{ width: 0, height: 0 }} />}
                    </View>
                </ReactNativeZoomableView>
                <AntDesign style={{
                    position: 'absolute',
                    top: 45,
                    right: 2,
                    zIndex: 0,
                }} name="closecircle" color={Colors.primary} size={30} onPress={() => setOpenImagesModal(false)} />
            </Modal> :
                null
        }
            <Carousel
                sliderWidth={window.width * 0.90}
                itemWidth={window.width * 0.90}
                style={styles.container}
                data={postContentList}
                onSnapToItem={setActiveSlide}
                renderItem={({ item }) => {
                    const postContent = item as PostContents
                    if (postContent.mediaType == 'video') {
                        return (
                            <TouchableOpacity style={{ position: 'relative' }}>

                                <BaftrendsVideo uri={postContent.mediaUrl}
                                    style={styles.itemHeader}
                                />
                                {post?.allowToBuyItem && post?.productUrl && post?.productUrl !== '' ? <TouchableOpacity style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                    borderColor: Colors.primary,
                                    borderWidth: 2,
                                    borderRadius: 20,
                                    position: 'absolute',
                                    bottom: 40,
                                    left: 10
                                }} onPress={() => {
                                    if (post?.productUrl !== null) {
                                        const tempUrl = changeUrl(post?.productUrl)

                                        Linking.openURL(tempUrl)
                                    }
                                }}>
                                    <Text style={{
                                        color: Colors.primary,
                                    }}>
                                        Buy
                                    </Text>

                                </TouchableOpacity> : null}
                            </TouchableOpacity>
                        )
                    } else {
                        return (<TouchableOpacity

                            style={{ position: 'relative' }}

                            onPress={() => {
                                setMedia(item)
                                setTimeout(() => {
                                    setOpenImagesModal(true)
                                }, 300);

                            }}><FastImage
                                style={styles.itemHeader}
                                source={{
                                    uri: postContent.mediaUrl,
                                    priority: FastImage.priority.normal,
                                }
                                }
                                resizeMode="contain"
                            />
                            {post?.allowToBuyItem && post?.productUrl && post?.productUrl !== '' ? <TouchableOpacity style={{
                                paddingVertical: 8,
                                paddingHorizontal: 20,
                                borderColor: Colors.primary,
                                borderWidth: 2,
                                borderRadius: 20,
                                position: 'absolute',
                                bottom: 40,
                                left: 10
                            }} onPress={() => {
                                if (post?.productUrl !== null) {
                                    const tempUrl = changeUrl(post?.productUrl)

                                    Linking.openURL(tempUrl)
                                }
                            }}>
                                <Text style={{
                                    color: Colors.primary,
                                }}>
                                    Buy
                                </Text>

                            </TouchableOpacity> : null}


                        </TouchableOpacity>)
                    }
                }
                }
            />
            <Pagination
                dotsLength={postContentList.length}
                activeDotIndex={activeSlide}
                containerStyle={{
                    paddingVertical: 2,
                    position: 'absolute',
                    bottom: -10,
                    left: '35%'
                }}
                dotStyle={{
                    backgroundColor: Colors.primary
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        </>
    );
}

export default BaftrendsPost;
const styles = StyleSheet.create({
    container: {
        minHeight: 220,
        width: '100%',
        padding: 0
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    itemHeader: {
        padding: 24,
        minHeight: RNDeviceInfo.getDeviceType() === "Tablet" ? 350 : 250,
    },
})
