import { View } from "react-native";
import { Chip } from "react-native-paper";

type ChipProps = {
    data: Record<string, string>;
    selected: string[];
    onSelect: (selected: string[]) => void;
}
export default function Chips(props: ChipProps) {
    return (
        <View style={{ width: "100%", paddingTop: 30, flex: 1, flexWrap: "wrap", justifyContent: "flex-start", alignItems: "flex-start" }}>
            {
                Object.keys(props.data).map((key, index) => (
                    <Chip key={index} style={{ marginVertical: 5 }} selected={props.selected.includes(key)} showSelectedOverlay onPress={() => props.onSelect(props.selected.includes(key) ? props.selected.filter(val => val != key) : [...props.selected, key])}>{props.data[key]}</Chip>
                ))
            }
        </View>
    )
}