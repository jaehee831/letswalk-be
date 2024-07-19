const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const serverRouter = require('./server'); // server.js 파일을 가져옴
const cors = require('cors'); // cors 패키지를 가져옴
const app = express();

const PORT = process.env.PORT || 80;

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/letswalk', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// body-parser 미들웨어 사용
app.use(bodyParser.json());

app.use(cors());

// server.js 파일에서 정의한 Express 라우터를 사용
app.use(serverRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
