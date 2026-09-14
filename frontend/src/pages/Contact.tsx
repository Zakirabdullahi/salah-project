import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Stack,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Email, Phone, LocationOn, Send, ExpandMore } from "@mui/icons-material";
import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 2 }}
          >
            GET IN TOUCH
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>
            We're Here to Help
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            Have questions about salah's Project? Reach out to our team.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 8,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 4,
                color: "var(--color-text-primary)",
              }}
            >
              Contact Information
            </Typography>
            <Stack spacing={4}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Email sx={{ color: "var(--color-teal)" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Email Us
                  </Typography>
                  <Typography sx={{ color: "var(--color-text-secondary)" }}>
                    support@nexgen.co.ke
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Phone sx={{ color: "var(--color-teal)" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Call Us
                  </Typography>
                  <Typography sx={{ color: "var(--color-text-secondary)" }}>
                    +254 700 000 000
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <LocationOn sx={{ color: "var(--color-teal)" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Visit Us
                  </Typography>
                  <Typography sx={{ color: "var(--color-text-secondary)" }}>
                    Nairobi, Kenya
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: 1.5 }}>
            <Paper
              sx={{
                p: 5,
                borderRadius: "24px",
                border: "1px solid var(--color-border)",
              }}
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <TextField
                      label="Full Name"
                      fullWidth
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <TextField
                      label="Email Address"
                      fullWidth
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Box>
                  <TextField
                    label="Subject"
                    fullWidth
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                  <TextField
                    label="Message"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<Send />}
                    sx={{
                      py: 2,
                      bgcolor: "var(--color-primary)",
                      borderRadius: "12px",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "var(--color-primary-dark)" },
                    }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: "rgba(13, 148, 136, 0.05)", py: 12 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            textAlign="center"
            sx={{ fontWeight: 800, mb: 6, color: "var(--color-text-primary)" }}
          >
            Frequently Asked Questions
          </Typography>
          <Stack spacing={2}>
            {[
              {
                q: "Is my financial data secure?",
                a: "Absolutely. salah's Project uses industry-standard encryption and we never store your bank credentials. Your privacy is our top priority.",
              },
              {
                q: "How does the AI Advisor help me?",
                a: "Our AI analyzes your spending habits and provides personalized tips on how to save more, avoid over-budgeting, and reach your goals faster.",
              },
              {
                q: "Can I use salah's Project across multiple devices?",
                a: "Yes! Your account syncs perfectly across your phone, tablet, and laptop so you always have your finances at your fingertips.",
              },
              {
                q: "Is there a cost for using salah's Project?",
                a: "The basic version for students is completely free. We are committed to helping university students master their finances.",
              },
              {
                q: "How do I set up my first budget?",
                a: "Simply go to the Budgets page, click 'Create Budget', and enter your expected income and expenses for the month. Our AI will guide you!",
              },
            ].map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  borderRadius: "16px !important",
                  mb: 1,
                  boxShadow: "none",
                  border: "1px solid var(--color-border)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "var(--color-primary)" }} />}
                  sx={{ py: 1 }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "var(--color-text-primary)" }}
                  >
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pb: 3 }}>
                  <Typography sx={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Contact;
