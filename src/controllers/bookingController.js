const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, totalCost, specialNote } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const conflict = await Booking.findOne({
      room: roomId,
      date,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (conflict) return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' });

    const booking = await Booking.create({
      room: roomId,
      user: req.user.id,
      date,
      startTime,
      endTime,
      totalCost,
      specialNote,
      status: 'confirmed',
    });

    await Room.findByIdAndUpdate(roomId, { $inc: { bookingCount: 1 } });
    await User.findByIdAndUpdate(req.user.id, { $push: { bookings: booking._id } });

    const populated = await booking.populate('room', 'name image hourlyRate floor');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', 'name image hourlyRate floor capacity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    await User.findByIdAndUpdate(req.user.id, { $pull: { bookings: booking._id } });
    await Room.findByIdAndUpdate(booking.room, { $inc: { bookingCount: -1 } });

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
