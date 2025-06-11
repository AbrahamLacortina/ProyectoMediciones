import React, { useState } from "react";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    Alert,
    CircularProgress
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("correo", correo);
            formData.append("password", password);

            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            if (res.ok) {
                await onLogin();
                navigate("/"); // Redirige al inicio tras login exitoso
            } else {
                setError("Credenciales incorrectas.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            bgcolor="#f5f5f5"
        >
            <Paper elevation={4} sx={{ p: 4, width: 350, borderRadius: 3 }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    component="form"
                    onSubmit={handleSubmit}
                    gap={2}
                >
                    <Typography variant="h5" textAlign="center" gutterBottom>
                        <LockIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                        Iniciar Sesión
                    </Typography>

                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : "Ingresar"}
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;