import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <AppBar position="sticky" color="primary" enableColorOnDark>
            <Toolbar>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    sx={{ fontWeight: 600, textDecoration: "none" }}
                >
                    FuelTracker
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {isAuthenticated ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {user?.displayName || user?.email}
                        </Typography>
                        <Button variant="outlined" color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button color="inherit" component={RouterLink} to="/signin">
                            Sign In
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/signup">
                            Sign Up
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}