import jwt from "jsonwebtoken"
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt"


export const registerUser=async({name,email,password})=>{
    const existingUser=await prisma.user.findUnique({
        where:{email}
    })
    if(existingUser){
       throw new Error("Email already registered");

    }

    const hashPassword=await bcrypt.hash(password,10)
    const user=await prisma.user.create({
        data:{
            name,email,

            password:hashPassword
        },
        select:{
            id:true,
            name:true,
            email:true
        }
    })
    return user
}

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

 const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
    algorithm: "HS256",
  }
);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  };
};
