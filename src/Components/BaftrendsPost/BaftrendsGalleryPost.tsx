import React, { useState } from "react";
import { PostContents } from "@/Models/PostDTOS/post.interface";
import { Dimensions, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import FastImage from 'react-native-fast-image'
import Carousel, { Pagination } from "react-native-snap-carousel";
import { BaftrendsVideo } from "@/Components";
import { Card, Modal } from "@ui-kitten/components";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import Colors from "@/Theme/Colors";


const BaftrendsGalleryPost = ({ postContentList }: { postContentList: PostContents[] }) => {
    const [media, setMedia] = useState(null)
    const [openImagesModal, setOpenImagesModal] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)

    const window = Dimensions.get('window');


    return (
        <>{
            media ? <Modal
                style={{
                    width: '100%',
                    padding: 0
                }}
                visible={openImagesModal}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => setOpenImagesModal(false)}>
                <ReactNativeZoomableView
                    maxZoom={1.5}
                    minZoom={0.5}
                    zoomStep={0.5}
                    initialZoom={1}
                    bindToBorders={true}
                >
                    <Card disabled={true} style={{ height: '100%', width: '100%', padding: 0 }}>
                        {media?.mediaType !== undefined ? (media?.mediaType != 'video' ?
                            <FastImage
                                style={styles.container}
                                source={{
                                    uri: media?.mediaUrl,
                                    priority: FastImage.priority.normal,
                                }
                                }
                                resizeMode="contain"
                            /> : <BaftrendsVideo uri={media?.mediaUrl} style={styles.container}
                            />) : <View style={{ width: 0, height: 0 }} />}
                    </Card>
                </ReactNativeZoomableView>

            </Modal> :
                null
        }
            <Carousel
                sliderWidth={window.width * 0.48}
                itemWidth={window.width * 0.48}
                style={styles.container}
                data={postContentList}
                onSnapToItem={setActiveSlide}
                renderItem={({ item }) => {
                    const postContent = item as PostContents
                    if (postContent.mediaType == 'video') {
                        return (
                            <TouchableWithoutFeedback>
                                <BaftrendsVideo uri={postContent.mediaUrl}
                                    style={styles.itemHeader}
                                /></TouchableWithoutFeedback>
                        )
                    } else {
                        return (<TouchableOpacity onPress={() => {
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
                                resizeMode="cover"
                            /></TouchableOpacity>)
                    }
                }
                }
            />
            <Pagination
                dotsLength={postContentList.length}
                activeDotIndex={activeSlide}
                containerStyle={{
                    paddingVertical: 2
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

export default BaftrendsGalleryPost;
const styles = StyleSheet.create({
    container: {
        maxHeight: 350,
        height: 350,
        width: '100%',
        padding: 10,
        marginBottom: 10
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    itemHeader: {
        padding: 24,
        minHeight: 250,
        marginBottom: 2
    },
})
