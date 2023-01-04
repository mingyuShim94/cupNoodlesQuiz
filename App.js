import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Stack from "./Navigation/Stack";
import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import problemList from "./assets/problemList";

const appFont = require("./assets/font1.ttf");

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        SplashScreen.preventAutoHideAsync();
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync(
          "insungitCutelivelyjisu",
          require("./assets/font1.ttf")
        );

        const imageAssets = problemList.map((data) => {
          return Asset.fromModule(data.img).downloadAsync();
        });

        // problemList.map(async (data) => {
        //   await Asset.fromModule(data.img).downloadAsync();
        //   await Asset.fromModule(data.imgBlur).downloadAsync();
        //   // await Asset.loadAsync(data.img);
        //   await Asset.loadAsync(data.imgBlur);
        // });
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        //await new Promise((resolve) => setTimeout(resolve, 2000));

        // console.log("hi", imageAssets[0]);
        await Promise.all([...imageAssets]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);
  if (!appIsReady) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack />
    </NavigationContainer>
  );
}
