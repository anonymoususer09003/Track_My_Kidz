import { Modal, Spinner } from '@ui-kitten/components'
import {useDispatch, useSelector} from 'react-redux'
import { ModalState } from '@/Store/Modal'
import React, {useEffect} from 'react'
import { StyleSheet, View } from 'react-native'
import ChangeModalState from "@/Store/Modal/ChangeModalState";

const LoadingModal = () => {
  const dispatch = useDispatch()
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.loading,
  )
  useEffect(()=>{
    if(isVisible){
      setTimeout(()=>{
        dispatch(ChangeModalState.action({loading:false}))
      },10000)
    }
  },[isVisible])
  return (
    <Modal
      style={styles.container}
      visible={isVisible != null && isVisible}
      backdropStyle={styles.backdrop}
    >
        <Spinner /> 
    </Modal>
  )
}

export default LoadingModal

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
})
