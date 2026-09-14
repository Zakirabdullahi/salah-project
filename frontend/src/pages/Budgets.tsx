import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  LinearProgress,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import { AccountBalance, Add, Warning, CheckCircle } from "@mui/icons-material";

const fetchBudgets = async () => (await api.get("budgets/")).data;
const fetchTransactions = async () => (await api.get("transactions/")).data;

export const MASTER_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Academic / Tuition",
  "Rent & Utilities",
  "Wifi & Data Bundles",
  "Personal Care & Health",
  "Shopping & Clothing",
  "M-Pesa & Bank Charges",
  "Entertainment",
  "Savings Deposit",
  "Income / Allowance",
  "Others",
];

const Budgets = () => {
  const queryClient = useQueryClient();
  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });
  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState("");

  const mutation = useMutation({
    mutationFn: (newBudget: any) => api.post("budgets/", newBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setCategory("");
      setCustomCategory("");
      setLimit("");
      toast.success("Budget set successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Others" ? customCategory : category;
    if (!finalCategory) return toast.error("Please specify a category.");
    mutation.mutate({
      category: finalCategory,
      limit: parseFloat(limit),
      month: `${month.substring(0, 7)}-01`,
    });
  };

  const formatKSh = (val: any) =>
    val != null
      ? `KSh ${Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : "KSh 0";

  const getSpendForCategory = (cat: string) => {
    if (!transactions) return 0;
    return transactions
      .filter(
        (t: any) =>
          t.category.toLowerCase() === cat.toLowerCase() &&
          t.type === "EXPENSE",
      )
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
  };

  return (
    <Box sx={{ color: "var(--color-text-primary)" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        Budgets
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
              <Add sx={{ color: "var(--color-primary)" }} /> Set Limit
            </Typography>

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {MASTER_CATEGORIES.filter(
                  (c) => c !== "Income / Allowance",
                ).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {category === "Others" && (
              <TextField
                fullWidth
                label="Specify Other Category"
                placeholder="e.g. Gifts, Holiday"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            )}

            <TextField
              fullWidth
              label="Limit (KSh)"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Select Date"
              type="date"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Budgets are typically set for the 1st of each month to cover the entire period."
              required
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
              Set Budget
            </Button>
          </Stack>
        </Paper>

        
        <Box sx={{ flex: 2, display: "flex", flexWrap: "wrap", gap: 3 }}>
          {budgets?.map((b: any) => {
            const spent = getSpendForCategory(b.category);
            const progress = Math.min((spent / b.limit) * 100, 100);
            const isOver = spent > b.limit;

            return (
              <Paper
                key={b.id}
                sx={{
                  flex: "1 1 300px",
                  p: 3,
                  borderRadius: "24px",
                  bgcolor: "white",
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${isOver ? "var(--color-expense-light)" : "var(--color-border)"}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={2}
                  alignItems="center"
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalance
                      sx={{ color: "var(--color-text-secondary)" }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {b.category}
                    </Typography>
                  </Box>
                  <Chip
                    label={isOver ? "Over Budget" : "Healthy"}
                    color={isOver ? "error" : "success"}
                    size="small"
                    icon={isOver ? <Warning /> : <CheckCircle />}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Spent: {formatKSh(spent)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Limit: {formatKSh(b.limit)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "var(--color-bg-muted)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: isOver
                          ? "var(--color-expense)"
                          : "var(--color-income)",
                      },
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Period: {b.month}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Budgets;
