import {PostContents, PostGetDto} from "@/Models/PostDTOS/post.interface";
import React from "react";
import {Linking, Text, TouchableOpacity, TouchableWithoutFeedback} from "react-native";
import {Video} from "expo-av";
import {changeUrl} from "@/Utils/Shared/UrlHelpers";
import Colors from "@/Theme/Colors";

const MainBaftrendsVideo = ({post, postContent}: { post: PostGetDto, postContent: PostContents }) => {
    const video = React.useRef(null);
    const [muted, setMuted] = React.useState(true);
    const mute = () => {
        setMuted(!muted)
    }

    return (
        <TouchableOpacity style={{position: 'relative'}}>
            <TouchableWithoutFeedback onPress={mute}>
                <Video
                    ref={video}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                    isMuted={muted}
                    source={{uri: postContent.mediaUrl}}
                /></TouchableWithoutFeedback>
            {post?.allowToBuyItem && post?.productUrl !== '' && <TouchableOpacity onPress={() => {
                if (post?.productUrl !== null) {
                    const tempUrl = changeUrl(post?.productUrl)

                    Linking.openURL(tempUrl)
                }
            }}>
                <Text style={{
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    borderColor: Colors.white,
                    borderWidth: 2,
                    borderRadius: 20,
                    color: Colors.white,
                    position: 'absolute',
                    bottom: 40,
                    left: 10
                }}>
                    Buy
                </Text>
            </TouchableOpacity>}
        </TouchableOpacity>

    );
}

export default MainBaftrendsVideo;
