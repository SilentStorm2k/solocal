import LandingPage from "@/components/LandingPage";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const user = await currentUser();

	// If there is no current user, render default landing page
	if (!user) return <LandingPage />;

	// If user is logged in, redirect them to the events page
	return redirect("/events");
}
