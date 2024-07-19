const express = require('express');
const router = express.Router(); // express.Router()로 라우터 생성
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');




// 포인트 스키마 정의
const PointSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String },
    coordinates: []
  },
  address: String
});

// 사용자 스키마 정의
const UserLoginSchema = new mongoose.Schema({
  name: String,
  user_id: {type: String, unique: true},
  desc: String,
  complt_thema: { type: [String], default: [] },
  phonenumber: String,
  profileImage: String 
});

// 토큰 아이디 전환 스키마 정의
const TokenToIdSchema = new mongoose.Schema({
  token: String,
  user_id: String
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // 파일 저장 경로 설정
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 파일 이름 설정
  }
});

const upload = multer({ storage: storage });

// 파일 업로드 처리 라우트
router.post('/upload', upload.single('imageFile'), (req, res) => {
  console.log("HOWABOUTHERE");
  try {
    if (!req.file) {
      throw new Error('업로드할 파일이 선택되지 않았습니다.');
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    console.log("GOT HERE GOTAHC")
    // 업로드된 파일 정보 반환
    res.json({
      filePath: filePath,
      fileName: fileName,
      fileSize: fileSize
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error.message);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
  }
});


// 포인트 리스트 스키마 정의
const PointListSchema = new mongoose.Schema({
  name: {type: String, unique: true},
  points: [PointSchema],
  desc: String,
  review: String,
  likePeople: { type: [String], default: [] }
}); ;


const PointList = mongoose.model('PointList', PointListSchema);
const UserLogin = mongoose.model('UserLogin', UserLoginSchema);
const TokenToId = mongoose.model('TokenToId', TokenToIdSchema);

// 포인트 리스트 생성하기
router.post('/pointslist', async (req, res) => {
  try {
    const { name, desc, review } = req.body;
    console.log({name})
    const existingPointListName = await PointList.findOne({ name });
    if(existingPointListName){
      return res.status(200).json("Existing Name");
    }
    const pointList = new PointList({ name: name, points: [], desc: desc, review: review});
    await pointList.save();
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
    const { name, coordinates, address } = req.body;
    const point = {
      name,
      location: {
        type: 'Point',
        coordinates
      },
      address
    };
    console.log(address)
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


// 포인트 리스트에 사용자 추가하기
router.put('/pointslist/:id/add-liked-person', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // 추가할 사용자의 user_id

    // 포인트 리스트를 찾고 해당 id가 존재하는지 확인합니다.
    const pointList = await PointList.findById(id);
    if (!pointList) {
      return res.status(404).json({ error: 'Point list not found' });
    }

    // 이미 LikedPeople에 user_id가 포함되어 있는지 확인합니다.
    if (pointList.likePeople.includes(user_id)) {
      return res.status(400).json({ error: 'User already exists in LikedPeople' });
    }

    // LikedPeople 배열에 사용자 추가
    pointList.likePeople.push(user_id);
    await pointList.save();

    res.json(pointList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// 포인트 리스트에서 사용자 제거하기
router.put('/pointslist/:id/remove-liked-person', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // 제거할 사용자의 user_id

    // 포인트 리스트를 찾고 해당 id가 존재하는지 확인합니다.
    const pointList = await PointList.findById(id);
    if (!pointList) {
      return res.status(404).json({ error: 'Point list not found' });
    }

    // LikedPeople 배열에서 사용자 제거
    pointList.likePeople = pointList.likePeople.filter(userId => userId !== user_id);
    await pointList.save();

    res.json(pointList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 사용자 로그인 정보 생성하기
// router.post('/userslogin', async (req, res) => {
//   try {
//     var { name, user_id, desc, phoneNumber } = req.body;
//     var existingUserloginID = await UserLogin.findOne({ user_id });
//     var num = 0;
//     console.log(`fisrt check : $existingUserloginID`);
//     while(existingUserloginID){
//       user_id = user_id.split(' letswalk')[0];
//       user_id = `${user_id} letswalk${num}`;
//       num += 1;
//       existingUserloginID = await UserLogin.findOne({ user_id });
//       console.log(user_id);
//     }

//     // const profileImage = req.file ? req.file.path : null;

//     const userLogin = new UserLogin({  
//       name: name,
//       user_id: user_id,
//       desc: desc,
//       phonenumber: phoneNumber
//     });
//     await userLogin.save();
//     res.status(201).json(userLogin);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.post('/userslogin', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, user_id, desc, phoneNumber } = req.body;
    let profileImage = null;

    // 이미지 업로드 처리
    if (req.file) {
      profileImage = req.file.path;
    }

    const existingUserloginID = await UserLogin.findOne({ user_id });
    let num = 0;
    while (existingUserloginID) {
      user_id = user_id.split(' letswalk')[0];
      user_id = `${user_id} letswalk${num}`;
      num += 1;
      existingUserloginID = await UserLogin.findOne({ user_id });
    }

    const userLogin = new UserLogin({
      name: name,
      user_id: user_id,
      desc: desc,
      phonenumber: phoneNumber,
      profileImage: profileImage // 프로필 이미지 경로 저장
    });

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

  router.get('/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname,'uploads/', filename);
    console.log("FILEPATHIS:", filepath);
    // 파일이 존재하는지 확인 후 스트림으로 전송
    fs.exists(filepath, (exists) => {
      if (!exists) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // 이미지 파일을 스트림으로 읽어 클라이언트로 전송
      const readStream = fs.createReadStream(filepath);
      readStream.pipe(res);
    });
  });

  //특정 사용자 정보만 가져오기 by user_id
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

  //userlogin 정보 수정
  // router.put('/userslogin/:user_id', async (req, res) => {
  //   try {
  //     const { user_id } = req.params;
  //     const { name, desc, phoneNumber } = req.body;
  
  //     // user_id를 기준으로 사용자 정보를 찾아서 업데이트합니다.
  //     const updatedUser = await UserLogin.findOneAndUpdate(
  //       { user_id: user_id },
  //       { name: name, desc: desc, phonenumber: phoneNumber },
  //       { new: true } // 옵션: 업데이트 후 새로운 문서 반환
  //     );
  //     if (!updatedUser) {
  //       return res.status(404).json({ error: 'UserLogin info not found' });
  //     }
  
  //     res.json(updatedUser);
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: 'Server error' });
  //   }
  // });


  router.put('/userslogin/:user_id', upload.single('profileImage'), async (req, res) => {
    try {
      const { user_id } = req.params;
      const { name, desc, phoneNumber } = req.body;
      let profileImage = null;
  
      // 이미지 업로드 처리
      if (req.file) {
        profileImage = req.file.path;
        // 기존 이미지 파일 삭제 (선택적으로)
        const user = await UserLogin.findOne({ user_id });
        if (user.profileImage) {
          fs.unlinkSync(user.profileImage);
        }
      }

      const updateFields = { name, desc, phonenumber: phoneNumber };
      if (profileImage) {
        updateFields.profileImage = profileImage;
      }
  
  
      const updatedUser = await UserLogin.findOneAndUpdate(
        { user_id: user_id },
        { $set: updateFields },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'UserLogin info not found' });
      }
  
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });


 
  
  //userlogin의 complt_thema에 값 추가
  router.put('/userslogin/:user_id/add-complt-thema', async (req, res) => {
    try {
      const { user_id } = req.params;
      const { complt_thema_item } = req.body; // 요소 추가할 내용
  
      // user_id를 기준으로 사용자 정보를 찾습니다.
      const userLogin = await UserLogin.findOne({ user_id });
  
      if (!userLogin) {
        return res.status(404).json({ error: 'UserLogin info not found' });
      }
  
      // complt_thema 배열에 새로운 요소를 추가합니다.
      userLogin.complt_thema.push(complt_thema_item);
      await userLogin.save();
  
      res.json(userLogin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

//토큰 아이디 전환 객체 생성하기
router.post('/tokenstoid', async (req, res) => {
  try {
    const { token, user_id } = req.body;
    const tokenToId = new TokenToId({ token, user_id});
    await tokenToId.save();
    res.status(201).json(token);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
  
//토큰으로 아이디 불러오기
router.get('/tokenstoid/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user_id = await TokenToId.findOne({ token });

    if (!user_id) {
      return res.status(200).json(null);
    }

    res.json(user_id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
  
module.exports = router; // router를 모듈로 내보내기
