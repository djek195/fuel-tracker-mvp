import { Alert } from "@mui/material";

export function AlertBox({ message, severity = "error" }: { message?: string; severity?: "error" | "info" | "success" | "warning" }) {
    if (!message) return null;
    return <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>;
}