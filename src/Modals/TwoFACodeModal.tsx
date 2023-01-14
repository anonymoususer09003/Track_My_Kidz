import {Card, Modal, Text} from "@ui-kitten/components";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import {StyleSheet, View} from "react-native";
import {LinearGradientButton} from "@/Components";
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ModalState} from "@/Store/Modal";
import OTPInputView from '@twotalltotems/react-native-otp-input'
import LoginStore from "@/Store/Authentication/LoginStore";
import ValidateTwoFAService from "@/Services/TwoFAServices/ValidateTwoFAService";
import messaging from "@react-native-firebase/messaging";
import {UpdateDeviceToken} from "@/Services/User";
import Colors from "@/Theme/Colors";


const TwoFACodeModal = () => {

    const dispatch = useDispatch()
    const isVisible = useSelector(
        (state: { modal: ModalState }) =>
            state.modal.twoFactorAuthCodeModal,
    )
    const [code,setCode] = useState('');



    const saveTokenToDatabase = (token: string) => {
        UpdateDeviceToken(token).then(data=>{

        })
            .catch((err) => {})
    }

    const confirmSave = (code: any)  => {
        ValidateTwoFAService(code).then(data=> {
            let loginToken=data.token;
            dispatch(LoginStore.action(loginToken))
            messaging()
                .getToken()
                .then(token => {
                    return saveTokenToDatabase(token);
                })
            dispatch(
                ChangeModalState.action({twoFactorAuthCodeModal: false}),
            )
            dispatch(
                ChangeModalState.action({loading: false}),
            )
        })

    }

    if(!isVisible)return (<></>);
    // @ts-ignore
    return (
        <Modal
            style={styles.container}
            visible={isVisible}
            backdropStyle={styles.backdrop}
            onBackdropPress={() => {
                dispatch(
                    ChangeModalState.action({twoFactorAuthCodeModal: false}),
                )
            }}
        >
            <Card style={styles.modal} disabled={true}>
                <View style={styles.body}>
                    <View style={{width:'80%'}}>
                        <Text  style={{justifyContent:'center',alignSelf:'center'}}> Enter Code </Text>

                            <OTPInputView
                                style={{ height: 200}}
                                pinCount={6}
                                code={code}
                                onCodeChanged = {code => { setCode(code)}}
                                autoFocusOnLoad
                                codeInputFieldStyle={styles.underlineStyleBase}
                                codeInputHighlightStyle={styles.underlineStyleHighLighted}

                            />



                    </View>

                </View>
                <View style={styles.bottom}>
                    <View style={styles.buttonText}>
                        <LinearGradientButton
                            style={styles.buttonText}
                            appearance="ghost"
                            size="medium"
                            status="control"
                            onPress={() =>{
                                dispatch(ChangeModalState.action({loading:true}))
                                confirmSave(code)
                            }

                            }
                        >
                            Confirm
                        </LinearGradientButton>
                    </View>
                </View>
            </Card>
        </Modal>
    )
}
export default TwoFACodeModal


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modal: {height:'100%', flex:1, flexDirection:'row',justifyContent:"center",alignContent:'center',width: '100%',
    },
    header: {flex: 1,flexDirection:'row', textAlign: 'center', fontWeight: 'bold', fontSize: 20},
    body: {flex: 8,flexDirection:'row',justifyContent:"center",alignContent:'center',},
    img: {
        minHeight: 220,
        width:250,
        height:250,
        padding: 0
    },
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
        justifyContent: 'center',
    },
    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        color: Colors.primary,
        borderBottomWidth: 1,
    },

    underlineStyleHighLighted: {
        borderColor: Colors.primary,


    },
    buttonText: {
        flex: 1,
        height: 45,
        borderRadius: 25,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 2,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: {height: 1, width: 1}, // IOS
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
