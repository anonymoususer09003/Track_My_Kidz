import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Text, CheckBox, Toggle } from '@ui-kitten/components';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'
import { useDispatch } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from '@/Theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SetupVehicleModal } from '@/Modals';
import { useStateValue } from '@/Context/state/State';

const _approvals = [
    {
        name: 'Dylan B.',
        type: 'Student',
        to: false,
        from: false,
    },
    {
        name: 'Peter C.',
        type: 'Student',
        to: false,
        from: false,
    },
    {
        name: 'James B.',
        type: 'Student',
        to: false,
        from: false,
    },
    {
        name: 'Mark K.',
        type: 'Instructor',
        to: false,
        from: false,
    },
    {
        name: 'John B.',
        type: 'Instructor',
        to: false,
        from: false,
    },
]

const InstructorGroupApprovalScreen = ({ route }) => {
    const [{selectedActivity}, _dispatch] = useStateValue()
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [approvals, setApprovals] = useState(selectedActivity?.studentsActivity)
    const [rollCall, setRollCall] = useState(false);
    const [saved, setSaved] = useState(false);
    const [checked, setChecked] = React.useState(false);

    const handleToChange = (index) => {
        const data = [...approvals];
        const item = data[index];
        item.to = !item.to;
        data[index] = item;
        setApprovals(data);
    }

    const handleFromChange = (index) => {
        const data = [...approvals];
        const item = data[index];
        item.from = !item.from;
        data[index] = item;
        setApprovals(data);
    }

    return (
        <>
            <SetupVehicleModal />
            <View style={styles.layout}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    {rollCall && <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10 }}>
                        <Toggle checked={checked} onChange={() => {
                            setChecked(!checked)
                            if (!checked) {
                                dispatch(
                                    ChangeModalState.action({ setupVehicleModal: true }),
                                )
                            }
                        }} />
                    </View>}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                        <Text>{`To`}</Text>
                        <Text style={{ marginLeft: 10 }}>{`From`}</Text>
                    </View>
                    <View style={{ marginTop: 10, maxHeight: 150 }}>
                        <FlatList
                            data={approvals}
                            renderItem={({ item, index }) => (
                                <View
                                    style={{
                                        marginVertical: 2,
                                        padding: 2,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item.type === 'Instructor' ?
                                            <Ionicons name="person" color={Colors.primary} size={20} style={{ marginHorizontal: 5 }} /> :
                                            <Entypo name="book" color={Colors.primary} size={20} style={{ marginHorizontal: 5 }} />
                                        }
                                        <Text style={{ marginLeft: 10 }}>{`${item.firstName} ${item.lastName}`}</Text>
                                    </View>
                                    {(rollCall || saved) && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <CheckBox
                                                checked={item.to}
                                                disabled={saved}
                                                onChange={() => handleToChange(index)}>
                                                {''}
                                            </CheckBox>
                                            <CheckBox
                                                checked={item.from}
                                                disabled={saved}
                                                style={{ marginLeft: 30 }}
                                                onChange={() => handleFromChange(index)}>
                                                {''}
                                            </CheckBox>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </View>
                <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' }}>
                    {!rollCall && (
                        <>
                            <View style={styles.background}>
                                <TouchableOpacity
                                    style={styles.background}
                                    onPress={() => {
                                        setSaved(false);
                                        setRollCall(true);
                                    }}>
                                    <Text style={styles.button}>
                                        Roll Call
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.background}>
                                <TouchableOpacity
                                    style={styles.background}
                                    onPress={() => navigation.navigate('InstructorActivity')}>
                                    <Text style={styles.button}>
                                        Back
                                    </Text>
                                </TouchableOpacity>
                            </View></>
                    )}
                    {rollCall && (
                        <View style={styles.background}>
                            <TouchableOpacity
                                style={styles.background}
                                onPress={() => {
                                    setSaved(true);
                                    setRollCall(false);
                                }}>
                                <Text style={styles.button}>
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </>
    )
}

export default InstructorGroupApprovalScreen

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        flexDirection: 'column',
    },
    item: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: '96%',
        backgroundColor: '#fff',
        marginTop: 10,
        marginHorizontal: '2%',
        paddingHorizontal: 10,
        paddingTop: 10
    },
    footer: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: '96%',
        backgroundColor: '#fff',
        marginHorizontal: '2%',
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingBottom: 10
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        fontSize: 16,
        marginVertical: 4
    },
    background: {
        width: '80%',
        borderRadius: 10,
        paddingBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        backgroundColor: Colors.primary,
    },
    button: {
        paddingTop: 5,
        fontSize: 15,
        color: Colors.white,
        borderRadius: 10,
    },
})
