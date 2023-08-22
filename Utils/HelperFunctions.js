const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");


const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

// compare password
const comparePassword = async (password, hashedPassword) => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};

const GenerateToken = (email, role,  duration) => {
  const token = jwt.sign({ email, role: role}, process.env.JWT_KEY, {
    algorithm: "HS256",
    expiresIn: duration,
  });
  return token;
};

const VerifyToken = (token) => {
  let payload = jwt.verify(token, process.env.JWT_KEY);
  return payload;
};

const GenerateOtp = () => {
  let otp = otpGenerator.generate(5, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
  return otp;
};



const Id_Generator = (number, upper, lower, special, digits) => {
  let id = otpGenerator.generate(number, {
    upperCaseAlphabets: upper,
    specialChars: lower,
    lowerCaseAlphabets: special,
    digits: digits,
  });
  return id;
};

const CreateEventId = () => {
  return Id_Generator(12, false, false, false, true)
};

const CreateCoHostId = () => {
  return Id_Generator(6, true, true, false, true)
};

const CreateGuestId = () => {
  return Id_Generator(6, true, true, false, true)
};


module.exports = { comparePassword, GenerateToken, VerifyToken, GenerateOtp, CreateCoHostId, CreateEventId, CreateGuestId, hashPassword };