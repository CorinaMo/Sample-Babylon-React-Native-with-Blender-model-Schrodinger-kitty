/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, useWindowDimensions } from 'react-native';
import EngineScreen from './components/EngineScreen';

const App = () => {
  // This is going to do the scaling for you when the user change the device
  // orientation, which is just unlock on AR mode to capture the right
  // dimensions of the photo when the user takes a pic with the app
  const {height, width} = useWindowDimensions(); 

  return (
    <>
    <SafeAreaView style={{ flex: 1, width: width, height: height }}>
        <EngineScreen />
    </SafeAreaView>
    </>
  );
};

export default App;
