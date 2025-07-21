// client/src/components/manager/ManagerOverview.jsx
// ManagerOverview component for displaying key statistics and sales graph in the manager dashboard

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';


// Register Chart.js components (required for v3+)
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
import { Card, CardContent, Typography, Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReplayIcon from "@mui/icons-material/Replay";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import "../../styles/ManagerOverview.css";




import apiClient from '../../services/api/apiClient';


const useManagerStats = () => {
  const [stats, setStats] = useState({
    inProgress: 0,
    redo: 0,
    sales: 0,
    salesData: [],
    salesLabels: []
  });


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/booking/all');
        const bookings = res.data || [];


        // In-progress: status === 'pending' or 'confirmed'
        const inProgress = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
        // Redo: status === 'redo' (if you have this status, otherwise set to 0)
        const redo = bookings.filter(b => b.status === 'redo').length;
        // Sales: total paid bookings
        const sales = bookings.filter(b => b.paymentStatus === 'paid').length;


        // Revenue: sum of price for paid bookings
        // const revenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.price || 0), 0);


        // Bookings per month (for the last 7 months)
        const now = new Date();
        const months = [];
        const salesData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(d.toLocaleString('default', { month: 'short' }));
          const monthNum = d.getMonth();
          const yearNum = d.getFullYear();
          const count = bookings.filter(b => {
            const bd = new Date(b.date);
            return bd.getMonth() === monthNum && bd.getFullYear() === yearNum;
          }).length;
          salesData.push(count);
        }


        setStats({
          inProgress,
          redo,
          sales,
          salesData,
          salesLabels: months
        });
      } catch (err) {
        setStats({
          inProgress: 0,
          redo: 0,
          sales: 0,
          salesData: [],
          salesLabels: []
        });
      }
    };
    fetchStats();
  }, []);
  return stats;
};


export default function ManagerOverview() {
  const { inProgress, redo, sales, salesData, salesLabels } = useManagerStats();


  return (
    <div className="manager-overview">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className="overview-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon color="primary" /> In-Progress Bookings
              </Typography>
              <Typography variant="h4">{inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="overview-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ReplayIcon color="warning" /> Redo Bookings
              </Typography>
              <Typography variant="h4">{redo}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="overview-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MonetizationOnIcon color="success" /> Sales
              </Typography>
              <Typography variant="h4">{sales}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <div className="sales-graph-section">
        <Card className="sales-graph-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon color="info" /> Sales (Bookings) Over Time
            </Typography>
            <Bar
              data={{
                labels: salesLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: salesData,
                    backgroundColor: "#1976d2"
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
