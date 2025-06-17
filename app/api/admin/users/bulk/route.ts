import { NextResponse } from "next/server";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { User } from "@prisma/client";
import { formatError } from "@/lib/utils";

export async function POST(req: Request) {
  debugger
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Add guard for invalid JSON or null body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !Array.isArray(body.users) || body.users.length === 0) {
      return new NextResponse("Invalid request body", { status: 400 });
    }
    const userData = body.users;

    // Server-side check for password
    if (!(userData as User[]).every((user: User) => typeof user.password === 'string' && user.password.trim() !== '')) {
      return new NextResponse("Each user must have a non-empty password.", { status: 400 });
    }

    const created = [];
    const errors = [];

    for (const user of userData) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          errors.push(`User with email ${user.email} already exists`);
          continue;
        }

        // Hash password (you might want to generate a random password or require it in the Excel)
        const plainPassword =  user.password;
        user.password = hashSync(user.password, 10);
        
        // Create user
        const newUser = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            tempPassword: plainPassword,
            password: user.password,
            role: user.role || "user",
            phoneNumber: user.phoneNumber,
          },
        });

        created.push(newUser);
      } catch (error) {
        return NextResponse.json({ success: false, message: formatError(error) }, { status: 500 });
      }
    }

    return NextResponse.json({
      created: created.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[BULK_USERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}