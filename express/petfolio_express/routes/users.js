
const User = require("../models/User"); // เพิ่ม import
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get("/all_user",async(req,res)=>{
    try{
        const users = await User.find({})
        res.json(users);
    }catch(err){
        res.status(500).json({error:err.message})
    }
})


router.put("/ban/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId }); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    user.status = user.status === "active" ? "banned" : "active";

    await user.save();

    res.json({
      message: `User ${user.username} is now ${user.status}`,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
