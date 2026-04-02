import bcrypt from "bcryptjs";

const run = async () => {
  const hash = await bcrypt.hash("Shekhar@123", 10);
  console.log(hash);
};

run();