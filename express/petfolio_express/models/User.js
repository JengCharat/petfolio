const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true }, // เพิ่ม field userId
    username: { type: String, required: true, unique: true, maxlength: 20 },
    email: { type: String, required: true, unique: true },
    role:{type:String,required:true,
    enum:['user','admin'],
    default:'user'},
    password: { type: String, required: true },
   }, {timestamps:true}
);


// hash password ก่อน save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// method ตรวจสอบ password
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
