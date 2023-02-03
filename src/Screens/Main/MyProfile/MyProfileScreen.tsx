import React, { useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { UserState } from "@/Store/User";
import { useSelector } from "react-redux";
import { AppHeader } from "@/Components";
import { StyleService, useStyleSheet, Text } from "@ui-kitten/components";
import Colors from "@/Theme/Colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const MyProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: { user: UserState }) => state.user.item);
  console.log("user---", user);
  const styles = useStyleSheet(themedStyles);

  const changeUrl = (e: any) => {
    const urlPattern = new RegExp(
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
    );
    let string = e;

    if (urlPattern.test(string)) {
      ///clear http && https from string
      string = string.replace("https://", "").replace("http://", "");

      //add https to string
    }
    string = `https://${string}`;
    return string;
  };
  useEffect(() => {}, []);
  return (
    <KeyboardAvoidingView style={styles.container}>
      <AppHeader title="My Profile" />
      <View style={styles.layout}>
        <View style={styles.mainLayout}>
          <View style={styles.userImageContainer}>
            <Image
              style={styles.userImage}
              source={{
                uri: user?.pictureUrl,
              }}
            />
            {user?.verifiedProfessional ? (
              <Image
                style={styles.verifiedImage}
                source={require("../../../Assets/Images/verified.png")}
              />
            ) : null}
          </View>

          <View style={styles.socialIcons}>
            {user?.fbAccount && user?.fbAccount !== "" ? (
              <TouchableOpacity
                onPress={() => {
                  const tempUrl = changeUrl(user?.fbAccount);
                  Linking.openURL(tempUrl);
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../../Assets/Images/facebook.png")}
                />
              </TouchableOpacity>
            ) : null}
            {user?.instagramAccount && user?.instagramAccount !== "" ? (
              <TouchableOpacity
                onPress={() => {
                  const tempUrl = changeUrl(user?.instagramAccount);
                  Linking.openURL(tempUrl);
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../../Assets/Images/instagram.png")}
                />
              </TouchableOpacity>
            ) : null}
            {user?.email && user?.email !== "" ? (
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(`mailto:${user?.email}`);
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../../Assets/Images/email.png")}
                />
              </TouchableOpacity>
            ) : null}

            {user?.websiteUrl && user?.websiteUrl !== "" ? (
              <TouchableOpacity
                onPress={() => {
                  const tempUrl = changeUrl(user?.websiteUrl);
                  Linking.openURL(tempUrl);
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../../Assets/Images/web.png")}
                />
              </TouchableOpacity>
            ) : null}
            {user?.twitterAccount && user?.twitterAccount !== "" ? (
              <TouchableOpacity
                onPress={() => {
                  const tempUrl = changeUrl(user?.twitterAccount);
                  Linking.openURL(tempUrl);
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../../Assets/Images/twitter.png")}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          <ScrollView style={{ flex: 1, width: "100%", marginTop: -520 }}>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 70,
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Following", { id: user?.id })
                }
              >
                <Text style={styles.title}>Following</Text>
                <Text style={styles.number}>{user?.noFollowing}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Followers", { id: user?.id })
                }
              >
                <Text style={styles.title}>Followers</Text>
                <Text style={styles.number}>{user?.noFollowers}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mainInfo}>
              <Text style={styles.label}>Username</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.info}>{user?.username}</Text>
                <MaterialCommunityIcons
                  name="shield"
                  size={20}
                  color={Colors.gold}
                  style={{ marginLeft: 5 }}
                />
              </View>
            </View>
            {user?.city && user?.city !== "" ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.info}>{user?.city}</Text>
              </View>
            ) : null}
            {user?.state && user?.state !== "" ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>State</Text>
                <Text style={styles.info}>{user?.state}</Text>
              </View>
            ) : null}
            {user?.country ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Country</Text>
                <Text style={styles.info}>{user?.country}</Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.label,
                {
                  marginTop: 20,
                  fontWeight: "bold",
                  marginLeft: 50,
                  color: "#000",
                },
              ]}
            >
              Culinary Education
            </Text>

            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>School</Text>
                <Text style={styles.info}>Harvard</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>School Address</Text>
                <Text style={styles.info}>School Address</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Country</Text>
                <Text style={styles.info}>Italy</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>State</Text>
                <Text style={styles.info}>Veneto</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.info}>Venice</Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.label,
                {
                  marginTop: 20,
                  fontWeight: "bold",
                  marginLeft: 50,
                  color: "#000",
                },
              ]}
            >
              Work Info
            </Text>

            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.info}>Chef</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Company</Text>
                <Text style={styles.info}>KFC</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Company Address</Text>
                <Text style={styles.info}>Company Address</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Country</Text>
                <Text style={styles.info}>Italy</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>State</Text>
                <Text style={styles.info}>Veneto</Text>
              </View>
            ) : null}
            {true ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.info}>Venice</Text>
              </View>
            ) : null}

            {user?.bio ? (
              <View style={styles.mainInfo}>
                <Text style={styles.label}>Bio</Text>
                <ScrollView style={{ maxHeight: 100 }}>
                  <Text style={styles.info}>{user?.bio}</Text>
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MyProfileScreen;

const themedStyles = StyleService.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  mainLayout: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 2,
    flexDirection: "column",
    backgroundColor: "background-basic-color-1",
    justifyContent: "flex-start",
  },
  headerContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    minHeight: 50,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: Colors.gray,
    textAlign: "center",
  },
  background: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  userImageContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  userImage: {
    height: 100,
    width: 100,
    borderRadius: 100 / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  verifiedImage: {
    height: 20,
    width: 20,
    borderRadius: 20 / 2,
    overflow: "hidden",
    marginTop: 10,
  },
  icon: {
    justifyContent: "center",
    maxHeight: 30,
    maxWidth: 30,
  },
  title: { textAlign: "center", width: 100, color: "darkgrey" },
  number: {
    textAlign: "center",
    width: 100,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  mainInfo: {
    marginHorizontal: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray,
    paddingVertical: 7,
  },
  label: {
    color: "darkgrey",
    fontSize: 14,
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
  },
});
