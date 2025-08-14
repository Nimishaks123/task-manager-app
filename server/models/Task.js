const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    color: String,
    repeat: {
      type: Boolean,
      default: false,
    },
    repeatType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
    tag: String,
    // Enhanced date fields
    dueDate: {
      type: Date,
      default: null
    },
    scheduledDate: {
      type: Date,
      default: null
    },
    // For future recurring task features
    lastCompletedDate: {
      type: Date,
      default: null
    },
    nextDueDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
taskSchema.index({ user: 1, scheduledDate: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, tag: 1 });

module.exports = mongoose.model("Task", taskSchema);
