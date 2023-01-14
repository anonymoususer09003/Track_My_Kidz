import React, { useEffect } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useTheme } from '@/Theme'
import { useDispatch } from 'react-redux'
import InitStartup from '@/Store/Startup/Init'
import { useTranslation } from 'react-i18next'

const StartUpScreen = () => {
  const { Layout, Gutters, Fonts } = useTheme()

  const { t } = useTranslation()

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(InitStartup.action())
  })

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
      <ActivityIndicator size={'large'} style={[Gutters.largeVMargin]} />
    </View>
  )
}

export default StartUpScreen
