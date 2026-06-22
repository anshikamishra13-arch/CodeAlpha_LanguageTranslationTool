const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Bug 5: added name and phone — required by auth routes
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },

    // Bug 1: added match regex — rejects strings that aren't valid emails
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },

    // Bug 2: select: false — passwordHash never returned in queries by default
    // Bug 3: minlength: 60 — bcrypt hashes are always 60 chars; rejects blank/truncated values
    passwordHash: { type: String, required: true, select: false, minlength: 60 },

    // Bug 5: role field for future admin/user distinction
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  // Bug 4: timestamps: true — Mongoose auto-manages createdAt AND updatedAt
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);