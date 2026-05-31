const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getRooms = async (req, res) => {
  try {
    const { search, amenities, minRate, maxRate, floor, limit } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (amenities) {
      const list = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $in: list };
    }
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    if (floor) query.floor = { $regex: floor, $options: 'i' };
    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? Number(limit) : 0);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'name email photoURL');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;
    const user = await User.findById(req.user.id);
    const room = await Room.create({
      name, description, image, floor,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      amenities: amenities || [],
      owner: req.user.id,
      ownerName: user?.name,
      ownerEmail: user?.email,
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden: not the owner' });
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden: not the owner' });
    await Booking.deleteMany({ room: req.params.id });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
