import { Button, TopNavigation } from '@ui-kitten/components';
import React from 'react';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '@/Theme/Colors';

const BottomBar = () => {
  const dispatch = useDispatch();
  return (
    <View>
      <View style={styles.bottom}>
        <View
          style={styles.background}
        >
          <View style={styles.buttonText}>
            <Button
              style={styles.buttonText}
              appearance="ghost"
              size="giant"
              status="control"
              onPress={() =>{}
                // dispatch(
                //   ChangeModalState.action({ createPostModalVisibility: true }),
                // )
              }
            >
              Upload
            </Button>
          </View>
          <View style={styles.buttonText}>
            <Button
              style={styles.buttonText}
              appearance="ghost"
              size="giant"
              status="control"
              onPress={() => {
              }}
            >
              Livestream
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};
export default BottomBar;
const styles = StyleSheet.create({
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
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
    height: 45,
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    color: Colors.white,
    fontSize: 18,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
