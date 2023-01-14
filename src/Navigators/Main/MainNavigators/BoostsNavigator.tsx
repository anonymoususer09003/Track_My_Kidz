import React from 'react'
import {
    SingleBoostReportScreen, BoostsScreen
} from '@/Screens'
import { createStackNavigator } from '@react-navigation/stack'
import { AuthStackHeader } from '@/Components'
const BoostsNavigator = createStackNavigator()
const BoostsStack = () => (
    <BoostsNavigator.Navigator
        initialRouteName="BoostsScreen"
    >
        <BoostsNavigator.Screen name="BoostsHome" component={BoostsScreen} options={{ headerShown: false }} />
        <BoostsNavigator.Screen name="BoostReportNav" component={SingleBoostReportScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Boost report" back={true} />) }} />

    </BoostsNavigator.Navigator>
)
export default BoostsStack
