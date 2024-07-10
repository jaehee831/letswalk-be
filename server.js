const express = require('express');
const router = express.Router(); // express.Router()로 라우터 생성
const mongoose = require('mongoose');

// 포인트 스키마 정의
const PointSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String },
    coordinates: []
  }
});

// 사용자 스키마 정의
const UserLoginSchema = new mongoose.Schema({
  name: String,
  user_id: {type: String, unique: true},
  password: String
});

// 포인트 리스트 스키마 정의
const PointListSchema = new mongoose.Schema({
  name:String,
  points: [PointSchema]
}); ;


const PointList = mongoose.model('PointList', PointListSchema);
const UserLogin = mongoose.model('UserLogin', UserLoginSchema);

// 포인트 리스트 생성하기
router.post('/pointslist', async (req, res) => {
  try {
    const { name } = req.body;
    console.log({name})
    const pointList = new PointList({ name, points: [] });
    console.log("REACHED HERE")
    await pointList.save();
    console.log("HOW ABOUT HERE")
    res.status(201).json(pointList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 포인트 리스트에 포인트 추가하기
router.post('/pointslist/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates } = req.body;
    const point = {
      name,
      location: {
        type: 'Point',
        coordinates
      }
    };

    const pointList = await PointList.findById(id);
    if (!pointList) {
      return res.status(404).json({ error: 'Point list not found' });
    }

    pointList.points.push(point);
    await pointList.save();

    res.status(201).json(point);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 사용자 로그인 정보 생성하기
router.post('/userslogin', async (req, res) => {
  try {
    const { name, user_id, password } = req.body;
    const userLogin = new UserLogin({ name, user_id, password});
    await userLogin.save();
    res.status(201).json(userLogin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// 모든 포인트 리스트 가져오기
router.get('/pointslist', async (req, res) => {
  try {
    const pointLists = await PointList.find();
    res.json(pointLists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 특정 포인트 리스트 가져오기
router.get('/pointslist/:name', async (req, res) => {
    try {
      const { name } = req.params;
      const pointList = await PointList.findOne({ name });
  
      if (!pointList) {
        return res.status(404).json({ error: 'Point list not found' });
      }
  
      res.json(pointList);
    } catch (err) {
      console.error(err);
      
      res.status(500).json({ error: 'Server error' });
    }
  });

  // 포인트 리스트 삭제하기
// router.delete('/pointslist/:name', async (req, res) => {
//     const { name } = req.params;
  
//     try {
//       // 포인트 리스트를 찾고 삭제합니다.
//       const deletedPointList = await PointList.findOne({ name });
//       if (!deletedPointList) {
//         return res.status(404).json({ error: 'Point list not found' });
//       }
  
//       res.json({ message: 'Point list deleted successfully' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
  
  //모든 사용자 로그인 정보 가져오기

  
  router.get('/userslogin', async (req, res) => {
    try {
      const usersLogin = await UserLogin.find();
      res.json(usersLogin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  //특정 사용자 정보만 가져오기 by password
  router.get('/userslogin/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      const userLogin = await UserLogin.findOne({ user_id });
  
      if (!UserLogin) {
        return res.status(404).json({ error: 'UserLogin info not found' });
      }
  
      res.json(userLogin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router; // router를 모듈로 내보내기
