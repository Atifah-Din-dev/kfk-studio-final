import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, Drawer } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChatIcon from "@mui/icons-material/Chat";


const sections = [
  { key: "overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "bookings", label: "Booking Lists", icon: <ListAltIcon /> },
  { key: "chat", label: "Chat", icon: <ChatIcon /> }
];


export default function DashboardSidebar({ selected, onSelect }) {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ style: { width: 220, background: '#f5f5f5' } }}
    >
      <div style={{ height: 64 }} /> {/* Spacer for app bar */}
      <List>
        {sections.map((section) => (
          <ListItem
            button
            key={section.key}
            selected={selected === section.key}
            onClick={() => onSelect(section.key)}
            component="a"
            href="#"
          >
            <ListItemIcon>{section.icon}</ListItemIcon>
            <ListItemText primary={section.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}