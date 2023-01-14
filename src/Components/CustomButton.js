import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

const Brand = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default Brand
const styles = StyleSheet.create({
  button: {
    marginTop: 5,
    marginBottom: 5,
  },
  text: {
    textTransform: 'uppercase',
    fontSize: 15,
  },
})
