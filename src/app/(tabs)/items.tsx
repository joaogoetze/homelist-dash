import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet } from 'react-native';

type Item = {
    id: number;
    list_id: number;
    name: string;
    checked: boolean;
};

export default function ItemScreen() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    
    const getItems = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:3000/items');
            const data = await response.json();

            setItems(data);
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Button title="Get items" onPress={getItems} />

            {loading && <ActivityIndicator size="large" style={styles.loading} />}

            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ThemedView style={styles.item}>
                        <ThemedText>{item.list_id}</ThemedText>
                        <ThemedText>{item.name}</ThemedText>
                        <ThemedText>{item.checked.toString()}</ThemedText>
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