import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosConfig";

const fetchProfile = async () => (await api.get("users/profile/")).data;
const fetchNotifications = async () => (await api.get("notifications/")).data;

const GlobalHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated, logout } = useAuthStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: isAuthenticated,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    { label: "About Us", path: "#about", icon: <InfoIcon /> },
    { label: "Testimonials", path: "#testimonials", icon: <MessageIcon /> },
    { label: "Our Team", path: "#team", icon: <GroupIcon /> },
    { label: "Contact Us", path: "/contact", icon: <MessageIcon /> },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith("#")) {
      if (isLanding) {
        const element = document.getElementById(path.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/" + path);
      }
    } else {
      navigate(path);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, color: "var(--color-primary)" }}
        >
          salah's Project.
        </Typography>
        <IconButton onClick={() => setMobileMenuOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNav(item.path)}
              sx={{
                borderRadius: "12px",
                mb: 1,
                "&:hover": { bgcolor: "var(--color-primary-light)" },
              }}
            >
              <ListItemIcon sx={{ color: "var(--color-primary)" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 3 }} />
      {!isAuthenticated && (
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/register")}
            sx={{
              bgcolor: "var(--color-income)",
              borderRadius: "12px",
              fontWeight: 700,
              py: 1.5,
            }}
          >
            Get Started
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/login")}
            sx={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              borderRadius: "12px",
              fontWeight: 700,
              py: 1.5,
            }}
          >
            Log in
          </Button>
        </Stack>
      )}
    </Box>
  );

  if (!isAuthenticated || isLanding) {
    return (
      <Box
        sx={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 6 },
          bgcolor: "white",
          position: "sticky",
          top: 0,
          zIndex: 1100,
          boxShadow: isLanding ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: "var(--color-primary)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            salah's Project.
          </Typography>
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 3 }}>
            {navItems.map((item) => (
              <Typography
                key={item.label}
                onClick={() => handleNav(item.path)}
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  "&:hover": { color: "var(--color-primary)" },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {!isMobile && (
            <>
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate("/register")}
                sx={{
                  bgcolor: "var(--color-primary)",
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { bgcolor: "var(--color-primary-dark)" },
                }}
              >
                Get Started
              </Button>
            </>
          )}
          {isMobile && (
            <IconButton onClick={() => setMobileMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{ sx: { width: 280 } }}
        >
          {drawer}
        </Drawer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 4,
        bgcolor: "white",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isMobile && (
          <IconButton onClick={onMenuClick} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            display: { xs: "block", md: "none" },
            color: "var(--color-primary)",
          }}
        >
          salah's Project.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          sx={{ mr: 2 }}
          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ color: "var(--color-text-secondary)" }} />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          sx={{ mt: 1 }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400, borderRadius: "16px" },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={async () => {
                  await api.post("notifications/mark_all_read/");
                  setNotifAnchorEl(null);
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          {notifications?.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon
                sx={{ fontSize: "3rem", opacity: 0.1, mb: 1 }}
              />
              <Typography
                sx={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications?.map((notif: any) => (
              <MenuItem
                key={notif.id}
                sx={{
                  py: 1.5,
                  borderBottom: "1px solid #f0f0f0",
                  bgcolor: notif.is_read
                    ? "transparent"
                    : "rgba(30, 58, 138, 0.03)",
                  whiteSpace: "normal",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: notif.is_read
                      ? "transparent"
                      : "var(--color-primary)",
                    visibility: notif.is_read ? "hidden" : "visible",
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: notif.is_read ? 500 : 700,
                    }}
                  >
                    {notif.message}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {new Date(notif.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar sx={{ bgcolor: "var(--color-primary)", fontWeight: 700 }}>
            {profile?.first_name
              ? profile.first_name[0].toUpperCase()
              : profile?.email
                ? profile.email[0].toUpperCase()
                : "U"}
          </Avatar>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "var(--color-text-primary)",
                fontSize: "0.9rem",
              }}
            >
              {profile?.first_name
                ? `${profile.first_name} ${profile.last_name || ""}`
                : profile?.email?.split("@")[0] || "User"}
            </Typography>
            <Typography
              sx={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}
            >
              {profile?.university
                ? `${profile.university} | Year ${profile.year_of_study || "?"}`
                : "Student"}
            </Typography>
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          sx={{ mt: 1 }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <MenuItem onClick={() => navigate("/dashboard/settings")}>
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ color: "var(--color-expense)" }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default GlobalHeader;
