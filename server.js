const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ١. وەرگرتنی زانیاری بەکارهێنەر
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  let user = db.get('users').find({ id: userId }).value();

  if (!user) {
    user = { id: userId, username: `User_${userId}`, points: 0, watched_ads: 0 };
    db.get('users').push(user).write();
  }

  res.json({ success: true, user });
});

// ٢. زۆرکردنی خاڵ کاتێک بەکارهێنەر ڕیکلام سەیر دەکات
app.post('/api/watch-ad', (req, res) => {
  const { userId } = req.body;

  let user = db.get('users').find({ id: userId }).value();

  if (!user) {
    user = { id: userId, username: `User_${userId}`, points: 10, watched_ads: 1 };
    db.get('users').push(user).write();
  } else {
    db.get('users')
      .find({ id: userId })
      .assign({ points: user.points + 10, watched_ads: user.watched_ads + 1 })
      .write();
  }

  const updatedUser = db.get('users').find({ id: userId }).value();

  res.json({
    success: true,
    message: "١٠ خاڵ زیادکرا!",
    points: updatedUser.points,
    watched_ads: updatedUser.watched_ads
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`سێرڤەر بەبێ هیچ هەڵەیەک لەسەر پۆڕتی ${PORT} چالاکبوو...`);
});
