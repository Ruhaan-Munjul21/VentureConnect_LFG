import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import { useEffect } from "react";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

const teamMembers = [
	{
		name: "Dr. Guanghui Hu",
		title: "CEO & Co-Founder",
		bio: "Serial entrepreneur and venture investor in biotech and healthcare. EY Entrepreneur of the Year awardee with extensive drug discovery experience across leading biopharma companies. Founding Partner of Westfield BioVentures and Venture Partner at Viva BioInnovator. Holds a PhD from Baylor College of Medicine and BS from Tsinghua University. Committed to transforming biotech access through innovative capital models and strategic partnerships.",
		image: "/images/team/guanghui.jpg",
		linkedin: "https://www.linkedin.com/in/guanghuihu/",
		email: "guanghuihu2@gmail.com",
	},
	{
		name: "Payton Gao",
		title: "Co-Founder",
		bio: "Incoming freshman at UNC Chapel Hill passionate about life sciences and business development. Interested in drug development, commercialization, and biotech startups across multiple sectors. Brings creative thinking and unique perspective to accelerate innovation in the industry through technology. Focused on reshaping how early-stage ventures connect with investors. Committed to making biotech innovation more inclusive through modern artificial intelligence solutions.",
		image: "/images/team/payton.png",
		linkedin: "https://www.linkedin.com/in/payton-g-1257252b0/",
		email: "paybob.gao@gmail.com",
	},
	{
		name: "Ruhaan Munjuluri",
		title: "Co-Founder",
		bio: "Rising senior at Livingston High School focused on finance, technology, and equity in emerging markets. Dedicated to democratizing biotech funding through innovative financial platforms and solutions. Gaining hands-on experience leveraging AI in analysis and strategic execution across multiple sectors. Committed to transforming how early-stage ventures engage with capital markets to foster long-term success and accessibility for entrepreneurs worldwide.",
		image: "/images/team/ruhaan.png",
		linkedin: "https://www.linkedin.com/in/ruhaan-munjuluri-7678512ba/",
		email: "ruhaanmunjuluri@gmail.com",
	},
	{
		name: "Azra Sadibasic",
		title: "Operations Manager",
		bio: "Legal background with experience in back-office operations, management, and business administration across industries. Supports both nonprofit and for-profit ventures with domestic and international operations worldwide. Currently assists multiple startups with strategic execution, planning and operational efficiency improvements. Specializes in planning, structure, and scaling support for growing companies. Known for professionalism, adaptability, and driving sustainable growth across sectors.",
		image: "/images/team/azra.jpg",
		linkedin: "https://www.linkedin.com/in/azrasadibasic/",
		email: "azra@ventrilinks.com",
	},
];

const advisors = [
	{
		name: "Pavani Munjuluri",
		title: "Strategic Advisor",
		company: "Healthcare & Insurance Executive",
		bio: "20+ years of global leadership experience in client services, account management, and business operations across healthcare & insurance verticals. Demonstrated thought-leader bringing innovative solutions that engage executives and create business value for health plans, provider groups, and care companies.",
		image: "/images/team/pavani.png",
	},
];

export default function Team() {
	// Force scroll to top when component mounts
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="min-h-screen">
			<Navigation />

			{/* Hero Section */}
			<section className="pt-24 pb-16 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 molecular-bg">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
							Meet Our <span className="gradient-text">Team</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Passionate founders working together to revolutionize how biotech
							startups connect with investors and accelerate breakthrough
							discoveries.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Core Team */}
			<section className="py-20 bg-background">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
							Core Team
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Our founding team is united by a shared vision to transform the
							biotech funding landscape through innovative technology and deep
							industry expertise.
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{teamMembers.map((member, index) => (
							<motion.div
								key={index}
								className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<div className="text-center mb-6">
									<img
										src={member.image}
										alt={member.name}
										className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-100"
										onError={(e) => {
											e.target.style.backgroundColor = "#f3f4f6";
											e.target.style.display = "flex";
											e.target.style.alignItems = "center";
											e.target.style.justifyContent = "center";
											e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px;">${member.name
												.split(" ")
												.map((n) => n[0])
												.join("")}</span>`;
										}}
									/>
									<h3 className="text-xl font-bold text-primary mb-1">
										{member.name}
									</h3>
									<p className="text-accent font-medium mb-3">
										{member.title}
									</p>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed mb-6">
									{member.bio}
								</p>
								<div className="flex justify-center items-center gap-4 mt-4">
									<a
										href={member.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white hover:opacity-90 transition-all duration-200 no-underline"
										style={{
											backgroundColor: "#0077b5",
											minWidth: "48px",
											minHeight: "48px",
										}}
										aria-label={`${member.name} LinkedIn`}
									>
										<Linkedin className="w-5 h-5" />
									</a>
									<a
										href={`mailto:${member.email}`}
										className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white hover:opacity-90 transition-all duration-200 no-underline"
										style={{
											backgroundColor: "#ea4335",
											minWidth: "48px",
											minHeight: "48px",
										}}
										aria-label={`Email ${member.name}`}
									>
										<Mail className="w-5 h-5" />
									</a>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Advisors */}
			<section className="py-20 bg-muted/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
							Strategic Advisors
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Industry veterans guiding our strategy and growth in the biotech
							ecosystem.
						</p>
					</motion.div>

					<div className="flex justify-center">
						<div className="max-w-md">
							{advisors.map((advisor, index) => (
								<motion.div
									key={index}
									className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.2 }}
									viewport={{ once: true }}
								>
									<div className="flex items-start space-x-6">
										<img
											src={advisor.image}
											alt={advisor.name}
											className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
											onError={(e) => {
												e.target.style.backgroundColor = "#f3f4f6";
												e.target.style.display = "flex";
												e.target.style.alignItems = "center";
												e.target.style.justifyContent = "center";
												e.target.innerHTML = `<span style="color: #6b7280; font-size: 16px;">${advisor.name
													.split(" ")
													.map((n) => n[0])
													.join("")}</span>`;
											}}
										/>
										<div>
											<h3 className="text-xl font-bold text-primary mb-1">
												{advisor.name}
											</h3>
											<p className="text-accent font-medium mb-1">
												{advisor.title}
											</p>
											<p className="text-sm text-muted-foreground mb-3">
												{advisor.company}
											</p>
											<p className="text-muted-foreground text-sm leading-relaxed">
												{advisor.bio}
											</p>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}