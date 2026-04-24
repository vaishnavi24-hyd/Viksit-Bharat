import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import { Post, Reply } from '../models/Post.js';

const mockSchemes = [
  {
    name: 'PM Kisan Samman Nidhi',
    type: 'Government',
    category: 'Agriculture',
    description: 'Under the PM-KISAN scheme, an income support of ₹6,000 per year in three equal installments will be provided to all landholding farmer families across the country.',
    benefits: ['Financial Support of ₹6,000/year', 'Direct Bank Transfer to verified accounts', 'Massive inclusive coverage for small farmers'],
    eligibilityDetails: ['Must possess legally cultivable landholding', 'Must not be an active high-income taxpayer', 'Must hold verified Aadhaar and mapped Bank Account'],
    officialLink: 'https://pmkisan.gov.in'
  },
  {
    name: 'Ayushman Bharat PM-JAY',
    type: 'Government',
    category: 'Healthcare',
    description: 'Ayushman Bharat is a national public health insurance fund of the Government of India providing free access to critical health insurance coverage for low income earners nationwide.',
    benefits: ['Comprehensive health coverage of ₹5 Lakhs per family per year', 'Entirely cashless access to empanelled healthcare services', 'Unrestricted coverage of all pre-existing diseases from day one'],
    eligibilityDetails: ['Must be recognized in extreme poverty demographic categories', 'Households lacking formally employed adult structures', 'Tribal populations and specific rural quotas'],
    officialLink: 'https://pmjay.gov.in'
  },
  {
    name: 'Atal Pension Yojana',
    type: 'Investment',
    category: 'Financial Security',
    description: 'A transformative pension scheme focused essentially on the unorganized sector workers, promising guaranteed minimum monthly pension after reaching the age of 60 years.',
    benefits: ['Guaranteed minimum pension of ₹1000 to ₹5000 per month', 'Strong Government-backed guarantees covering investment risks', 'Significant tax exemptions available under specific sections'],
    eligibilityDetails: ['Must be an Indian Citizen', 'Subscriber age strictly between 18 and 40 years', 'Must hold valid linked savings bank account'],
    officialLink: 'https://npscra.nsdl.co.in/scheme-details.php'
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    type: 'Welfare',
    category: 'Child Welfare',
    description: 'A government-backed savings scheme targeted at the parents of girl children, encouraging them to build a fund for future education and marriage expenses.',
    benefits: ['High interest rate of 8.2% annually', 'Complete tax exemption under Section 80C', 'Secure future planning for girl children'],
    eligibilityDetails: ['Girl child must be below 10 years of age', 'Maximum two accounts per family', 'Minimum deposit of ₹250 per year'],
    officialLink: 'https://www.nsiindia.gov.in/'
  },
  {
    name: 'Reliance Foundation Scholarship',
    type: 'Private',
    category: 'Education',
    description: 'A private corporate scholarship aiming to enable and propel India’s brightest youth to pursue higher education goals without financial constraints.',
    benefits: ['Grant of up to ₹2 Lakhs per student', 'Mentorship from industry experts', 'Access to exclusive alumni networks'],
    eligibilityDetails: ['Must be a resident Indian citizen', 'Enrolled in 1st year full-time undergraduate degree', 'Annual household income consistently under ₹15 Lakhs'],
    officialLink: 'https://scholarships.reliancefoundation.org/'
  }
];

export const seedDatabase = async () => {
  try {
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount <= 3) {
      await Scheme.deleteMany({});
      console.log('> 📦 Executing pristine database scheme seeding protocol...');
      await Scheme.insertMany(mockSchemes);
      console.log('> ✅ Successfully seeded default platform schemes (PM Kisan, Ayushman Bharat, APY, SSY, RFS).');
    }

    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      console.log('> 📦 Executing community forum seeding protocol...');
      
      // Ensure there's at least one mock user
      let mockUser = await User.findOne({ mobile: '9999999999' });
      if (!mockUser) {
        mockUser = new User({
          mobile: '9999999999',
          name: 'Priya Singh',
          age: 28,
          location: 'Delhi',
          occupation: 'Teacher',
          preferredLanguage: 'Hindi',
          citizenScore: 320
        });
        await mockUser.save();
      }
      
      let mockUser2 = await User.findOne({ mobile: '8888888888' });
      if (!mockUser2) {
        mockUser2 = new User({
          mobile: '8888888888',
          name: 'Rahul Sharma',
          age: 35,
          location: 'Mumbai',
          occupation: 'Engineer',
          preferredLanguage: 'English',
          citizenScore: 850
        });
        await mockUser2.save();
      }

      let mockUser3 = await User.findOne({ mobile: '7777777777' });
      if (!mockUser3) {
        mockUser3 = new User({
          mobile: '7777777777',
          name: 'Amit Patel',
          age: 42,
          location: 'Ahmedabad',
          occupation: 'Business',
          preferredLanguage: 'Hindi',
          citizenScore: 410
        });
        await mockUser3.save();
      }

      let mockUser4 = await User.findOne({ mobile: '6666666666' });
      if (!mockUser4) {
        mockUser4 = new User({
          mobile: '6666666666',
          name: 'Sneha Reddy',
          age: 25,
          location: 'Hyderabad',
          occupation: 'Student',
          preferredLanguage: 'Telugu',
          citizenScore: 150
        });
        await mockUser4.save();
      }

      const mockPosts = [
        {
          userId: mockUser._id,
          title: 'Frequent Power Cuts in South Delhi',
          description: 'We have been experiencing unscheduled power cuts for the past 3 days. Is anyone else facing this issue? It is really affecting work from home.',
          category: 'Electricity',
          location: 'South Delhi',
          likes: 24,
          views: 156,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          userId: mockUser2._id,
          title: 'Potholes on Main Highway near Andheri',
          description: 'The recent rains have completely washed away the top layer of the road near the Andheri junction. It is very dangerous for two-wheelers. Who do we contact?',
          category: 'Road Issues',
          location: 'Andheri East, Mumbai',
          likes: 45,
          views: 320,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
          userId: mockUser._id,
          title: 'Garbage Collection is Irregular',
          description: 'The municipal truck has not come to collect garbage for a week now in sector 4. The bins are overflowing and causing a health hazard.',
          category: 'Sanitation',
          location: 'Sector 4',
          likes: 12,
          views: 89,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          userId: mockUser2._id,
          title: 'Water Supply Issue in Residential Block',
          description: 'We are getting muddy water from the pipeline for the last two days. Cannot use it for drinking or cooking. Please look into this.',
          category: 'Water',
          location: 'Wakad, Pune',
          likes: 38,
          views: 210,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        }
      ];

      const insertedPosts = await Post.insertMany(mockPosts);
      
      // Add some mock replies
      await Reply.insertMany([
        {
          postId: insertedPosts[0]._id,
          userId: mockUser2._id,
          message: 'Yes, facing the same issue in Vasant Kunj as well. Called the electricity board but no response.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          postId: insertedPosts[1]._id,
          userId: mockUser._id,
          message: 'This is a serious issue. I slipped on my bike yesterday. Have highlighted this on the BMC portal.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]);

      console.log('> ✅ Successfully seeded community forum posts and replies.');
    }
  } catch (err) {
    console.error('Data Seeding Error:', err);
  }
};
