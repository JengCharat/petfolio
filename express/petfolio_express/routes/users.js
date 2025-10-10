
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

module.exports = router;
