import { createContext, useContext, useState } from "react";

type AppContextType = {
    deviceAddress: string | null,
    setDeviceAddress: (device: string) => void,
};

const AppContext = createContext<AppContextType | null>(null);

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
    const [deviceAddress, setDeviceAddress] = useState<string | null>(null);

    return (
        <AppContext.Provider value={{
            deviceAddress,
            setDeviceAddress
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within a AppContextProvider");
    return context;
}