import React, { useEffect, useState, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Text, CheckBox } from '@ui-kitten/components';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Colors from '@/Theme/Colors';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { LinearGradientButton } from "@/Components";
import moment from 'moment';
import { InstructionsModal, DeclineActivityModal } from '@/Modals';

const _students = [
    {
        name: 'Dylan B.',
        selected: false
    },
    {
        name: 'Peter C.',
        selected: false
    },
    {
        name: 'James B.',
        selected: false
    },
    {
        name: 'Mark K.',
        selected: false
    },
    {
        name: 'John B.',
        selected: false
    },

]

const InstructorGroupPendingScreen = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [students, setStudents] = useState(_students);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            const data = [...students];
            const _data = [];
            data.forEach(i => _data.push({
                name: i.name,
                selected: true
            }))
            setStudents(_data);
        } else {
            const data = [...students];
            const _data = [];
            data.forEach(i => _data.push({
                name: i.name,
                selected: false
            }))
            setStudents(_data)
        }
    }

    const handleCheckboxChange = (index) => {
        const data = [...students];
        const item = data[index];
        item.selected = !item.selected;
        data[index] = item;
        setStudents(data);
    }
 
    const handleSubmit = () => { }

    return (
        <>
            <View style={styles.layout}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                        <CheckBox
                            checked={selectAll}
                            onChange={handleSelectAll}>
                            {''}
                        </CheckBox>
                        <Text style={{ marginLeft: 10 }}>
                            Select All
                        </Text>
                    </View>
                    <View style={{ marginTop: 10, maxHeight: 150 }}>
                        <FlatList
                            data={students}
                            renderItem={({ item, index }) => (
                                <View
                                    style={{
                                        marginVertical: 2,
                                        padding: 2,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                    <Text >{item.name}</Text>
                                    <CheckBox
                                        checked={item.selected}
                                        onChange={() => handleCheckboxChange(index)}>
                                        {''}
                                    </CheckBox>
                                </View>
                            )}
                        />
                    </View>
                </View>
                <View style={{ marginVertical: 5 }}>
                    <Text style={{ textAlign: 'center' }}>Select and click "Resend Permission Request" button to request permission from parents of selected individuals.</Text>
                </View>
                <View style={styles.buttonSettings}>
                    <View
                        style={[styles.background,
                        {
                            backgroundColor: students.filter(i => i.selected).length === 0 ?
                                Colors.lightgray :
                                Colors.primary
                        }]}
                    >
                        <TouchableOpacity
                            style={[styles.background, {
                                backgroundColor: students.filter(i => i.selected).length === 0 ?
                                    Colors.lightgray :
                                    Colors.primary
                            }]}
                            disabled={students.filter(i => i.selected).length === 0}
                            onPress={handleSubmit}>
                            <Text style={styles.button}>
                                Resend Permission Request
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={styles.background}
                    >
                        <TouchableOpacity
                            style={styles.background}
                            onPress={() => navigation.navigate('InstructorActivity')}>
                            <Text style={styles.button}>

                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    )
}

export default InstructorGroupPendingScreen

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
    buttonSettings: {
        marginTop: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10
    },
})
