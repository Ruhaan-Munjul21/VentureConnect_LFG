import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const teamMembers = [
	{
		name: "Dr. Guanghui Hu",
		title: "CEO & Co-Founder",
		bio: "Serial entrepreneur and venture investor in biotech and healthcare. EY Entrepreneur of the Year awardee with extensive drug discovery experience across leading biopharma companies. Founding Partner of Westfield BioVentures and Venture Partner at Viva BioInnovator. Holds a PhD from Baylor College of Medicine and BS from Tsinghua University. Committed to transforming biotech access through innovative capital models and strategic partnerships.",
		image: "/images/team/guanghui.jpg",
		linkedin: "https://www.linkedin.com/in/guanghuihu/",
		email: "guanghuihu2@gmail.com"
	},
	{
		name: "Payton Gao",
		title: "Co-Founder",
		bio: "Incoming freshman at UNC Chapel Hill passionate about life sciences and business development. Interested in drug development, commercialization, and biotech startups across multiple sectors. Brings creative thinking and unique perspective to accelerate innovation in the industry through technology. Focused on reshaping how early-stage ventures connect with investors. Committed to making biotech innovation more inclusive through modern artificial intelligence solutions.",
		image: "/images/team/payton.png",
		linkedin: "https://www.linkedin.com/in/payton-g-1257252b0/",
		email: "paybob.gao@gmail.com"
	},
	{
		name: "Ruhaan Munjuluri",
		title: "Co-Founder",
		bio: "Rising senior at Livingston High School focused on finance, technology, and equity in emerging markets. Dedicated to democratizing biotech funding through innovative financial platforms and solutions. Gaining hands-on experience leveraging AI in analysis and strategic execution across multiple sectors. Committed to transforming how early-stage ventures engage with capital markets to foster long-term success and accessibility for entrepreneurs worldwide.",
		image: "/images/team/ruhaan.png",
		linkedin: "https://www.linkedin.com/in/ruhaan-munjuluri-7678512ba/",
		email: "ruhaanmunjuluri@gmail.com"
	},
	{
		name: "Azra Sadibasic",
		title: "Operations Manager",
		bio: "Legal background with experience in back-office operations, management, and business administration across industries. Supports both nonprofit and for-profit ventures with domestic and international operations worldwide. Currently assists multiple startups with strategic execution, planning and operational efficiency improvements. Specializes in planning, structure, and scaling support for growing companies. Known for professionalism, adaptability, and driving sustainable growth across sectors.",
		image: "/images/team/azra.jpg",
		linkedin: "https://www.linkedin.com/in/azrasadibasic/",
		email: "azra@ventrilinks.com"
	}
];

const advisors = [
	{
		name: "Pavani Munjuluri",
		title: "Strategic Advisor",
		company: "Healthcare & Insurance Executive",
		bio: "20+ years of global leadership experience in client services, account management, and business operations across healthcare & insurance verticals. Demonstrated thought-leader bringing innovative solutions that engage executives and create business value for health plans, provider groups, and care companies.",
		image: "/images/team/pavani.png"
	}
];

export default function Team() {
	const [, setLocation] = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const navigateToHome = () => {
		setLocation('/');
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div
							className="flex items-center cursor-pointer"
							onClick={navigateToHome}
						>
							<img
								src="/images/1.png"
								alt="VentriLinks Logo"
								className="h-10 w-10 mr-2 rounded-full bg-white border border-gray-200 object-cover object-center"
								style={{ minWidth: '40px' }}
							/>
							<h1 className="text-xl font-bold text-primary hover:text-accent transition-colors">
								VentriLinks
							</h1>
						</div>
						<Button variant="outline" onClick={navigateToHome}>
							Back to Home
						</Button>
					</div>
				</div>
			</header>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-primary mb-4">Meet Our Team</h1>
					<p className="text-xl text-muted-foreground">
						The experts behind VentriLinks biotech-VC matchmaking platform
					</p>
				</div>
				
				{/* Team Members Section */}
				<section className="mb-16">
					<h2 className="text-3xl font-bold text-primary mb-8 text-center">Leadership Team</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{teamMembers.map((member, index) => (
							<motion.div
								key={index}
								className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
							>
								<div className="aspect-square overflow-hidden bg-gray-100">
									<img 
										src={member.image} 
										alt={member.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										onError={(e) => {
											e.currentTarget.src = '/images/placeholder-person.jpg';
										}}
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-primary mb-2">{member.name}</h3>
									<p className="text-accent font-medium mb-3">{member.title}</p>
									<p className="text-gray-600 text-sm leading-relaxed mb-4">
										{member.bio}
									</p>
									<div className="flex space-x-3">
										{member.linkedin && (
											<a 
												href={member.linkedin}
												target="_blank" 
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 transition-colors"
											>
												<Linkedin className="w-5 h-5" />
											</a>
										)}
										{member.email && (
											<a 
												href={`mailto:${member.email}`}
												className="text-gray-600 hover:text-gray-800 transition-colors"
											>
												<Mail className="w-5 h-5" />
											</a>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</section>

				{/* Advisors Section */}
				<section id="advisors" className="mb-16">
					<h2 className="text-3xl font-bold text-primary mb-8 text-center">Advisors</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{advisors.map((advisor, index) => (
							<motion.div
								key={index}
								className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: (teamMembers.length + index) * 0.1 }}
							>
								<div className="aspect-square overflow-hidden bg-gray-100">
									<img 
										src={advisor.image} 
										alt={advisor.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										onError={(e) => {
											e.currentTarget.src = '/images/placeholder-person.jpg';
										}}
									/>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-primary mb-2">{advisor.name}</h3>
									<p className="text-accent font-medium mb-1">{advisor.title}</p>
									<p className="text-gray-500 text-sm mb-3">{advisor.company}</p>
									<p className="text-gray-600 text-sm leading-relaxed">
										{advisor.bio}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}