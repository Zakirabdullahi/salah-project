import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../api/axiosConfig";
import {
  Psychology,
  TrendingDown,
  TrendingUp,
  AccountBalanceWallet,
  WarningAmber,
  InfoOutlined,
  EventNote,
} from "@mui/icons-material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

// API Fetchers
const fetchKPIs = async () => (await api.get("analytics/kpis/")).data;
const fetchAIAdvice = async () => (await api.get("analytics/ai-advisor/")).data;
const fetchPredictions = async () =>
  (await api.get("analytics/predictions/")).data;
const fetchHealthScore = async () =>
  (await api.get("analytics/health-score/")).data;
const fetchTrends = async () => (await api.get("analytics/trends/")).data;
const fetchNotifications = async () => (await api.get("notifications/")).data;

const formatKSh = (val: any) =>
  val != null
    ? `KSh ${Number(val).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`
    : "KSh 0";

const Dashboard = () => {
  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: fetchKPIs });
  const { data: aiAdvice } = useQuery({
    queryKey: ["ai-advice"],
    queryFn: fetchAIAdvice,
  });
  const { data: predictions } = useQuery({
    queryKey: ["predictions"],
    queryFn: fetchPredictions,
  });
  const { data: healthScore } = useQuery({
    queryKey: ["health-score"],
    queryFn: fetchHealthScore,
  });
  const { data: trends } = useQuery({
    queryKey: ["trends"],
    queryFn: fetchTrends,
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const score = healthScore?.score || 0;

  const aiChartData = useMemo(() => {
    if (!aiAdvice?.breakdown) return null;
    return {
      labels: Object.keys(aiAdvice.breakdown),
      datasets: [
        {
          data: Object.values(aiAdvice.breakdown),
          backgroundColor: [
            "#1e3a8a",
            "#0d9488",
            "#16a34a",
            "#dc2626",
            "#ca8a04",
            "#7c3aed",
          ],
          borderWidth: 0,
          hoverOffset: 15,
        },
      ],
    };
  }, [aiAdvice]);

  const chartData = useMemo(() => {
    if (!trends) return null;
    return {
      labels: trends.map((t: any) => t.month),
      datasets: [
        {
          label: "Income",
          data: trends.map((t: any) => t.income),
          backgroundColor: "rgba(22, 163, 74, 0.8)",
          borderRadius: 8,
        },
        {
          label: "Expenses",
          data: trends.map((t: any) => t.expense),
          backgroundColor: "rgba(220, 38, 38, 0.8)",
          borderRadius: 8,
        },
      ],
    };
  }, [trends]);

  return (
    <Box sx={{ color: "var(--color-text-primary)" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        Financial Overview
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
          mb: 4,
        }}
      >
        
        <Paper
          sx={{
            flex: 1,
            p: 3,
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bgcolor: "var(--color-bg-card)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, alignSelf: "flex-start" }}
          >
            Financial Health
          </Typography>
          <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
            <CircularProgress
              variant="determinate"
              value={score}
              size={160}
              thickness={5}
              sx={{
                color:
                  score > 70 ? "var(--color-income)" : "var(--color-warning)",
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {score}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", opacity: 0.6 }}>
                Score
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              color:
                score > 70 ? "var(--color-income)" : "var(--color-warning)",
            }}
          >
            {score > 70 ? "Excellent Habits!" : "Room for Improvement"}
          </Typography>
        </Paper>

        
        <Paper
          sx={{
            flex: 2,
            p: 4,
            borderRadius: "24px",
            background: "var(--gradient-primary)",
            color: "white",
            boxShadow: "0 8px 32px rgba(30, 58, 138, 0.2)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ height: "100%", alignItems: "center" }}
          >
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 2, alignItems: "center" }}
              >
                <Psychology sx={{ fontSize: "2.5rem" }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  AI Finance Advisor
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontStyle: "italic",
                  fontSize: "1rem",
                  opacity: 0.9,
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                Insight-driven guidance for your student lifestyle.
              </Typography>
              
              <Stack spacing={2}>
                {(aiAdvice?.advice || "").split("|").map((tip: string, i: number) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ 
                      minWidth: 24, height: 24, borderRadius: "50%", 
                      bgcolor: "var(--color-teal)", display: "flex", 
                      alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 800
                    }}>
                      {i + 1}
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      {tip.trim()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", md: 220 },
                height: 220,
                position: "relative",
              }}
            >
              {aiChartData && (
                <Doughnut
                  data={aiChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: "75%",
                  }}
                />
              )}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  pointerEvents: "none",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {formatKSh(aiAdvice?.total_expenses)}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", opacity: 0.7 }}>
                  Spent
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>

      
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {[
          {
            label: "Net Balance",
            value: formatKSh(kpis?.balance),
            icon: <AccountBalanceWallet />,
            color: "var(--color-primary)",
          },
          {
            label: "Yearly Outlook (2026)",
            value: formatKSh(kpis?.total_year_expense),
            icon: <EventNote />,
            color: "var(--color-teal)",
            trend: kpis?.expense_trend
          },
          {
            label: "Days until Zero",
            value: predictions?.days_until_zero || "N/A",
            icon: <TrendingDown />,
            color: "var(--color-expense)",
          },
        ].map((kpi: any, idx) => (
          <Paper
            key={idx}
            sx={{
              flex: "1 1 250px",
              p: 3,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "var(--color-bg-card)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: kpi.color,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {kpi.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {kpi.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {kpi.value}
              </Typography>
              {kpi.trend !== undefined && (
                <Typography 
                  sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: kpi.trend > 0 ? 'var(--color-expense)' : 'var(--color-income)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 0.5
                  }}
                >
                  {kpi.trend > 0 ? <TrendingUp fontSize="inherit"/> : <TrendingDown fontSize="inherit"/>}
                  {Math.abs(kpi.trend)}% vs last month
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", xl: "row" },
          gap: 3,
        }}
      >
        
        <Paper sx={{ flex: 2, p: 3, borderRadius: "24px", bgcolor: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Income vs Expenses
          </Typography>
          <Box sx={{ height: 300 }}>
            {chartData && (
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            )}
          </Box>
        </Paper>

    
        <Paper sx={{ flex: 1, p: 3, borderRadius: "24px", bgcolor: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Live Alerts
          </Typography>
          <Stack spacing={2}>
            {!notifications || notifications.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "var(--color-bg-main)",
                  borderRadius: "16px",
                }}
              >
                <Typography
                  sx={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  All clear! No alerts.
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 3).map((notif: any) => (
                <Box
                  key={notif.id}
                  sx={{
                    p: 2,
                    bgcolor: notif.message.includes("🚨")
                      ? "var(--color-expense-light)"
                      : "var(--color-primary-light)",
                    color: notif.message.includes("🚨")
                      ? "var(--color-expense)"
                      : "var(--color-primary)",
                    borderRadius: "16px",
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                  }}
                >
                  {notif.message.includes("🚨") ? (
                    <WarningAmber />
                  ) : (
                    <InfoOutlined />
                  )}
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      {notif.message.includes("🚨")
                        ? "Overspending Alert"
                        : "Financial Tip"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                      {notif.message}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
