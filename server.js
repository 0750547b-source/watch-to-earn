const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// نەخشەی خوێندنەوەی زانیارییەکان لە پەڕگەی JSON
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      videos: [
        { id: 1, title: "ڤیدیۆی یەکەم: ناساندنی ئەپەکە", rewardCoins: 10, durationSec: 30 },
        { id: 2, title: "ڤیدیۆی دووەم: چۆنیەتی کۆکردنەوەی خاڵ", rewardCoins: 15, durationSec: 45 }
      ],
      withdrawals: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// نەخشەی پاشەکەوتکردنی زانیارییەکان
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ١. لاپەڕەی سەرەکی
app.get('/', (req, res) => {
  res.send('Server running with JSON persistence & Withdrawal system!');
});

// ٢. تۆمارکردنی بەکارهێنەری نوێ
app.post('/api/register', (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'تکایە ناو و ئیمەیڵ بپڕێنەرەوە.' });
  }

  const db = readData();
  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە.' });
  }

  const newUser = { id: db.users.length + 1, username, email, coins: 0 };
  db.users.push(newUser);
  saveData(db);

  res.status(201).json({ success: true, message: 'بەکارهێنەر تۆمارکرا', user: newUser });
});

// ٣. هێنانی لیستی ڤیدیۆکان
app.get('/api/videos', (req, res) => {
  const db = readData();
  res.json({ success: true, videos: db.videos });
});

// ٤. وەرگرتنی خەڵاتی دیدەنی ڤیدیۆ
app.post('/api/claim-reward', (req, res) => {
  const { userId, videoId } = req.body;
  const db = readData();

  const user = db.users.find(u => u.id === userId);
  const video = db.videos.find(v => v.id === videoId);

  if (!user) return res.status(404).json({ success: false, message: 'بەکارهێنەر نەدۆزرایەوە.' });
  if (!video) return res.status(404).json({ success: false, message: 'ڤیدیۆ نەدۆزرایەوە.' });

  user.coins += video.rewardCoins;
  saveData(db);

  res.json({
    success: true,
    message: `پیرۆزە! ${video.rewardCoins} خاڵ زیۆاد بوو.`,
    totalCoins: user.coins
  });
});

// ٥. APIی داواکردنی ڕاکێشانی پارە/خەڵات (Withdrawal API)
app.post('/api/withdraw', (req, res) => {
  const { userId, amountCoins, paymentMethod, accountNumber } = req.body;
  const db = readData();

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'بەکارهێنەر نەدۆزرایەوە.' });

  if (user.coins < amountCoins) {
    return res.status(400).json({ success: false, message: 'خاڵی پێویستت نییە بۆ ئەم داواکارییە.' });
  }

  user.coins -= amountCoins;

  const newWithdrawal = {
    id: db.withdrawals.length + 1,
    userId,
    amountCoins,
    paymentMethod, // وەک FastPay, AsiaHawala, ZainCash
    accountNumber,
    status: 'pending',
    date: new Date().toISOString()
  };

  db.withdrawals.push(newWithdrawal);
  saveData(db);

  res.status(201).json({
    success: true,
    message: 'داواکاری ڕاکێشانی پارە بە سەرکەوتوویی تۆمارکرا.',
    remainingCoins: user.coins,
    withdrawal: newWithdrawal
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
