import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet } from 'react-native';

type List = {
    id: number;
    name: string;
    owner_id: number;
};

export default function ListScreen() {
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(false);
    
    const getLists = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:3000/lists');
            const data = await response.json();

            setLists(data);
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Button title="Get lists" onPress={getLists} />

            {loading && <ActivityIndicator size="large" style={styles.loading} />}

            <FlatList
                data={lists}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ThemedView style={styles.item}>
                        <ThemedText>{item.id}</ThemedText>
                        <ThemedText>{item.name}</ThemedText>
                        <ThemedText>{item.owner_id}</ThemedText>
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