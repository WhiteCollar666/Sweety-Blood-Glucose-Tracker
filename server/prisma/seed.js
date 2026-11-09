
import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const main = async () => {
  const email = "demo@sweety.com";
  const password = "SweetyDemo@123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Sweety Demo User",
      password: hashedPassword,
    },
    create: {
      name: "Sweety Demo User",
      email,
      password: hashedPassword,
    },
  });

  const today = new Date();
  const date = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  );

  const samples = [
    { slot: "MORNING", glucoseValue: 105 },
    { slot: "AFTER_BREAKFAST", glucoseValue: 145 },
    { slot: "AFTER_LUNCH", glucoseValue: 132 },
    { slot: "AFTER_DINNER", glucoseValue: 120 },
  ];

  for (const sample of samples) {
    await prisma.glucoseReading.upsert({
      where: {
        userId_measuredAt_slot: {
          userId: user.id,
          measuredAt: date,
          slot: sample.slot,
        },
      },
      update: {
        glucoseValue: sample.glucoseValue,
        notes: "Demo reading",
      },
      create: {
        userId: user.id,
        glucoseValue: sample.glucoseValue,
        measuredAt: date,
        slot: sample.slot,
        notes: "Demo reading",
      },
    });
  }

  console.log("Demo user and sample readings created.");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
