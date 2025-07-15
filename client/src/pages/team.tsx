import React from 'react';
import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";

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

	// Function to handle navigation to home with scroll to top
	const navigateToHome = () => {
		setLocation('/');
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header with VentriLinks logo and navigation */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* VentriLinks Logo and Name - Clickable */}
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

			{/* Team Content */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-primary mb-4">Our Team</h1>
					<p className="text-xl text-muted-foreground">
						Meet the experts behind VentriLinks
					</p>
				</div>

				{/* Team content would go here */}
				<div className="bg-white rounded-lg shadow-lg p-8">
					<p className="text-center text-muted-foreground">
						Team profiles will be implemented here
					</p>
				</div>
			</div>
		</div>
	);
}