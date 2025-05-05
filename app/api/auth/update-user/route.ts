import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/server/db/db";
import { user } from "@/lib/server/db/schemas/auth-schema";

export async function POST(request: NextRequest) {
	try {
		// Get data from the request body
		const requestData = await request.json();
		console.log("Update user request:", requestData);

		// Extract the required fields with more resilient approach
		const userId = requestData.userId;
		const lastName = requestData.lastName;
		const name = requestData.name;

		// Validate input
		if (!userId || typeof userId !== "string") {
			console.error("Missing or invalid userId in request:", requestData);
			return NextResponse.json(
				{ error: "Valid user ID is required" },
				{ status: 400 },
			);
		}

		if (!lastName || typeof lastName !== "string") {
			console.error("Missing or invalid lastName in request:", requestData);
			return NextResponse.json(
				{ error: "Valid last name is required" },
				{ status: 400 },
			);
		}

		// Check if user exists
		const userExists = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, userId))
			.then((result) => result.length > 0);

		if (!userExists) {
			console.error("User not found:", userId);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Update the user in the database
		const updateData: {
			lastName: string;
			updatedAt: Date;
			name?: string;
		} = {
			lastName: lastName,
			updatedAt: new Date(),
		};

		// Only include name if it's provided
		if (name && typeof name === "string") {
			updateData.name = name;
		}

		await db.update(user).set(updateData).where(eq(user.id, userId));

		console.log("User updated successfully:", userId);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}
