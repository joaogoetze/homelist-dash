import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'Items',
        }}
      />
    </Tabs>
  );
}
