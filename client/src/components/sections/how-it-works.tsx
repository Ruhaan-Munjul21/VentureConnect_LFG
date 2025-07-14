import { motion } from "framer-motion";
import { User, Database, Brain } from "lucide-react";

const steps = [
	{
		icon: User,
		title: "Create Dynamic Profiles",
		description:
			"Startups build comprehensive profiles showcasing their drug development pipeline, team expertise, and funding needs with our intelligent form system.",
		color: "from-accent to-accent-purple",
		number: 1,
		type: "icon",
	},
	{
		icon: Brain,
		title: "AI-Powered Matching",
		description:
			"Our semantic and vector-based AI analyzes startup profiles against investor preferences, therapeutic areas, and investment criteria for optimal matches. We have VC fingerprint trained on thousands of data points per VC.",
		color: "from-accent-purple to-purple-600",
		number: 2,
		type: "icon",
	},
	{
		icon: Database,
		title: "Deal Flow Tracking",
		description:
			"Backend management system that helps startups track opportunities, craft hyperpersonalized emails based on VC preferences and investment patterns, and manage investor relationships effectively.",
		color: "from-green-500 to-accent",
		number: 3,
		type: "icon",
	},
];

export default function HowItWorks() {
	return (
		<section id="how-it-works" className="py-20 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					<h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
						How VentriLinks Works
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Our AI-powered platform streamlines the connection between biotech
						initiators and capital providers
					</p>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-12">
					{steps.map((step, index) => (
						<motion.div
							key={index}
							className="text-center group"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							viewport={{ once: true }}
						>
							<div className="relative mb-8">
								<div
									className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
								>
									{step.icon && (
										<step.icon className="w-10 h-10 text-white" />
									)}
								</div>
								<div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
									{step.number}
								</div>
							</div>
							<h3 className="text-2xl font-bold text-primary mb-4">
								{step.title}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}