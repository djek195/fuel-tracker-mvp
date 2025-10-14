import React, { createContext, useCallback, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";

type Snack = { message: string; severity?: AlertColor; key: number };
type Ctx = { enqueue: (message: string, severity?: AlertColor) => void };

const SnackbarCtx = createContext<Ctx | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<Snack[]>([]);
    const [current, setCurrent] = useState<Snack | null>(null);
    const [open, setOpen] = useState(false);

    const processQueue = useCallback(() => {
        if (current || queue.length === 0) return;
        const next = queue[0];
        setCurrent(next);
        setOpen(true);
        setQueue((q) => q.slice(1));
    }, [current, queue]);

    const enqueue = useCallback<Ctx["enqueue"]>((message, severity = "info") => {
        setQueue((q) => [...q, { message, severity, key: Date.now() + Math.random() }]);
    }, []);

    const handleClose = () => setOpen(false);
    const handleExited = () => setCurrent(null);

    React.useEffect(() => {
        if (!current && queue.length > 0) processQueue();
    }, [queue, current, processQueue]);

    return (
        <SnackbarCtx.Provider value={{ enqueue }}>
            {children}
            <Snackbar
                key={current?.key}
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                TransitionProps={{ onExited: handleExited }}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={current?.severity || "info"}>
                    {current?.message}
                </MuiAlert>
            </Snackbar>
        </SnackbarCtx.Provider>
    );
}

export function useSnackbar() {
    const ctx = useContext(SnackbarCtx);
    if (!ctx) throw new Error("useSnackbar must be used within <SnackbarProvider>");
    return ctx;
}