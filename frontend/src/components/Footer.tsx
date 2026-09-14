import {
  Box,
  Typography,
  Container,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import { Twitter, Facebook, Instagram, LinkedIn, ArrowUpward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: "var(--color-primary-dark)",
        color: "white",
        pt: 10,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 6, mb: 6 }}>
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" } }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, mb: 2, color: "white" }}
            >
              salah's Project.
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              The ultimate financial intelligence platform for students in
              Kenya. Track, save, and grow your wealth with AI-powered insights.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[Twitter, Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <IconButton 
                  key={i}
                  size="small"
                  sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flex: "1 1 150px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              Platform
            </Typography>
            <Stack spacing={2}>
              {["Dashboard", "Features", "Our Mission"].map((text) => (
                <Typography
                  key={text}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: '0.2s',
                    "&:hover": { color: "white", transform: 'translateX(5px)' },
                  }}
                  onClick={() => navigate(text === "Dashboard" ? "/login" : "/")}
                >
                  {text}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flex: "1 1 150px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              Company
            </Typography>
            <Stack spacing={2}>
              {["About Us", "Meet Our Team", "Testimonials"].map((text) => (
                <Typography
                  key={text}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: '0.2s',
                    "&:hover": { color: "white", transform: 'translateX(5px)' },
                  }}
                  onClick={() => navigate("/")}
                >
                  {text}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flex: "1 1 150px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              Support
            </Typography>
            <Stack spacing={2}>
              {["Contact Us", "Privacy Policy", "Terms of Service"].map((text) => (
                <Typography
                  key={text}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: '0.2s',
                    "&:hover": { color: "white", transform: 'translateX(5px)' },
                  }}
                  onClick={() => navigate(text === "Contact Us" ? "/contact" : "/")}
                >
                  {text}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.1)" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
            © 2026 salah's Project. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
                color: "rgba(255,255,255,0.7)", 
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { color: 'white' }
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            BACK TO TOP <ArrowUpward fontSize="small" />
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
