export const schemesData = [
  // --- WELFARE ---
  {
    _id: "welfare_1",
    name: "PM Kisan Samman Nidhi",
    category: "Welfare",
    type: "Government",
    description: "Financial support for small and marginal farmers across India to help them buy agricultural inputs and support their livelihood.",
    benefits: [
      "₹6,000 per year",
      "Direct bank transfer in 3 equal installments"
    ],
    eligibilityDetails: ["Must be a farmer", "Annual income should be less than ₹6,000,000"],
    eligibility: {
      minIncome: 0, maxIncome: 6000000, occupation: ["Farmer"], minAge: 18, maxAge: 100, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "welfare_2",
    name: "Beti Bachao Beti Padhao",
    category: "Welfare",
    type: "Government",
    description: "Empowering the girl child and promoting their education to prevent gender biased sex selective elimination.",
    benefits: ["Financial incentives for girl child education", "Educational grants"],
    eligibilityDetails: ["Must be female", "Age less than 18 years"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Any"], minAge: 0, maxAge: 18, gender: ["Female"], educationLevel: ["Any"]
    }
  },
  {
    _id: "welfare_3",
    name: "Pradhan Mantri Awas Yojana",
    category: "Welfare",
    type: "Government",
    description: "Affordable housing scheme for the urban and rural poor.",
    benefits: ["Subsidized interest rate on housing loans", "Financial assistance for house construction"],
    eligibilityDetails: ["Must belong to EWS/LIG category", "Must not own a pucca house"],
    eligibility: {
      minIncome: 0, maxIncome: 300000, occupation: ["Any"], minAge: 18, maxAge: 100, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },

  // --- EDUCATION ---
  {
    _id: "edu_1",
    name: "National Scholarship Portal",
    category: "Education",
    type: "Government",
    description: "Financial assistance for meritorious students from economically weaker sections to pursue higher education.",
    benefits: ["Up to ₹50,000 per year for tuition and hostel fees"],
    eligibilityDetails: ["Must be a student", "Income less than ₹2,50,000 per year"],
    eligibility: {
      minIncome: 0, maxIncome: 250000, occupation: ["Student"], minAge: 14, maxAge: 30, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "edu_2",
    name: "Post-Matric Scholarship for SC/ST",
    category: "Education",
    type: "Government",
    description: "Financial assistance to SC/ST students studying at post-matriculation or post-secondary stage.",
    benefits: ["Maintenance allowance", "Reimbursement of compulsory non-refundable fees"],
    eligibilityDetails: ["Belong to SC/ST category", "Income less than ₹2,50,000 per annum"],
    eligibility: {
      minIncome: 0, maxIncome: 250000, occupation: ["Student"], minAge: 15, maxAge: 35, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "edu_3",
    name: "Pragati Scholarship for Girls",
    category: "Education",
    type: "Government",
    description: "Empowering girls through technical education.",
    benefits: ["₹50,000 per annum for every year of study"],
    eligibilityDetails: ["Must be a female student admitted to AICTE approved institution"],
    eligibility: {
      minIncome: 0, maxIncome: 800000, occupation: ["Student"], minAge: 16, maxAge: 25, gender: ["Female"], educationLevel: ["Any"]
    }
  },

  // --- HEALTH ---
  {
    _id: "health_1",
    name: "Ayushman Bharat",
    category: "Health",
    type: "Government",
    description: "Free health insurance scheme for low-income citizens.",
    benefits: ["Up to ₹5 lakh coverage per family per year"],
    eligibilityDetails: ["Income less than ₹5,000,00", "Must not hold a regular government job"],
    eligibility: {
      minIncome: 0, maxIncome: 500000, occupation: ["Any"], minAge: 0, maxAge: 100, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "health_2",
    name: "Janani Suraksha Yojana",
    category: "Health",
    type: "Government",
    description: "Safe motherhood intervention to reduce maternal and neonatal mortality.",
    benefits: ["Cash assistance for institutional delivery"],
    eligibilityDetails: ["Pregnant women", "Belong to BPL families"],
    eligibility: {
      minIncome: 0, maxIncome: 200000, occupation: ["Any"], minAge: 18, maxAge: 50, gender: ["Female"], educationLevel: ["Any"]
    }
  },
  {
    _id: "health_3",
    name: "Rashtriya Bal Swasthya Karyakram",
    category: "Health",
    type: "Government",
    description: "Early identification and early intervention for children.",
    benefits: ["Free treatment for 4Ds: Defects at birth, Diseases, Deficiencies, Developmental delays"],
    eligibilityDetails: ["Children from birth to 18 years"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Any", "Student"], minAge: 0, maxAge: 18, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },

  // --- INVESTMENT ---
  {
    _id: "inv_1",
    name: "Atal Pension Yojana",
    category: "Investment",
    type: "Government",
    description: "A pension scheme primarily targeted at the unorganized sector to provide income security during old age.",
    benefits: ["Guaranteed minimum pension of ₹1,000 to ₹5,000 per month"],
    eligibilityDetails: ["Age between 18 to 40 years", "Self-employed or unorganized sector"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Self-Employed", "Business", "Unemployed", "Farmer", "Any"], minAge: 18, maxAge: 40, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "inv_2",
    name: "Senior Citizen Savings Scheme",
    category: "Investment",
    type: "Government",
    description: "High interest and safe investment option for senior citizens.",
    benefits: ["8.2% interest per annum", "Quarterly interest payout"],
    eligibilityDetails: ["Age 60 years or above"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Any"], minAge: 60, maxAge: 100, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "inv_3",
    name: "Sukanya Samriddhi Yojana",
    category: "Investment",
    type: "Government",
    description: "Small deposit scheme for the girl child as part of the Beti Bachao Beti Padhao campaign.",
    benefits: ["High interest rate (8.0%)", "Tax benefits under 80C"],
    eligibilityDetails: ["Girl child under 10 years of age"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Any", "Student"], minAge: 0, maxAge: 10, gender: ["Female"], educationLevel: ["Any"]
    }
  },

  // --- PRIVATE ---
  {
    _id: "priv_1",
    name: "Tech Startup Grant",
    category: "Private",
    type: "Private",
    description: "Seed funding and mentorship provided by a consortium of tech giants for aspiring entrepreneurs.",
    benefits: ["Up to ₹10,00,000 seed funding", "6 months of free mentorship"],
    eligibilityDetails: ["Age between 18 and 35", "Self-employed or Business occupation"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Business", "Self-Employed"], minAge: 18, maxAge: 35, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  },
  {
    _id: "priv_2",
    name: "Women in Tech Scholarship",
    category: "Private",
    type: "Private",
    description: "Corporate-sponsored scholarship to encourage women to pursue STEM fields.",
    benefits: ["Full tuition waiver", "Assured placement opportunities"],
    eligibilityDetails: ["Female students pursuing engineering", "Above 80% aggregate"],
    eligibility: {
      minIncome: 0, maxIncome: 10000000, occupation: ["Student"], minAge: 17, maxAge: 25, gender: ["Female"], educationLevel: ["Undergraduate", "Postgraduate", "Any"]
    }
  },
  {
    _id: "priv_3",
    name: "Corporate Micro-Loans",
    category: "Private",
    type: "Private",
    description: "Low-interest micro-loans for small business owners affected by disasters.",
    benefits: ["Zero collateral loans up to ₹50,000", "Flexible repayment"],
    eligibilityDetails: ["Must run a small business", "Income less than ₹3,00,000"],
    eligibility: {
      minIncome: 0, maxIncome: 300000, occupation: ["Business", "Self-Employed"], minAge: 18, maxAge: 65, gender: ["All", "Any"], educationLevel: ["Any"]
    }
  }
];
