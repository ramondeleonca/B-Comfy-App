import { View as BaseView, ViewProps as BaseViewProps } from "react-native";
import { useTheme } from "react-native-paper";

export type ViewProps = { children?: any } & BaseViewProps
export default function View(props: ViewProps) {
    const theme = useTheme();
    return <BaseView {...props} style={{ backgroundColor: theme.colors.background, ...(props.style as any)}}>{props.children}</BaseView>
}