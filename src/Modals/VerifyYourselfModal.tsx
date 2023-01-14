import { Card, IndexPath, Modal, Input, Text, Select, SelectItem } from '@ui-kitten/components'
import { useDispatch, useSelector } from 'react-redux'
import { ModalState } from '@/Store/Modal'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import ChangeModalState from '@/Store/Modal/ChangeModalState'
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from '@/Components'
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import Colors from '@/Theme/Colors'
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { navigate } from '@/Navigators/Functions'
import { GetActivationCode } from '@/Services/ActivationCode'
import { ValidatePassword } from '@/Services/ValidatePassword'
import { loadUserType } from '@/Storage/MainAppStorage'

const VerifyYourselfModal = ({ isActivationCode, setIsActivationCode }) => {
    const isVisible = useSelector(
        (state: { modal: ModalState }) =>
            state.modal.verifyYourselfModalVisibility,
    )
    const currentUser = useSelector((state: { user: UserState }) => state.user.item);
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
                    ChangeModalState.action({ verifyYourselfModalVisibility: false }),
                )
                setPassword('')
                setIsActivationCode('');
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
                            Verification
                        </Text>
                    </View>
                </View>
                <View style={{ marginTop: 30, padding: 20 }}>
                    <Input
                        style={styles.inputSettings}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder={`Enter Password`}
                        onChangeText={(value) => setPassword(value)}
                        value={password}
                        secureTextEntry
                    />
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
                        onPress={async () => {
                            if (password.length === 0) {
                                alert('Please enter your password');
                            } else {
                                dispatch(ChangeModalState.action({ loading: true }))
                                const type = await loadUserType();
                                const data = {
                                    email: currentUser?.email,
                                    password: password,
                                    type: type?.toLowerCase(),
                                }
                                ValidatePassword(data).then(res => {
                                    if (isActivationCode) {
                                        navigate('ActivationCode')
                                    } else {
                                        navigate('DependentInfo')
                                    }
                                    dispatch(
                                        ChangeModalState.action({ verifyYourselfModalVisibility: false }),
                                    )
                                    setPassword('')
                                }).catch(err => {
                                    alert('Invalid password');
                                }).finally(() => {
                                    dispatch(ChangeModalState.action({ loading: false }))
                                })
                            }
                        }
                        }
                    >
                        Continue
                    </LinearGradientButton>
                </View>
            </Card>
        </Modal>
    )
}
export default VerifyYourselfModal

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
