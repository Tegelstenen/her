import { NextRequest, NextResponse } from "next/server";

const sendOtp = async (phoneNumber: string, otpCode: string) => {
	const myHeaders = new Headers();
	myHeaders.append("Authorization", process.env.INFOBIB_API_KEY as string);
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append("Accept", "application/json");

	const raw = JSON.stringify({
		messages: [
			{
				destinations: [{ to: phoneNumber }],
				from: "46700861272",
				text: `Your verification code is: ${otpCode}`,
			},
		],
	});

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow" as RequestRedirect,
	};

	try {
		const response = await fetch(
			"https://51zl9d.api.infobip.com/sms/2/text/advanced",
			requestOptions,
		);
		const result = await response.text();
		console.log(result);
		return { success: true, result };
	} catch (error) {
		console.error(error);
		return { success: false, error };
	}
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phoneNumber, code } = body;

		if (!phoneNumber || !code) {
			return NextResponse.json(
				{ error: "Phone number and code are required" },
				{ status: 400 },
			);
		}

		const result = await sendOtp(phoneNumber, code);

		return NextResponse.json(result);
	} catch (error) {
		console.error("OTP send error:", error);
		return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
	}
}
