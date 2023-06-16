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

import React, { useState } from 'react';

import { SafeAreaView, Text, View } from 'react-native';
import EngineScreen from './components/EngineScreen';

const App = () => {

  return (
    <>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <EngineScreen />
    </SafeAreaView>
    </>
  );
};

export default App;
