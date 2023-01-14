import React, {useState} from "react";
import {StyleSheet, TouchableOpacity} from "react-native";
import FastImage from "react-native-fast-image";
import {PostContents, PostGetDto} from "@/Models/PostDTOS/post.interface";

const BaftrendsImage = ({post, postContent}: { post: PostGetDto, postContent: PostContents }) => {
    const [showModal, setShowModal] = useState(false)
    return (<TouchableOpacity style={{position: 'relative'}} onPress={() => {
        setTimeout(() => {
            setShowModal(true)
        }, 300);
    }}> <FastImage source={{uri: postContent.mediaUrl, priority: FastImage.priority.normal,}} style={styles.itemHeader}
                   resizeMode="contain"/></TouchableOpacity>       );
}
export default React.memo(BaftrendsImage, (prevProps, nextProps) => {
    return prevProps.postContent.id == nextProps.postContent.id
});
const styles = StyleSheet.create({
    container: {minHeight: 220, width: '100%', padding: 0},
    backdrop: {backgroundColor: 'rgba(0, 0, 0, 0.5)',},
    itemHeader: {padding: 24, minHeight: 380,},
})
