import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  Receipt,
  AccountBalanceWallet,
  Savings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Transactions", icon: <Receipt />, path: "/dashboard/transactions" },
  {
    text: "Budgets",
    icon: <AccountBalanceWallet />,
    path: "/dashboard/budgets",
  },
  { text: "Savings", icon: <Savings />, path: "/dashboard/savings" },
];

const Sidebar = ({ onNavClick }: { onNavClick?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    if (onNavClick) onNavClick();
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRight: { xs: "none", md: "1px solid #e0e0e0" },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
      }}
    >
      <Box sx={{ p: 4, pb: 2 }}>
        <Typography
          variant="h5"
          fontWeight="900"
          sx={{ color: "#1a1a1a", letterSpacing: "-0.5px" }}
        >
          salah's Project.
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              component="button"
              key={item.text}
              onClick={() => handleNav(item.path)}
              sx={{
                mb: 1.5,
                borderRadius: "8px",
                bgcolor: isActive ? "#f0f4f8" : "transparent",
                color: isActive ? "#1e3a8a" : "#64748b",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                display: "flex",
                alignItems: "center",
                p: 1.5,
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight="600">{item.text}</Typography>}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
export default Sidebar;
