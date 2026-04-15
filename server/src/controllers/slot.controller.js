import TimeSlot from '../models/TimeSlot.js';
import { generateSlots } from '../services/slot.service.js';
import { SLOT_STATUS } from '../utils/constants.js';
import * as api from '../utils/apiResponse.js';

export async function bulkCreateSlots(req, res, next) {
  try {
    const { date, dates, startTime, endTime, duration = 30, timezone } = req.body;
    const targetDates = dates || [date];

    if (!targetDates.length || !startTime || !endTime) {
      return api.error(res, 'Date, startTime, and endTime are required', 400);
    }

    const slotTemplates = generateSlots(null, startTime, endTime, duration);
    const docs = [];

    for (const d of targetDates) {
      for (const s of slotTemplates) {
        docs.push({
          doctorId: req.user.userId,
          date: new Date(d),
          startTime: s.startTime,
          endTime: s.endTime,
          duration,
          timezone: timezone || 'Asia/Kolkata',
        });
      }
    }

    // insertMany with ordered:false skips duplicates (unique index catches them)
    let inserted = 0;
    try {
      const result = await TimeSlot.insertMany(docs, { ordered: false });
      inserted = result.length;
    } catch (err) {
      if (err.code === 11000 || err.insertedDocs) {
        inserted = err.insertedDocs?.length || 0;
      } else {
        throw err;
      }
    }

    return api.success(res, { inserted, total: docs.length }, `${inserted} slots created`);
  } catch (err) {
    next(err);
  }
}

export async function getMySlots(req, res, next) {
  try {
    const { from, to } = req.query;
    const filter = { doctorId: req.user.userId };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const slots = await TimeSlot.find(filter).sort({ date: 1, startTime: 1 });
    return api.success(res, { slots });
  } catch (err) {
    next(err);
  }
}

export async function getAvailableSlots(req, res, next) {
  try {
    const { date, from, to } = req.query;
    const filter = {
      doctorId: req.params.doctorId,
      status: SLOT_STATUS.AVAILABLE,
    };

    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const slots = await TimeSlot.find(filter).sort({ date: 1, startTime: 1 });
    return api.success(res, { slots });
  } catch (err) {
    next(err);
  }
}

export async function deleteSlot(req, res, next) {
  try {
    const slot = await TimeSlot.findOne({
      _id: req.params.slotId,
      doctorId: req.user.userId,
      status: SLOT_STATUS.AVAILABLE,
    });

    if (!slot) {
      return api.error(res, 'Slot not found or already booked', 404);
    }

    await TimeSlot.deleteOne({ _id: slot._id });
    return api.success(res, null, 'Slot deleted');
  } catch (err) {
    next(err);
  }
}

export async function blockSlot(req, res, next) {
  try {
    const slot = await TimeSlot.findOneAndUpdate(
      { _id: req.params.slotId, doctorId: req.user.userId, status: SLOT_STATUS.AVAILABLE },
      { status: SLOT_STATUS.BLOCKED },
      { new: true }
    );

    if (!slot) return api.error(res, 'Slot not found or not available', 404);
    return api.success(res, { slot }, 'Slot blocked');
  } catch (err) {
    next(err);
  }
}
