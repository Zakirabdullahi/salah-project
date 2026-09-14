import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  LinearProgress,
  Stack,
  Chip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import {
  EmojiEvents,
  Add,
  LocalOffer,
} from "@mui/icons-material";

const fetchSavings = async () => (await api.get("savings/")).data;

const Savings = () => {
  const queryClient = useQueryClient();
  const { data: savings } = useQuery({
    queryKey: ["savings"],
    queryFn: fetchSavings,
  });

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const mutation = useMutation({
    mutationFn: (newGoal: any) => api.post("savings/", newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setDeadline("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount) || 0,
      deadline: deadline || null,
    });
  };

  const formatKSh = (val: any) =>
    val != null
      ? `KSh ${Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : "KSh 0";

  return (
    <Box sx={{ color: "var(--color-text-primary)" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        Savings Goals
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
        }}
      >
       
        <Paper
          sx={{
            flex: 1,
            p: 4,
            borderRadius: "24px",
            bgcolor: "white",
            height: "fit-content",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Add sx={{ color: "var(--color-primary)" }} /> New Goal
            </Typography>
            <TextField
              fullWidth
              label="Goal Name"
              placeholder="e.g. New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Target Amount (KSh)"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Initial Deposit"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
            <TextField
              fullWidth
              label="Target Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              sx={{
                py: 1.5,
                borderRadius: "12px",
                bgcolor: "var(--color-primary)",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Create Goal
            </Button>
          </Stack>
        </Paper>

        
        <Box sx={{ flex: 2, display: "flex", flexWrap: "wrap", gap: 3 }}>
          {savings?.map((s: any) => {
            const progress = Math.min(
              (s.current_amount / s.target_amount) * 100,
              100,
            );
            const remaining = Math.max(s.target_amount - s.current_amount, 0);

          
            let suggestion = "";
            if (s.deadline) {
              const daysLeft = Math.max(
                Math.ceil(
                  (new Date(s.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
                1,
              );
              suggestion = `Save KSh ${Math.ceil(remaining / daysLeft)} / day to hit your goal on time.`;
            } else {
              suggestion =
                "Set a deadline to receive daily saving suggestions.";
            }

            return (
              <Paper
                key={s.id}
                sx={{
                  flex: "1 1 300px",
                  p: 3,
                  borderRadius: "24px",
                  bgcolor: "white",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid var(--color-border)",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "var(--color-teal-light)",
                      color: "var(--color-teal)",
                      borderRadius: "10px",
                      display: "flex",
                    }}
                  >
                    <EmojiEvents />
                  </Box>
                  <Chip
                    label={`${Math.round(progress)}%`}
                    color={progress > 50 ? "success" : "primary"}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {s.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-secondary)",
                    mb: 2,
                  }}
                >
                  Target: {formatKSh(s.target_amount)}
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                  {formatKSh(s.current_amount)}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "var(--color-bg-muted)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "var(--color-teal)",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: "var(--color-bg-muted)",
                    borderRadius: "12px",
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <LocalOffer
                    sx={{ fontSize: "1rem", color: "var(--color-primary)" }}
                  />
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {suggestion}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Savings;
