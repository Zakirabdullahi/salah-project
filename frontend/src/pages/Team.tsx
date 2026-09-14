import { Box, Typography, Container, Avatar } from "@mui/material";
import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";

const teamMembers = [
  {
    name: "Dr. Emily Chen",
    role: "Head of AI Strategy",
    description: "Expert in Generative AI and Financial Forecasting models.",
  },
  {
    name: "Marcus Otieno",
    role: "Full Stack Architect",
    description:
      "Driving the development of localized FinTech solutions in Kenya.",
  },
  {
    name: "Sarah Jepkosgei",
    role: "UX Designer",
    description: "Specialized in student-centric financial interfaces.",
  },
  {
    name: "Kevin Mutua",
    role: "Data Scientist",
    description: "Managing the Gemini-based predictive analytics engine.",
  },
];

const Team = () => {
  return (
    <Box sx={{ bgcolor: "var(--color-bg-main)", minHeight: "100vh" }}>
      <GlobalHeader />

      <Box
        sx={{
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 15 },
          background:
            "linear-gradient(135deg, var(--color-primary), var(--color-teal))",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 2 }}
          >
            INNOVATORS
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>
            The Minds Behind salah's Project
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            A diverse team committed to revolutionizing how students manage
            money.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center",
          }}
        >
          {teamMembers.map((member) => (
            <Box
              key={member.name}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 16px)",
                  md: "calc(25% - 24px)",
                },
                bgcolor: "white",
                p: 4,
                borderRadius: "24px",
                border: "1px solid var(--color-border)",
                textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                  bgcolor: "var(--color-bg-muted)",
                  color: "var(--color-primary)",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                }}
              >
                {member.name[0]}
              </Avatar>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "var(--color-text-primary)" }}
              >
                {member.name}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "var(--color-teal)", fontWeight: 700, mb: 2 }}
              >
                {member.role}
              </Typography>
              <Typography
                sx={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                {member.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Team;
