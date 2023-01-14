import React, {useEffect} from "react";
import {Pressable} from "react-native";
import {Audio, Video} from "expo-av";
import {VisibilitySensor} from "@/Components";


const BaftrendsVideo = (props: any) => {
    const onOpenModal = props.onOpenModal;
    const video = React.useRef<Video | null>(null);
    const [muted, setMuted] = React.useState(true);
    const handleImageVisibility = (visible: boolean) => {
        if (visible && video.current != null) {
            video.current?.playAsync()
        } else if (video.current != null) {
            video.current?.pauseAsync()
        }
    }
    useEffect(()=>{
       Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: true,
        });
    },[])
    const mute = () => {
        setMuted(!muted)
    }
    return (
        <VisibilitySensor onChange={handleImageVisibility}>
            <Pressable onPress={() => !!onOpenModal ? onOpenModal() : mute()}>
                <Video
                    ref={video}

                    useNativeControls
                    resizeMode="contain"
                    isLooping
                    isMuted={muted}
                    {...props}
                    source={{uri: props.uri}}
                /></Pressable>
        </VisibilitySensor>
    );
}

export default React.memo(BaftrendsVideo);
