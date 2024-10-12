import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromClerkId(clerkUserId: string): Promise<{
  id?: number;
  credits?: number;
  role?: string;
  email?: string;
  firstName?: string;
  stripeCustomerId?: string;
}> {
  const user = await db
    .select({
      id: users.id,
      credits: users.credits,
      role: users.role,
      email: users.email,
      firstName: users.firstname,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return {
    id: user[0].id,
    credits: user[0].credits,
    role: user[0].role,
    email: user[0].email,
    firstName: user[0].firstName ?? undefined,
    stripeCustomerId: user[0].stripeCustomerId ?? undefined,
  };
}
