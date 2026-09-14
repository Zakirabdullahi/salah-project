import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import GlobalHeader from "../components/GlobalHeader";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("users/register/", formData);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error("Registration failed. Check your input.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <GlobalHeader />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "var(--color-bg-main)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            bgcolor: "var(--color-primary-dark)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 8,
          }}
        >
          <Typography variant="h3" fontWeight="900" mb={3}>
            Join salah's Project
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "var(--color-text-light)",
              opacity: 0.8,
              maxWidth: 400,
            }}
          >
            Create an account and start taking control of your financial destiny
            today.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              mb={1}
              sx={{ color: "var(--color-text-primary)" }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body1"
              mb={4}
              sx={{ color: "var(--color-text-secondary)" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--color-income)",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Log in
              </Link>
            </Typography>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="First Name"
                  name="first_name"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleChange}
                />
                <TextField
                  label="Last Name"
                  name="last_name"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Box>
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                fullWidth
                required
                onChange={handleChange}
              />
              <TextField
                label="Email address"
                name="email"
                variant="outlined"
                fullWidth
                required
                onChange={handleChange}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                fullWidth
                required
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  bgcolor: "var(--color-income)",
                  "&:hover": { bgcolor: "var(--color-income)", opacity: 0.9 },
                }}
              >
                Sign Up
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default Register;
