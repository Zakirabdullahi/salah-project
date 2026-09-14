import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Avatar,
  Rating,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";
import {
  ArrowForward,
  Psychology,
  Savings,
  TrendingUp,
} from "@mui/icons-material";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--color-bg-main)",
      }}
    >
      <GlobalHeader />
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(to bottom, #0EA5E9 0%, #7DD3FC 100%)",
          px: { xs: 3, md: 10 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            {/* LEFT CONTENT */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 1000,
                  fontSize: { xs: "3.5rem", md: "4.7rem" },
                  color: "white",
                  lineHeight: 1,
                  mb: 3,
                  letterSpacing: "-0.02em",
                  textShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                Take Control of <br /> Your Money
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.4rem" },
                  color: "white",
                  opacity: 0.9,
                  mb: 4,
                  maxWidth: "500px",
                }}
              >
                Safe, simple, and smart digital tracking all in one place.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  sx={{
                    bgcolor: "#065F46",
                    color: "white",
                    px: 5,
                    py: 1.8,
                    borderRadius: "30px",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#064E3B" },
                  }}
                >
                  Open an account
                </Button>

                <Button
                  sx={{
                    bgcolor: "white",
                    color: "#065F46",
                    px: 5,
                    py: 1.8,
                    borderRadius: "30px",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  Explore Cards
                </Button>
              </Stack>
            </Box>

            {/* RIGHT IMAGE */}
            <Box
              sx={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/images/hero1.png"
                alt="hero"
                sx={{
                  position: { xs: "relative", lg: "absolute" },
                  right: { lg: "130px" },
                  top: { lg: "50%" },
                  transform: { lg: "translateY(-50%)" },

                  width: {
                    xs: "100%",
                    sm: "80%",
                    md: "400px",
                    lg: "500px",
                  },

                  mt: { xs: 4, lg: 0 },
                  zIndex: 5,
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Box id="features" sx={{ py: 15, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              textAlign: "center",
              mb: 10,
              color: "var(--color-text-primary)",
            }}
          >
            Why{" "}
            <span style={{ color: "var(--color-primary)" }}>
              Our System
            </span>
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ justifyContent: "center" }}
          >
            {[
              {
                icon: <Psychology />,
                title: "Gemini AI Insights",
                desc: 'Personalized advice like "Reduce food spend by 15% to save KSh 2,000".',
                color: "var(--color-primary)",
              },
              {
                icon: <Savings />,
                title: "Smart Goal Tracking",
                desc: "See exactly how many days until you reach your tuition or laptop goal.",
                color: "var(--color-teal)",
              },
              {
                icon: <TrendingUp />,
                title: "Predictive Analytics",
                desc: "Forecasting tells you exactly when you will run out of money based on burn rate.",
                color: "var(--color-income)",
              },
            ].map((feature, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  p: 5,
                  borderRadius: "24px",
                  transition: "all 0.3s ease",
                  border: "1px solid var(--color-border)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "16px",
                    bgcolor: feature.color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography
                  sx={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}
                >
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box id="about" sx={{ py: 15, bgcolor: "var(--color-bg-muted)" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 10,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "var(--color-primary)",
                  fontWeight: 800,
                  letterSpacing: 2,
                }}
              >
                ABOUT US
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 3 }}>
                Empowering Financial Literacy
              </Typography>
              <Typography
                sx={{
                  color: "var(--color-text-secondary)",
                  fontSize: "1.2rem",
                  lineHeight: 1.8,
                  mb: 4,
                }}
              >
                salah's Project started with a simple question: Why is it so hard for
                students to manage money? We built this platform to integrate
                AI-driven intelligence into your daily spending habits.
              </Typography>
              <Button
                variant="text"
                sx={{
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
                onClick={() => navigate("/about")}
              >
                Read our full story <ArrowForward sx={{ ml: 1 }} />
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  height: 400,
                  bgcolor: "var(--color-primary)",
                  borderRadius: "24px 24px 24px 100px",
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  height: 400,
                  mt: 5,
                  bgcolor: "var(--color-teal)",
                  borderRadius: "24px 100px 24px 24px",
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="testimonials" sx={{ py: 15, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, textAlign: "center", mb: 10 }}
          >
            Trusted by Thousands
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {[
              {
                name: "John D.",
                text: "The AI advice is incredible. It literally told me I was spending too much on lunch!",
                rating: 5,
              },
              {
                name: "Mary W.",
                text: "I saved enough for my tuition arrears in just 3 months using NexGen.",
                rating: 5,
              },
            ].map((t, idx) => (
              <Paper
                key={idx}
                sx={{
                  flex: 1,
                  p: 4,
                  borderRadius: "24px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "none",
                }}
              >
                <Rating value={t.rating} readOnly sx={{ mb: 2 }} />
                <Typography
                  sx={{
                    fontStyle: "italic",
                    mb: 3,
                    color: "var(--color-text-primary)",
                  }}
                >
                  "{t.text}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {t.name[0]}
                  </Avatar>
                  <Typography sx={{ fontWeight: 800 }}>{t.name}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              onClick={() => navigate("/testimonials")}
              sx={{ color: "var(--color-text-secondary)", fontWeight: 700 }}
            >
              See all reviews
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing;
