import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    View,
    Switch,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView, TouchableWithoutFeedback, Keyboard,
} from 'react-native'
import { useTheme } from '@/Theme'
import { Card, Text, Radio, RadioGroup, Spinner, Input } from '@ui-kitten/components';
// @ts-ignore
import { ReportAProblem } from '../../../Services/SettingsServies';
import LinearGradient from 'react-native-linear-gradient'
import * as yup from 'yup'
import { Formik } from 'formik'
import { useHeaderHeight } from "react-native-screens/native-stack";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Colors from '@/Theme/Colors';
const Divider = () => (
    <View
        style={{
            borderBottomColor: '#E0E0E0',
            borderBottomWidth: 1,
        }}
    />
);

const RadioOptions = ({ selectedIndex, setSelectedIndex }: { selectedIndex: any, setSelectedIndex: any }) => {

    return (
        <React.Fragment >
            <RadioGroup
                selectedIndex={selectedIndex}
                onChange={index => setSelectedIndex(index)}>
                <Radio style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingLeft: 20, marginVertical: 15 }} >
                    {evaProps => <Text {...evaProps} style={{ fontSize: 14 }}> User interface issues</Text>}
                </Radio>
                <Divider />
                <Radio style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingLeft: 20, marginVertical: 15 }} >
                    {evaProps => <Text {...evaProps} style={{ fontSize: 14, marginLeft: 4 }}>App performance and response</Text>}
                </Radio>
                <Divider />
                <Radio style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingLeft: 20, marginVertical: 15 }} >
                    {evaProps => <Text {...evaProps} style={{ fontSize: 14 }}> Functionality missing or not working properly</Text>}
                </Radio>
                <Divider />
                <Radio style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingLeft: 20, marginVertical: 15 }} >
                    {evaProps => <Text {...evaProps} style={{ fontSize: 14 }}> Device compatibility</Text>}
                </Radio>
                <Divider />
                <Radio style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingLeft: 20, marginVertical: 15 }} >
                    {evaProps => <Text {...evaProps} style={{ fontSize: 14 }}> Other</Text>}
                </Radio>

                <Divider />
            </RadioGroup>

        </React.Fragment>
    );
};

const occasions = [
    'Chirstmas',
    'Easter',
    'Hanukkah',
    'Thanksgiving',
    'Ramadan'
]

const RequestOccasionScreen = () => {
    const { Layout } = useTheme()
    const reportAProblemValidationSchema = yup.object().shape({

        message: yup
            .string()
            .max(20, 'Name can not be more than 20 characters')
            .min(3, ({ min }) => `Name needs to be at least ${min} characters`)
            .required('Name is required'),
    })


    const [isTouched, setisTouched] = useState(false)
    const [isSending, setisSending] = useState(false)
    const [isSent, setisSent] = useState(false)

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    return (
        <KeyboardAwareScrollView
            extraHeight={10}
            enableOnAndroid={true}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>


                <View style={styles.layout}>
                    <View style={[styles.mainLayout, { paddingLeft: 20 }]}>
                        <>
                            <Text style={styles.sent}>Occasions</Text>
                            <View style={{ marginLeft: 10, marginTop: 5 }}>
                                {occasions && occasions.map(item => (
                                    <Text style={{ marginTop: 5 }}>
                                        {item}
                                    </Text>
                                ))}
                            </View>
                            <Formik
                                validationSchema={reportAProblemValidationSchema}
                                validateOnMount={true}
                                initialValues={{ name: '' }}
                                onSubmit={(values, { resetForm }) => {
                                    resetForm();
                                }}
                            >
                                {({
                                    handleChange,
                                    handleSubmit,
                                    values,
                                    errors,
                                    isValid,
                                }) => (
                                    <>
                                        <View style={styles.formContainer}>
                                            <View style={{alignItems: 'flex-end', marginRight: 20, marginTop: 10}}>
                                                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Max 20 characters</Text>
                                            </View>
                                            <Input
                                                style={{ marginRight: 20, marginTop: 10 }}
                                                placeholder="Add your suggestion"
                                                onChangeText={handleChange('name')}
                                                value={values.name}
                                                status={isTouched && errors.name ? 'danger' : ''}
                                            />
                                            {errors.name && isTouched ? (
                                                <Text style={styles.errorText}>{errors.name}</Text>
                                            ) : null}
                                            <View style={styles.buttonSettings}>
                                                <View
                                                    style={[styles.background,
                                                    {
                                                        backgroundColor: values?.name?.length < 3 || values?.name?.length > 20 ?
                                                            Colors.lightgray :
                                                            Colors.primary
                                                    }]}
                                                >

                                                    <TouchableOpacity
                                                        style={[styles.background, {
                                                            backgroundColor: values?.name?.length < 3 || values?.name?.length > 20 ?
                                                                Colors.lightgray :
                                                                Colors.primary
                                                        }]}
                                                        disabled={!isValid}
                                                        onPress={handleSubmit}>
                                                        <Text style={styles.button}>

                                                            Submit
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>

                                    </>
                                )}
                            </Formik>
                        </>
                    </View>

                </View>

            </ScrollView>
        </KeyboardAwareScrollView>

    )
}

export default RequestOccasionScreen

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: Colors.white
    },
    mainLayout: {
        flex: 1,
        marginTop: 40
    },
    sppinerContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sent: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left'
    },
    background: {
        width: '80%',
        borderRadius: 10,
        paddingBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        backgroundColor: Colors.primary
    },
    button: {
        paddingTop: 5,
        fontSize: 15,
        color: Colors.white,
        borderRadius: 10,
    },
    formContainer: {
        flex: 1,
    },
    buttonSettings: {
        marginTop: 20,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: -20
    },


    errorText: {
        fontSize: 10,
        color: 'red',
        marginLeft: 10,
        marginTop: 10
    },
})
