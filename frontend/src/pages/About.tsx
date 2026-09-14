import { Box, Typography, Container, Stack } from "@mui/material";
import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";

const About = () => {
  return (
    <Box sx={{ bgcolor: "var(--color-bg-main)", minHeight: "100vh" }}>
      <GlobalHeader />

      <Box
        sx={{
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 15 },
          background:
            "linear-gradient(135deg, var(--color-primary-dark), var(--color-teal-dark))",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
            filter: "blur(80px)",
          }}
        />

        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              color: "var(--color-teal-light)",
            }}
          >
            OUR MISSION
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4rem" },
            }}
          >
            Empowering Your Journey to Financial Freedom
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, lineHeight: 1.6, fontWeight: 400 }}
          >
            We believe that every student in Kenya deserves the tools and
            intelligence to master their money, build wealth, and secure their
            future.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack spacing={10}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 8,
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: "var(--color-text-primary)",
                }}
              >
                Why salah's Project?
              </Typography>
              <Typography
                sx={{
                  color: "var(--color-text-secondary)",
                  fontSize: "1.2rem",
                  lineHeight: 1.8,
                }}
              >
                Managing finances as a student is often overwhelming. Between
                tuition, rent, and daily expenses, it's easy to lose track.
                salah's Project was built to solve this problem
                using cutting-edge AI and data-driven insights.
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                bgcolor: "white",
                p: 5,
                borderRadius: "24px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, mb: 2, color: "var(--color-primary)" }}
              >
                Our Vision
              </Typography>
              <Typography sx={{ color: "var(--color-text-secondary)", mb: 3 }}>
                To become the #1 financial compass for students across Africa,
                moving beyond simple tracking to real-time AI-guided wealth
                creation.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    p: 2,
                    bgcolor: "var(--color-bg-muted)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "var(--color-teal)" }}
                  >
                    100%
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Localized (KSh)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    p: 2,
                    bgcolor: "var(--color-bg-muted)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "var(--color-primary)" }}
                  >
                    AI
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Gemini-Powered
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
};

export default About;
