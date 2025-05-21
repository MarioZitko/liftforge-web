import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImg from "@/assets/heroImage.jpg";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
	const navigate = useNavigate();

	return (
		<main className="min-h-screen bg-background text-foreground px-4 py-16 flex items-center justify-center">
			<div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
				{/* Text Content */}
				<motion.div
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="flex-1 space-y-6 text-center md:text-left"
				>
					<p className="text-sm uppercase tracking-wide text-primary font-medium">
						Get Better Everyday
					</p>
					<h1 className="text-4xl sm:text-5xl font-bold leading-tight">
						Fitter, Stronger and Healthier
					</h1>
					<p className="text-muted-foreground max-w-md">
						Are you ready to take your fitness journey to the next level?
						LiftForge helps coaches and athletes track performance and build
						personalized programs like never before.
					</p>

					<div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
						<Button size="lg" onClick={() => navigate("/dashboard")}>
							Explore Dashboard
						</Button>
						<Button variant="outline" size="lg">
							Learn More
						</Button>
					</div>

					<p className="text-xs text-muted-foreground pt-2">
						2.5M+ Active Users
					</p>
				</motion.div>

				{/* Hero Image */}
				<motion.div
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="flex-1 flex justify-center"
				>
					<div className="relative w-[300px] sm:w-[360px] rounded-xl overflow-hidden shadow-xl border border-border">
						<img
							src={heroImg}
							alt="Hero"
							className="object-cover w-full h-full rounded-xl"
						/>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
