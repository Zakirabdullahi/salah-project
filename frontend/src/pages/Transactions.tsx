import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import {
  Add,
  ReceiptLong,
  TrendingUp,
  TrendingDown,
  DeleteOutline,
  AutoAwesome,
  CloudUpload,
  ContentPaste,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { MASTER_CATEGORIES } from "./Budgets";

const fetchTransactions = async () => (await api.get("transactions/")).data;

const Transactions = () => {
  const queryClient = useQueryClient();
  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const [tabIndex, setTabIndex] = useState(0);

  // Manual Entry States
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // SMS Import States
  const [smsText, setSmsText] = useState("");
  const [parsedData, setParsedData] = useState<any[] | null>(null);

  // Statement Import States
  const [file, setFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [parsedStatement, setParsedStatement] = useState<any[] | null>(null);

  const mutation = useMutation({
    mutationFn: (newTransaction: any) =>
      api.post("transactions/", newTransaction),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["ai-advice"] });

      if (data.data.alert_message) {
        toast.error(data.data.alert_message, {
          position: "top-right",
          autoClose: 10000,
          theme: "colored",
        });
      } else {
        toast.success("Transaction saved successfully!");
      }

      setCategory("");
      setCustomCategory("");
      setAmount("");
      setDescription("");
    },
  });

  const smsMutation = useMutation({
    mutationFn: (text: string) => api.post("transactions/parse_sms/", { text }),
    onSuccess: (res) => {
      setParsedData(res.data);
      if (res.data.length > 0) {
        toast.info(`AI found ${res.data.length} transactions in your text.`);
      } else {
        toast.warning(
          "AI couldn't find any clear transactions. Try pasting more details.",
        );
      }
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        "AI was unable to parse this text. Please try again.";
      toast.error(msg);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post("transactions/upload_statement/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      setParsedStatement(res.data.transactions);
      toast.info(
        `AI extracted ${res.data.transactions.length} transactions from your statement.`,
      );
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        "Failed to process statement. Check your PDF password.";
      toast.error(msg, { position: "top-right" });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (txs: any[]) =>
      api.post("transactions/bulk_create/", { transactions: txs }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(res.data.message);

      if (res.data.alerts?.length > 0) {
        const uniqueAlerts = res.data.alerts;
        if (uniqueAlerts.length > 2) {
          toast.warning(
            `⚠️ Budget Alert: You have exceeded limits in ${uniqueAlerts.length} categories! See notifications for details.`,
            {
              position: "top-right",
              autoClose: 10000,
            },
          );
        } else {
          uniqueAlerts.forEach((alert: string) =>
            toast.error(alert, { autoClose: 8000 }),
          );
        }
      }
      setParsedData(null);
      setParsedStatement(null);
      setSmsText("");
      setFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`transactions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.info("Transaction deleted.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "Others" ? customCategory : category;
    mutation.mutate({
      type,
      category: finalCategory,
      amount: parseFloat(amount),
      description,
    });
  };

  const formatKSh = (val: any) =>
    val != null
      ? `KSh ${Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : "KSh 0";

  const handleFileUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (pdfPassword) formData.append("password", pdfPassword);
    uploadMutation.mutate(formData);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
        Transactions
      </Typography>

      <Paper
        sx={{
          mb: 4,
          borderRadius: "24px",
          bgcolor: "white",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="fullWidth"
          sx={{
            bgcolor: "var(--color-income-dark)",
            "& .MuiTab-root": { fontWeight: 700, py: 2.5 },
            "& .Mui-selected": { color: "var(--color-primary)" },
          }}
        >
          <Tab
            icon={<Add />}
            label="Manual Entry"
            iconPosition="start"
            sx={{ color: "white" }}
          />
          <Tab
            icon={<ContentPaste />}
            label="Magic SMS"
            iconPosition="start"
            sx={{ color: "white" }}
          />
          <Tab
            icon={<CloudUpload />}
            label="Smart Statement"
            iconPosition="start"
            sx={{ color: "white" }}
          />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {tabIndex === 0 && (
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    label="Type"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="INCOME">Income</MenuItem>
                    <MenuItem value="EXPENSE">Expense</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {MASTER_CATEGORIES.filter((c) =>
                      type === "INCOME"
                        ? c === "Income / Allowance" || c === "Others"
                        : c !== "Income / Allowance",
                    ).map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {category === "Others" && (
                <TextField
                  fullWidth
                  label="Specify Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
              <TextField
                fullWidth
                label="Amount (KSh)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
                sx={{
                  py: 2,
                  borderRadius: "12px",
                  bgcolor: "var(--color-primary)",
                  fontWeight: 700,
                }}
              >
                {mutation.isPending ? "Saving..." : "Save Transaction"}
              </Button>
            </Stack>
          )}

          {tabIndex === 1 && (
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Paste your M-Pesa SMS or any transaction text here. AI will
                instantly categorize it.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g. SJR5H6J7K8 Confirmed. Ksh 500 sent to..."
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={() => smsMutation.mutate(smsText)}
                disabled={!smsText || smsMutation.isPending}
                sx={{
                  py: 2,
                  bgcolor: "var(--color-teal)",
                  fontWeight: 700,
                  borderRadius: "12px",
                }}
              >
                {smsMutation.isPending
                  ? "AI is Thinking..."
                  : "Magic Parse text"}
              </Button>

              {parsedData && (
                <Box
                  sx={{
                    mt: 2,
                    p: 3,
                    bgcolor: "var(--color-bg-main)",
                    borderRadius: "16px",
                    border: "1px dashed var(--color-teal)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, color: "var(--color-teal)" }}
                  >
                    AI Parsed Results
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {parsedData.map((tx: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {tx.category}
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>
                            {formatKSh(tx.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, bgcolor: "var(--color-primary)" }}
                    onClick={() => bulkMutation.mutate(parsedData)}
                  >
                    Confirm & Save All
                  </Button>
                </Box>
              )}
            </Stack>
          )}

          {tabIndex === 2 && (
            <Stack spacing={3}>
              {!parsedStatement ? (
                <>
                  <Box
                    sx={{
                      p: 4,
                      border: "2px dashed var(--color-border)",
                      borderRadius: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: "var(--color-bg-main)",
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { borderColor: "var(--color-primary)" },
                    }}
                    component="label"
                  >
                    <CloudUpload sx={{ fontSize: "3rem", opacity: 0.3 }} />
                    <Typography sx={{ fontWeight: 600 }}>
                      Click to select M-Pesa PDF or CSV statement
                    </Typography>
                    {file && (
                      <Chip label={file.name} color="primary" sx={{ mt: 1 }} />
                    )}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.csv,.xlsx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </Box>
                  <TextField
                    label="PDF Password (ID Number)"
                    type="password"
                    size="small"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    helperText="Required only if your PDF is locked."
                  />
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesome />}
                    fullWidth
                    disabled={!file || uploadMutation.isPending}
                    onClick={handleFileUpload}
                    sx={{
                      py: 2,
                      bgcolor: "var(--color-primary)",
                      fontWeight: 700,
                      borderRadius: "12px",
                    }}
                  >
                    {uploadMutation.isPending
                      ? "AI is Extracting..."
                      : "Process Statement"}
                  </Button>
                </>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Preview: {parsedStatement.length} Items Found
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 300,
                      overflowY: "auto",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>
                            Description
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parsedStatement.map((tx, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{tx.category}</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>
                              {formatKSh(tx.amount)}
                            </TableCell>
                            <TableCell sx={{ opacity: 0.7 }}>
                              {tx.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ py: 1.5 }}
                      onClick={() => bulkMutation.mutate(parsedStatement)}
                    >
                      Save All Transactions
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ py: 1.5 }}
                      onClick={() => setParsedStatement(null)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* Recent History Table */}
      <Paper
        sx={{
          p: 4,
          borderRadius: "24px",
          bgcolor: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReceiptLong sx={{ color: "var(--color-teal)" }} /> Complete History
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 800, color: "var(--color-text-secondary)" }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 800, color: "var(--color-text-secondary)" }}
                >
                  Category
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 800,
                    color: "var(--color-text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell sx={{ width: 60 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                ?.slice()
                .reverse()
                .map((t: any) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ opacity: 0.6, fontSize: "0.85rem" }}>
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {t.category}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>
                        {t.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatKSh(t.amount)}
                        size="small"
                        icon={
                          t.type === "INCOME" ? (
                            <TrendingUp />
                          ) : (
                            <TrendingDown />
                          )
                        }
                        sx={{
                          fontWeight: 900,
                          borderRadius: "8px",
                          bgcolor:
                            t.type === "INCOME"
                              ? "var(--color-income-light)"
                              : "var(--color-expense-light)",
                          color:
                            t.type === "INCOME"
                              ? "var(--color-income)"
                              : "var(--color-expense)",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Transactions;
