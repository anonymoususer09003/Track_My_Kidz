import { Card, IndexPath, Modal, Input, Text, Select, SelectItem } from '@ui-kitten/components'
import { useDispatch, useSelector } from 'react-redux'
import { ModalState } from '@/Store/Modal'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import ChangeModalState from '@/Store/Modal/ChangeModalState'
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from '@/Components'
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import Colors from '@/Theme/Colors'
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { navigate } from '@/Navigators/Functions'
import { TouchableOpacity } from 'react-native-gesture-handler'

const instructors = [
    'Instructor 1',
    'Instructor 2',
]

const OtherTrackingModal = ({ }) => {
    const isVisible = useSelector(
        (state: { modal: ModalState }) =>
            state.modal.otherTrackingModal,
    )
    const [password, setPassword] = useState('');
    const dispatch = useDispatch()

    // @ts-ignore
    return (
        <Modal
            style={styles.container}
            visible={isVisible}
            backdropStyle={styles.backdrop}
            onBackdropPress={() => {
                dispatch(
                    ChangeModalState.action({ otherTrackingModal: false }),
                )
            }}
        >
            <Card style={styles.modal} disabled={true}>
                <View style={styles.body}>
                    <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                        <Text
                            textBreakStrategy={'highQuality'} style={{
                                textAlign: 'center',
                                color: "#606060",
                                fontSize: 18,
                            }}>
                            Other Tracking John
                        </Text>
                    </View>
                    {instructors.map(instructor => (
                        <Text style={{ marginVertical: 5 }}>{instructor}</Text>
                    ))}
                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                marginVertical: 5
                            }}
                            onPress={() => { }}
                        >
                            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                                Audio Call
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                marginVertical: 5
                            }}
                            onPress={() => { }}
                        >
                            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                            Text
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                marginVertical: 5
                            }}
                            onPress={() => { }}
                        >
                            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                                Video Call
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.buttonText}>
                    <LinearGradientButton
                        style={{
                            borderRadius: 25,
                            flex: 1
                        }}
                        appearance="ghost"
                        size="medium"
                        status="control"
                        onPress={() => {
                            dispatch(
                                ChangeModalState.action({ otherTrackingModal: false }),
                            )
                        }
                        }
                    >
                        Close
                    </LinearGradientButton>
                </View>
            </Card>
        </Modal>
    )
}
export default OtherTrackingModal

const styles = StyleSheet.create({
    container: {
        minHeight: 192,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        width: '90%',
    },
    inputSettings: {
        marginTop: 7,
    },
    modal: { borderRadius: 10 },
    header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
    body: { flex: 3 },
    background: {
        flex: 1,
        flexDirection: 'row',
        color: Colors.white,
        zIndex: -1,
    },
    topNav: {
        color: Colors.white,
    },
    text: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    bottom: {
        flex: 1,
        flexDirection: 'row',
        height: 45,
        marginTop: 10,
        justifyContent: 'space-between',
    },
    buttonText: {
        flex: 1,
        borderRadius: 25,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        alignItems: 'center',
        flexDirection: 'row',
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
})
