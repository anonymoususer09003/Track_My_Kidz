import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { AppHeader } from "@/Components";
import { Button } from '@ui-kitten/components'
import { useTheme } from '@/Theme'
// @ts-ignore

import LinearGradient from 'react-native-linear-gradient'
import Colors from '@/Theme/Colors';

const SettingsScreen = ({ navigation }) => {
  const { Layout } = useTheme()
  return (
    <>
      <AppHeader title="Settings" />
      <View style={styles.layout}>
        <View style={styles.mainLayout}>
          <View style={[[Layout.colCenter]]}>
            <View
              style={styles.background}
            >
              <TouchableOpacity
                style={styles.background}
                onPress={() => navigation.navigate('PersonalProfile')}
              >
                <Text style={styles.button}>

                  Personal profile
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={styles.background}
            >
              <TouchableOpacity
                style={styles.background}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <Text style={styles.button}>

                  Change your password
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={styles.background}
            >

              <TouchableOpacity
                style={styles.background}
                onPress={() => navigation.navigate('SocialMediaProfile')}
              >
                <Text style={styles.button}>

                  Social media profile
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={styles.background}
            >
              <TouchableOpacity
                style={styles.background}
                onPress={() => navigation.navigate('Options')}
              >
                <Text style={styles.button}>

                  Options
                </Text>
              </TouchableOpacity>

            </View>
            <View
              style={styles.background}
            >
              <TouchableOpacity
                style={styles.background}
                onPress={() => navigation.navigate('AppList')}
              >
                <Text
                  style={styles.button}>

                  App list
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </View>
    </>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  background: {
    width: '80%',
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary
  },
  button: {
    paddingTop: 15,
    fontWeight: 'bold',
    fontSize: 17,
    color: Colors.white,
    borderRadius: 10,
  },
})
