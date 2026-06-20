
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export default function App(){
 const [count , setCount]=useState(0)
    return(
    <View style={styles.container}>
    <Pressable onPress={()=>setCount(count+1)} style={styles.button}>
    <Text style={styles.container}>like button : {count}</Text>
    </Pressable> </View>)
}

