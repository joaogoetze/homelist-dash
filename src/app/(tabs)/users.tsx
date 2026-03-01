import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet } from 'react-native';

type User = {
    id: number;
    name: string;
    email: string;
};

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    
    const getUsers = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:3000/users');
            const data = await response.json();

            setUsers(data);
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Button title="Get users" onPress={getUsers} />

            {loading && <ActivityIndicator size="large" style={styles.loading} />}

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ThemedView style={styles.item}>
                        <ThemedText>{item.id}</ThemedText>
                        <ThemedText>{item.name}</ThemedText>
                        <ThemedText>{item.email}</ThemedText>
                    </ThemedView>
                )}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loading: {
        marginVertical: 20,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
});