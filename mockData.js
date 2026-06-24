const initialMockData = [
  {
    id: "hr-1",
    timestamp: "2026-06-24T08:30:00.000Z",
    hrInfo: {
      fullName: "Srinivas Rao",
      designation: "Talent Acquisition Head",
      companyName: "Infosys",
      industryDomain: "Technology",
      email: "srinivas.r@infosys.com",
      mobileNumber: "9876543210",
      linkedinProfile: "https://linkedin.com/in/srinivas-rao-infosys",
      city: "Bengaluru"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 5,
      studentInteraction: 4,
      technicalSessions: 4,
      venueArrangements: 5,
      likedMost: "The quality of interactions during the student exhibit. Students were confident and well-prepared."
    },
    industryExpectations: {
      demandedSkills: ["Python", "SQL", "Communication Skills", "Problem Solving", "Generative AI", "Teamwork"],
      topFocusSkills: "1. Problem Solving, 2. Clean Coding in Python/Java, 3. SQL & Database Basics, 4. Generative AI Awareness, 5. Team Communication."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "Data Analyst", "Internships"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "Planning to onboard around 150+ graduates across multiple development centers next year."
    },
    curriculumFeedback: {
      topicsToTeachMore: "More emphasis on cloud computing (AWS/Azure) and modern version control (Git) workflows.",
      practicalExposureMissing: "Real-world project development cycle, writing unit tests, and understanding Agile methodologies.",
      curriculumImprovementSuggestions: "Introduce mandatory industry-aligned mini-projects in every semester from the 2nd year onwards."
    },
    finalSuggestions: {
      generalSuggestions: "Great coordination by the placements cell. Hope to see more structured hackathons in the future.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Internships", "Campus Recruitment", "Hackathons"]
    }
  },
  {
    id: "hr-2",
    timestamp: "2026-06-24T08:45:00.000Z",
    hrInfo: {
      fullName: "Priyanka Sharma",
      designation: "Senior HR Manager",
      companyName: "Deloitte India",
      industryDomain: "Consulting",
      email: "priyanka.s@deloitte.com",
      mobileNumber: "9887766554",
      linkedinProfile: "https://linkedin.com/in/priyanka-deloitte",
      city: "Hyderabad"
    },
    eventFeedback: {
      organization: 4,
      hospitality: 4,
      studentInteraction: 5,
      technicalSessions: 4,
      venueArrangements: 4,
      likedMost: "Hospitality was top notch. The panel discussions on industry trends were highly insightful."
    },
    industryExpectations: {
      demandedSkills: ["SQL", "Data Analytics", "Communication Skills", "Problem Solving", "Leadership", "Teamwork"],
      topFocusSkills: "1. Structured Communication, 2. Advanced Excel and SQL, 3. Business Analytics, 4. Logical Reasoning, 5. Presentation Skills."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Data Analyst", "Business Analyst", "Internships"],
      salaryRange: "5-8 LPA",
      hiringPlansNextYear: "Hiring for consultant and analyst profiles. Focus on strong business acumen and analytical skills."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Data interpretation, case study analyses, and business writing.",
      practicalExposureMissing: "Business-level communication and understanding client requirements.",
      curriculumImprovementSuggestions: "Incorporate mock client presentations and case studies into final-year electives."
    },
    finalSuggestions: {
      generalSuggestions: "Excellent venue. Well organized.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Guest Lectures", "Internships", "Campus Recruitment"]
    }
  },
  {
    id: "hr-3",
    timestamp: "2026-06-24T09:10:00.000Z",
    hrInfo: {
      fullName: "Aditya Nair",
      designation: "Lead AI Scientist & Hiring Manager",
      companyName: "Google",
      industryDomain: "Technology",
      email: "aditya.n@google.com",
      mobileNumber: "9123456789",
      linkedinProfile: "https://linkedin.com/in/adityanair-google",
      city: "Bengaluru"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 5,
      studentInteraction: 4,
      technicalSessions: 5,
      venueArrangements: 5,
      likedMost: "The quality of technical discussions. The student projects around machine learning were highly innovative."
    },
    industryExpectations: {
      demandedSkills: ["Python", "Machine Learning", "Artificial Intelligence", "Generative AI", "Prompt Engineering", "Problem Solving"],
      topFocusSkills: "1. Core Computer Science Fundamentals, 2. Machine Learning Systems, 3. Mathematical Logic, 4. Python scripting, 5. Prompt Engineering basics."
    },
    hiringInsights: {
      hiresFreshers: "Occasionally",
      hiringRoles: ["AI Engineer", "Software Engineer", "Internships"],
      salaryRange: "Above 12 LPA",
      hiringPlansNextYear: "Looking for top-tier talent in AI and machine learning. Select hires for research roles."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Advanced mathematical modeling, linear algebra, deep learning architectures.",
      practicalExposureMissing: "Building production-scale applications rather than toy ML models in notebooks.",
      curriculumImprovementSuggestions: "Include Capstone projects involving large-scale dataset training and cloud deployment."
    },
    finalSuggestions: {
      generalSuggestions: "Impressive infrastructure. Looking forward to engaging in technical research collaborations.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Research Collaboration", "Hackathons", "Internships"]
    }
  },
  {
    id: "hr-4",
    timestamp: "2026-06-24T09:20:00.000Z",
    hrInfo: {
      fullName: "Neha Mehta",
      designation: "Director - Talent Management",
      companyName: "HDFC Bank",
      industryDomain: "Finance",
      email: "neha.mehta@hdfcbank.com",
      mobileNumber: "9911223344",
      linkedinProfile: "https://linkedin.com/in/neha-mehta-hdfc",
      city: "Mumbai"
    },
    eventFeedback: {
      organization: 4,
      hospitality: 5,
      studentInteraction: 3,
      technicalSessions: 3,
      venueArrangements: 4,
      likedMost: "Networking lunch and the hospitality. Good turnout of corporate delegates."
    },
    industryExpectations: {
      demandedSkills: ["SQL", "Communication Skills", "Teamwork", "Problem Solving", "Leadership"],
      topFocusSkills: "1. Financial Market Basics, 2. SQL & Query writing, 3. Verbal & Written Communication, 4. Attention to detail, 5. Ethics in Business."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Business Analyst", "Internships"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "We recruit 30-40 MBA/B.Tech freshers annually for analytical and business operations roles."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Fintech, financial modeling, and data analytics in business contexts.",
      practicalExposureMissing: "Handling client interactions under pressure, compliance and regulatory knowledge.",
      curriculumImprovementSuggestions: "Co-design course modules with industry experts from financial sectors."
    },
    finalSuggestions: {
      generalSuggestions: "Can increase student interactions time. Overall, a great initiative.",
      futureCollaboration: "Maybe",
      collaborationInterests: ["Guest Lectures", "Campus Recruitment"]
    }
  },
  {
    id: "hr-5",
    timestamp: "2026-06-24T09:40:00.000Z",
    hrInfo: {
      fullName: "Anand Verma",
      designation: "Senior Director - Engineering",
      companyName: "Amazon E-Commerce",
      industryDomain: "E-commerce",
      email: "anandv@amazon.com",
      mobileNumber: "9812345670",
      linkedinProfile: "https://linkedin.com/in/anand-verma-amazon",
      city: "Hyderabad"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 4,
      studentInteraction: 4,
      technicalSessions: 4,
      venueArrangements: 4,
      likedMost: "Efficient management of the agenda. The feedback collection process is seamless."
    },
    industryExpectations: {
      demandedSkills: ["Java", "SQL", "Cloud Computing", "DevOps", "Problem Solving", "Communication Skills"],
      topFocusSkills: "1. Data Structures & Algorithms, 2. Object Oriented Design (Java/C++), 3. Systems Architecture, 4. CI/CD and Cloud Deployments, 5. Collaborative Coding."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "Full Stack Developer", "Cloud Engineer", "Internships"],
      salaryRange: "8-12 LPA",
      hiringPlansNextYear: "Ongoing placement visits. Targetting hiring 25-30 candidates for software engineering roles."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Distributed systems, design patterns, microservices architecture, and virtualization/docker.",
      practicalExposureMissing: "Collaborative coding using Git, resolving merge conflicts, code reviews, and containerization.",
      curriculumImprovementSuggestions: "Students should build their assignments on Github and practice code review cycles."
    },
    finalSuggestions: {
      generalSuggestions: "Students showed excellent enthusiasm. Keep encouraging open-source contribution.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Campus Recruitment", "Hackathons", "Research Collaboration", "Internships"]
    }
  },
  {
    id: "hr-6",
    timestamp: "2026-06-24T10:05:00.000Z",
    hrInfo: {
      fullName: "Meera Deshmukh",
      designation: "Manager - Talent Acquisition",
      companyName: "TCS",
      industryDomain: "Technology",
      email: "meera.deshmukh@tcs.com",
      mobileNumber: "9734567890",
      linkedinProfile: "https://linkedin.com/in/meera-deshmukh-tcs",
      city: "Pune"
    },
    eventFeedback: {
      organization: 4,
      hospitality: 5,
      studentInteraction: 5,
      technicalSessions: 3,
      venueArrangements: 5,
      likedMost: "The hospitality and the student presentations. Students possess good fundamental skills."
    },
    industryExpectations: {
      demandedSkills: ["Java", "Python", "SQL", "Communication Skills", "Teamwork", "Problem Solving"],
      topFocusSkills: "1. Programming fundamentals, 2. RDBMS and SQL, 3. Aptitude & Reasoning, 4. Soft Skills & Team Dynamics, 5. basic Web Development."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "Data Analyst", "Internships"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "High hiring volume expected. Recruits bulk candidates for entry-level engineering roles."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Industry-standard coding practices, security fundamentals, SQL optimization.",
      practicalExposureMissing: "Converting a theoretical requirement into a clean codebase, structured testing.",
      curriculumImprovementSuggestions: "Introduce certification programs in partnership with corporate training partners."
    },
    finalSuggestions: {
      generalSuggestions: "Excellent arrangement and coordination by the college team.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Campus Recruitment", "Internships", "Guest Lectures"]
    }
  },
  {
    id: "hr-7",
    timestamp: "2026-06-24T10:15:00.000Z",
    hrInfo: {
      fullName: "Rajesh Koothrapali",
      designation: "Lead Consultant",
      companyName: "Accenture",
      industryDomain: "Consulting",
      email: "r.koothrapali@accenture.com",
      mobileNumber: "9567891234",
      linkedinProfile: "https://linkedin.com/in/rajesh-k-accenture",
      city: "Chennai"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 4,
      studentInteraction: 4,
      technicalSessions: 4,
      venueArrangements: 4,
      likedMost: "The infrastructure and setup. Extremely engaging interactions with placement officers."
    },
    industryExpectations: {
      demandedSkills: ["Python", "SQL", "Cloud Computing", "Communication Skills", "Teamwork", "Problem Solving"],
      topFocusSkills: "1. Cloud Foundations (AWS/Azure), 2. Scripting & Automation, 3. General Analytics, 4. Adaptability & Quick Learning, 5. Business Etiquette."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "Cloud Engineer", "Business Analyst"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "Active hiring for multiple technology support and consulting lines next fiscal year."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Agile methodologies, DevOps pipeline (CI/CD), and Cloud Practitioner courses.",
      practicalExposureMissing: "Familiarity with cloud consoles, setting up virtualization environments.",
      curriculumImprovementSuggestions: "Integrate vendor certifications (AWS/Azure/GCP) as optional credits for students."
    },
    finalSuggestions: {
      generalSuggestions: "Organize mock assessment drives to prepare students for corporate tests.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Campus Recruitment", "Industrial Visits", "Guest Lectures"]
    }
  },
  {
    id: "hr-8",
    timestamp: "2026-06-24T10:22:00.000Z",
    hrInfo: {
      fullName: "Vikram Malhotra",
      designation: "Founder & CTO",
      companyName: "Krypton Labs",
      industryDomain: "Technology",
      email: "vikram@kryptonlabs.io",
      mobileNumber: "9009988776",
      linkedinProfile: "https://linkedin.com/in/vikram-cto-krypton",
      city: "Bengaluru"
    },
    eventFeedback: {
      organization: 3,
      hospitality: 4,
      studentInteraction: 5,
      technicalSessions: 5,
      venueArrangements: 4,
      likedMost: "Very interactive technical sessions. The Q&A session with students was lively and energetic."
    },
    industryExpectations: {
      demandedSkills: ["Python", "Machine Learning", "Artificial Intelligence", "Generative AI", "Cybersecurity", "Prompt Engineering"],
      topFocusSkills: "1. Advanced AI/ML algorithms, 2. Vector Databases and Embeddings, 3. Python backend frameworks (FastAPI/Django), 4. Modern Javascript (React), 5. System administration."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["AI Engineer", "Software Engineer", "Full Stack Developer", "Internships"],
      salaryRange: "8-12 LPA",
      hiringPlansNextYear: "Hiring 5-10 core engineers who are passionate about startup culture and Generative AI."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Vector databases, API design, Prompt Engineering, Cybersecurity basics.",
      practicalExposureMissing: "Actual product deployment, handling security concerns, dealing with API limits.",
      curriculumImprovementSuggestions: "Run a dedicated incubation center where students build real commercial apps."
    },
    finalSuggestions: {
      generalSuggestions: "Focus on build-quality and clean programming. Avoid copy-pasting code.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Hackathons", "Research Collaboration", "Internships"]
    }
  },
  {
    id: "hr-9",
    timestamp: "2026-06-24T10:25:00.000Z",
    hrInfo: {
      fullName: "Shalini Sen",
      designation: "VP - Human Resources",
      companyName: "Niva Bupa Health",
      industryDomain: "Healthcare",
      email: "shalini.sen@nivabupa.com",
      mobileNumber: "9876501234",
      linkedinProfile: "https://linkedin.com/in/shalini-sen-hr",
      city: "Gurugram"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 5,
      studentInteraction: 4,
      technicalSessions: 3,
      venueArrangements: 4,
      likedMost: "Arrangements were smooth, and the hospitality was exceptional. Placements presentation was detailed."
    },
    industryExpectations: {
      demandedSkills: ["SQL", "Data Analytics", "Communication Skills", "Teamwork", "Problem Solving"],
      topFocusSkills: "1. Data Literacy & Excel, 2. Business Process Understanding, 3. Empathetic Communication, 4. Working under timelines, 5. Analytical Mindset."
    },
    hiringInsights: {
      hiresFreshers: "Occasionally",
      hiringRoles: ["Data Analyst", "Internships"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "Hiring for operations analytics and IT support teams. 10-15 vacancies next year."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Data protection, HIPAA compliance, healthcare informatics basics.",
      practicalExposureMissing: "Knowledge of data privacy laws and practical documentation standards.",
      curriculumImprovementSuggestions: "Introduce compliance and ethics seminars for engineering/management students."
    },
    finalSuggestions: {
      generalSuggestions: "Great work. Maintain this momentum.",
      futureCollaboration: "Maybe",
      collaborationInterests: ["Guest Lectures", "Industrial Visits"]
    }
  },
  {
    id: "hr-10",
    timestamp: "2026-06-24T10:31:00.000Z",
    hrInfo: {
      fullName: "Kartik Aaryan",
      designation: "Director - Engineering",
      companyName: "Microsoft India",
      industryDomain: "Technology",
      email: "kartik.a@microsoft.com",
      mobileNumber: "9988776655",
      linkedinProfile: "https://linkedin.com/in/kartik-a-msft",
      city: "Hyderabad"
    },
    eventFeedback: {
      organization: 5,
      hospitality: 5,
      studentInteraction: 5,
      technicalSessions: 5,
      venueArrangements: 5,
      likedMost: "The high caliber of student projects and the clarity of their presentations. Very impressed."
    },
    industryExpectations: {
      demandedSkills: ["Python", "Java", "Machine Learning", "Cloud Computing", "Problem Solving", "Generative AI"],
      topFocusSkills: "1. Strong Computer Science core, 2. System design concepts, 3. Cloud Native Application building, 4. AI-assisted programming, 5. Integrity and ownership."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "AI Engineer", "Internships"],
      salaryRange: "Above 12 LPA",
      hiringPlansNextYear: "Hiring through campus programs. Strong intake of interns next year."
    },
    curriculumFeedback: {
      topicsToTeachMore: "System design, cloud-native patterns, performance metrics, and static analysis tools.",
      practicalExposureMissing: "Profiling and debugging complex codebases, writing robust documentation.",
      curriculumImprovementSuggestions: "Incorporate system design challenges and open-source contributions into major curriculum tracks."
    },
    finalSuggestions: {
      generalSuggestions: "Keep organizing tech talks. Students should work on open issues of public packages.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Campus Recruitment", "Internships", "Research Collaboration", "Guest Lectures"]
    }
  },
  {
    id: "hr-11",
    timestamp: "2026-06-24T10:34:00.000Z",
    hrInfo: {
      fullName: "Dr. Alok Chandra",
      designation: "Lead Consultant - EduRelations",
      companyName: "Wipro",
      industryDomain: "Technology",
      email: "alok.chandra@wipro.com",
      mobileNumber: "9834512390",
      linkedinProfile: "https://linkedin.com/in/dralokchandra-wipro",
      city: "Kolkata"
    },
    eventFeedback: {
      organization: 4,
      hospitality: 4,
      studentInteraction: 4,
      technicalSessions: 3,
      venueArrangements: 4,
      likedMost: "Organized panel discussions. Excellent focus on aligning academics with corporate realities."
    },
    industryExpectations: {
      demandedSkills: ["Java", "SQL", "Cloud Computing", "Communication Skills", "Teamwork", "Problem Solving"],
      topFocusSkills: "1. Core Java and Spring Boot, 2. Database foundations, 3. Team Collaboration, 4. Presentation & Pitching, 5. Agile workflows."
    },
    hiringInsights: {
      hiresFreshers: "Yes",
      hiringRoles: ["Software Engineer", "Internships"],
      salaryRange: "3-5 LPA",
      hiringPlansNextYear: "Hiring target: 80+ campus selections next academic year. Consistent numbers."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Spring Boot, enterprise architecture patterns, relational and non-relational databases.",
      practicalExposureMissing: "Deploying applications on application servers, automated testing.",
      curriculumImprovementSuggestions: "Provide training on professional tools like Jira, Confluence, and Gitlab."
    },
    finalSuggestions: {
      generalSuggestions: "A very productive event. The placement board did a fantastic job.",
      futureCollaboration: "Yes",
      collaborationInterests: ["Campus Recruitment", "Internships", "Industrial Visits"]
    }
  },
  {
    id: "hr-12",
    timestamp: "2026-06-24T10:37:00.000Z",
    hrInfo: {
      fullName: "Ananya Panday",
      designation: "HR Generalist",
      companyName: "EduCorp Solutions",
      industryDomain: "EdTech",
      email: "ananya@educorpsolutions.com",
      mobileNumber: "9456781230",
      linkedinProfile: "https://linkedin.com/in/ananya-panday-educorp",
      city: "Noida"
    },
    eventFeedback: {
      organization: 3,
      hospitality: 4,
      studentInteraction: 4,
      technicalSessions: 4,
      venueArrangements: 4,
      likedMost: "Interactive atmosphere. Nice interaction with faculty coordinators."
    },
    industryExpectations: {
      demandedSkills: ["Communication Skills", "Teamwork", "Problem Solving", "Leadership"],
      topFocusSkills: "1. Interpersonal skills, 2. Basic software usage (Word, PPT, Excel), 3. Willingness to learn, 4. Project coordination."
    },
    hiringInsights: {
      hiresFreshers: "No",
      hiringRoles: [],
      salaryRange: "Less than 3 LPA",
      hiringPlansNextYear: "No current plans for technical hiring of graduates. Only looking for experienced sales/support."
    },
    curriculumFeedback: {
      topicsToTeachMore: "Sales pipelines, client servicing, and soft skills.",
      practicalExposureMissing: "Telephone etiquette and negotiation skills.",
      curriculumImprovementSuggestions: "Add soft skill classes and personality development camps."
    },
    finalSuggestions: {
      generalSuggestions: "Good initiative. Keep up the efforts.",
      futureCollaboration: "Maybe",
      collaborationInterests: ["Industrial Visits", "Guest Lectures"]
    }
  }
];

// Export to make it available for app.js or window object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = initialMockData;
} else {
  window.initialMockData = initialMockData;
}
