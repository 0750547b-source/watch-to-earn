kconst express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware بۆ خوێندنەوەی زانیارییەکانی جۆری JSON
app.use(express.json());

// داتابێسی کاتی لە ناو یادگەدا (In-Memory Data)
let users = [];
let videos = [
  { id: 1, title: "ڤیدیۆی یەکەم: ناساندنی ئەپەکە", rewardCoins: 10, durationSec: 30 },
  { id: 2, title: "ڤیدیۆی دووەم: چۆنیەتی کۆکردنەوەی خاڵ", rewardCoins: 15, durationSec: 45 }
];

// ١. لاپەڕەی سەرەکی
app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

// ٢. تۆمارکردنی بەکارهێنەری نوێ (Register API)
app.post('/api/register', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'تکایە ناو و ئیمەیڵ بپڕێنەرەوە.' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە.' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    coins: 0
  };

  users.push(newUser);
  res.status(201).json({ success: true, message: 'بەکارهێنەر بە سەرکەوتوویی تۆمارکرا', user: newUser });
});

// ٣. هێنانی لیستی ڤیدیۆکان (Get Videos List)
app.get('/api/videos', (req, res) => {
  res.json({ success: true, videos });
});

// ٤. وەرگرتنی خەڵات دوای دیدەنی ڤیدیۆ (Claim Reward API)
app.post('/api/claim-reward', (req, res) => {
  const { userId, videoId } = req.body;

  const user = users.find(u => u.id === userId);
  const video = videos.find(v => v.id === videoId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'بەکارهێنەر نەدۆزرایەوە.' });
  }
  if (!video) {
    return res.status(404).json({ success: false, message: 'ڤیدیۆ نەدۆزرایەوە.' });
  }

  // زیۆادکردنی خاڵەکان
  user.coins += video.rewardCoins;

  res.json({
    success: true,
    message: `پیرۆزە! ${video.rewardCoins} خاڵ زیۆاد بوی بۆ هەژمارەکەت.`,
    totalCoins: user.coins
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

