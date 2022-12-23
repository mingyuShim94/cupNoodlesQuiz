import React, { useEffect, useState } from 'react';
import Stack from './Navigation/Stack';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <Stack />
    </NavigationContainer>
  );
}
