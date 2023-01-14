import React, {createContext, useState} from 'react'
import auth from '@react-native-firebase/auth'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);

    return (
      <AuthContext.Provider
        value={{
          user,
          setUser,
          login: async (email: string, password: string) => {
            try {
              await auth().signInWithEmailAndPassword(email, password);
            } catch (e) {
                try {
                    await auth().createUserWithEmailAndPassword(email, password);
                    await auth().signInWithEmailAndPassword(email, password);
                }catch (e){

                }
            }
          },
          register: async (email: string, password: string) => {
            try {
              await auth().createUserWithEmailAndPassword(email, password);
            } catch (e) {}
          },
          logout: async () => {
            try {
              await auth().signOut();
            } catch (e) {
              console.error(e);
            }
          }
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
