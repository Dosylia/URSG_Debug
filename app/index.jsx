import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, ScrollView } from "react-native";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from "../components";
import React, { useState, useEffect } from 'react';
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
import { images } from "../constants";

export default function App() {
  const [errors, setErrors] = useState('');
  const [error, setError] = useState();

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        "666369513537-fvmdrlsup4oca1ahbojmmc5anpdtj7cv.apps.googleusercontent.com",
      androidClientId:
        "666369513537-fjqstc75ba8c0vo0joq0v0infi4l9drj.apps.googleusercontent.com",
    });
    console.log("Google Sign-In configured");
  };

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const signIn = async () => {
    try {
      console.log("Attempting to sign in with Google");
      await GoogleSignin.hasPlayServices();
      console.log("Google Play Services are available");
      const userInfo = await GoogleSignin.signIn();
      setError();
      submitForm(userInfo); // Call submitForm with userInfo
    } catch (e) {
      console.error("Error during Google sign-in:", e);
      console.error("Error code:", e.code);
      console.error("Error message:", e.message);
      setError(e);
    }
  };

  function submitForm(userInfo) {

    const googleId = userInfo.user.id;
    const fullName = userInfo.user.name;
    const givenName = userInfo.user.givenName;
    const familyName = userInfo.user.familyName;
    const imageUrl = userInfo.user.photo;
    const email = userInfo.user.email;

    if (googleId && fullName && givenName && familyName && imageUrl && email) {
      const userData = { googleId, fullName, givenName, familyName, imageUrl, email };
      console.log("Submitting form with user data:", userData);

      fetch('https://ur-sg.com/googleTest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "googleData=" + encodeURIComponent(JSON.stringify(userData))
    })
      .then(response => response.json())
      .then(data => {
        console.log("Response from server:", data);
        if (data.message !== "Success") {
          setErrors(data.message);
          return;
        }

        setSession('googleSession', data.googleUser);

        if (!data.newUser) {
          setSession('userSession', data.user);

          if (data.userExists) {
            if (data.leagueUserExists) {
              setSession('leagueSession', data.leagueUser);

              if (data.lookingForUserExists) {
                setSession('lookingforSession', data.lookingForUser);
                console.log("Navigating to /swiping");
                router.push("/swiping");
              } else {
                console.log("Navigating to /lookingfor-data");
                router.push("/lookingfor-data");
              }
            } else {
              console.log("Navigating to /league-data");
              router.push("/league-data");
            }
          } else {
            console.log("Navigating to /basic-info");
            router.push("/basic-info");
          }
        }
      })
      .catch(error => {
        console.error("Error submitting form:", error);
        setErrors('Error submitting form');
      });
    } else {
      console.error("Please fill all fields.");
      setErrors('Please fill all fields.');
    }
  }

  return (
    <SafeAreaView className="bg-darkgrey h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full flex justify-normal items-center h-full px-4">
          <Image
            source={images.logoWhite}
            className="w-[150px] h-[100px] mt-5"
            resizeMode='contain'
          />
          <Image
            source={images.ahri}
            className="max-w-[380px] w-full h-[300px] rounded-md"
            resizeMode='contain'
          />
          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Find your perfect {"\n"}
              soulmate with {' '}
              <Text className="text-mainred">URSG</Text>
            </Text>
          </View>
          <Text className="text-center text-white mt-5 font-pregular mb-5">
            Level up your game with your future match
          </Text>
          {errors ? <Text className="text-red-600 text-xl my-2">{errors}</Text> : null}
          <CustomButton
            title="Join with Google.."
            handlePress={signIn}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light' />
    </SafeAreaView>
  );
}
