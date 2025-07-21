// client/src/components/manager/ManagerBookingList.jsx
// ManagerBookingList component for displaying a list of bookings with filtering options

import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Chip, Button } from "@mui/material";
import apiClient from '../../services/api/apiClient';
import '../../styles/BookingLists.css';


const STATUS_COLORS = {
  pending: 'default',
  confirmed: 'primary',
  completed: 'success',
  redo: 'warning',
  cancelled: 'error',
};


function BookingCard({ booking }) {
  return (
    <Card className="booking-card">
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600}>{booking.customerName || booking.customer?.name}</Typography>
            <Typography variant="body2" color="textSecondary">{booking.email || booking.customer?.email}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2">Service:</Typography>
            <Typography variant="subtitle2">{booking.serviceName || booking.service?.name}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2">Date:</Typography>
            <Typography variant="subtitle2">{new Date(booking.date).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip label={booking.status} color={STATUS_COLORS[booking.status] || 'default'} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2">Payment:</Typography>
            <Chip label={booking.paymentStatus} color={booking.paymentStatus === 'paid' ? 'success' : 'default'} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}


export default function ManagerBookingList() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/booking/all');
        setBookings(res.data || []);
      } catch (err) {
        setBookings([]);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);


  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);
  const tabs = ['all', 'pending', 'confirmed', 'completed', 'redo', 'cancelled'];


  return (
    <div className="booking-lists-container">
      <div className="booking-lists-header">
        <h2>Booking Lists</h2>
        <div className="booking-tabs">
          {tabs.map(t => (
            <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="booking-cards">
        {loading ? <Typography>Loading...</Typography> :
          filtered.length === 0 ? <Typography>No bookings found.</Typography> :
            filtered.map(b => <BookingCard key={b._id} booking={b} />)
        }
      </div>
    </div>
  );
}
