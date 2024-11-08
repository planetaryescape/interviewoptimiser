import { db } from "@/db";
import { User, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromClerkId(clerkUserId: string): Promise<{
  id?: number;
  minutes?: number;
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
}> {
  if (!clerkUserId) {
    return {};
  }

  const user = await db
    .select({
      id: users.id,
      minutes: users.minutes,
      role: users.role,
      email: users.email,
      firstName: users.firstname,
      lastName: users.lastname,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!user.length) {
    return {};
  }

  return {
    id: user[0].id,
    minutes: user[0].minutes,
    role: user[0].role,
    email: user[0].email,
    firstName: user[0].firstName ?? undefined,
    lastName: user[0].lastName ?? undefined,
    stripeCustomerId: user[0].stripeCustomerId ?? undefined,
  };
}

export async function getUserFromId(userId: number): Promise<User | null> {
  if (!userId) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}
