import bcrypt from "bcrypt";

const test = async () => {
  let password = "securePassword123!";
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  console.log("HASH:",hashPassword);
};

test();