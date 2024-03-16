import React from 'react'
import { Icon, Text, TopNavigation, TopNavigationAction } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Colors from '@/Theme/Colors';

const AuthStackHeader = (props: any) => {


  const { navigation } = props
  const renderBackIcon = (props: any) => <Icon {...props} name="arrow-back" fill={Colors.white} />

  return (
    <>

      <View
        style={styles.background}
      >

        {props.back ? (
          <TopNavigation
            style={styles.topNav}
            {...props}
            appearance="control"
            alignment="center"
            title={() => <Text style={{
              color: Colors.white,
              fontSize: 20
            }}>{props.title}</Text>}
            accessoryLeft={() => (
              <TopNavigationAction icon={renderBackIcon} onPress={() => {
                navigation.goBack(null)
              }} />
            )
            }
          />
        ) : (
          <TopNavigation
            style={styles.topNav}
            {...props}
            appearance="control"
            alignment="center"
            title={() => <Text style={{
              color: Colors.white,
              fontSize: 20
            }}>{props.title}</Text>}
          />
        )}

      </View>
    </>
  )
}

export default AuthStackHeader
const styles = StyleSheet.create({
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary
  },
  topNav: {
    color: Colors.white,
  },
})
