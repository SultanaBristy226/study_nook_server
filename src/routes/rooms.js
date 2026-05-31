const express = require('express');
const router = express.Router();
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom, getMyRooms } = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.get('/', getRooms);
router.get('/my-rooms', auth, getMyRooms);
router.get('/:id', getRoom);
router.post('/', auth, createRoom);
router.put('/:id', auth, updateRoom);
router.delete('/:id', auth, deleteRoom);

module.exports = router;
