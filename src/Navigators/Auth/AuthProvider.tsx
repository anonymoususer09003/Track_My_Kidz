import React, {createContext, ReactNode, useState} from 'react';
// import auth from '@react-native-firebase/auth';



interface AuthContextType {
    user: any | null;
    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    login: async () => {},
    register: async () => {},
    logout: async () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider = ({children}: AuthProviderProps) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (email: string, password: string) => {
          try {
            // await auth().signInWithEmailAndPassword(email, password);
          } catch (e) {
            try {
              // await auth().createUserWithEmailAndPassword(email, password);
              // await auth().signInWithEmailAndPassword(email, password);
            } catch (e) {}
          }
        },
        register: async (email: string, password: string) => {
          try {
            // await auth().createUserWithEmailAndPassword(email, password);
          } catch (e) {}
        },
        logout: async () => {
          try {
            // await auth().signOut();
          } catch (e) {
            console.error(e);
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};
