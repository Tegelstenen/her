import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Create full URL using the request's URL
		const baseUrl = new URL(request.url).origin;
		const response = await fetch(`${baseUrl}/api/outbound-call`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				phoneNumber: "your_phone_number", // Replace with your number
				userId: "test_user_id",
				firstName: "Test",
			}),
		});

		return response;
	} catch (error) {
		console.error("Test call failed:", error);
		return NextResponse.json({ error: "Test call failed" }, { status: 500 });
	}
}
