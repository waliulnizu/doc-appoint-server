const express = require("express");

const { getDB } = require("../config/db");

const router = express.Router();

// Homepage content: slides, FAQs, blog posts, departments, testimonials
router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const doctors = await db
      .collection("doctors")
      .find({}, { projection: { specialty: 1 } })
      .toArray();

    const specialties = [...new Set(doctors.map((d) => d.specialty).filter(Boolean))];

    const reviews = await db
      .collection("reviews")
      .find({}, { projection: { userName: 1, comment: 1, rating: 1, doctorName: 1 } })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      data: {
        departments: specialties,
        testimonials: reviews.map((r) => ({
          name: r.userName || "Anonymous",
          text: r.comment || "",
          rating: Number(r.rating) || 5,
          title: r.doctorName || "",
        })),
        faqs: [
          {
            q: "How do I book an appointment?",
            a: "Browse doctors, open a profile, pick a date and time, and confirm. Your booking appears in your dashboard instantly.",
          },
          {
            q: "Can I reschedule or cancel?",
            a: "Yes. Go to Dashboard → My Bookings, then edit or delete the appointment anytime.",
          },
          {
            q: "Is my information secure?",
            a: "Yes. Authentication is handled by Better Auth with secure sessions, and your data is only visible to you.",
          },
          {
            q: "How do reviews work?",
            a: "After you complete an appointment, you can rate and review that doctor to help other patients.",
          },
        ],
        reasons: [
          {
            icon: "📞",
            title: "Follow-Up Care",
            text: "We ensure continuity of care through regular follow-ups and communication.",
            color: "bg-blue-100 text-blue-600",
          },
          {
            icon: "🤝",
            title: "Patient-Centered Approach",
            text: "We prioritize your comfort and tailor services to meet your individual needs.",
            color: "bg-emerald-100 text-emerald-600",
          },
          {
            icon: "📅",
            title: "Convenient Access",
            text: "Book appointments online or through customer service, with flexible hours.",
            color: "bg-violet-100 text-violet-600",
          },
          {
            icon: "🔒",
            title: "Secure & Private",
            text: "Your health records and personal data stay protected with encrypted storage.",
            color: "bg-rose-100 text-rose-600",
          },
          {
            icon: "⭐",
            title: "Verified Specialists",
            text: "Every doctor on the platform is verified for credentials and experience.",
            color: "bg-amber-100 text-amber-600",
          },
          {
            icon: "💬",
            title: "24/7 Support",
            text: "Our care team is available around the clock to help with bookings and queries.",
            color: "bg-sky-100 text-sky-600",
          },
        ],
        steps: [
          { n: "01", title: "Search For Doctors", text: "Search for a doctor based on specialization, location, or availability.", icon: "🔍", color: "bg-blue-600" },
          { n: "02", title: "Check Doctor Profile", text: "Explore detailed doctor profiles to make informed decisions.", icon: "👨‍⚕️", color: "bg-emerald-600" },
          { n: "03", title: "Appointment", text: "Choose a convenient time slot and confirm your appointment.", icon: "📅", color: "bg-violet-600" },
          { n: "04", title: "Get Your Solution", text: "Discuss your concerns and receive personalized advice.", icon: "💊", color: "bg-pink-600" },
        ],
        geriatrics: {
          image: "/images/geriatrics.jpg",
          title: "Compassionate Care for Golden Years",
          description:
            "Just as children need specialised attention, our senior citizens deserve care that respects their age, comfort and dignity. Our geriatric specialists focus on preventive health, chronic care and overall quality of life.",
          features: [
            "Regular health screenings & check-ups",
            "Chronic disease management (diabetes, BP, heart)",
            "Mobility & physiotherapy support",
            "Medication review & mental wellness care",
          ],
          stats: [
            { value: "60+", label: "Age Group Served" },
            { value: "24/7", label: "Helpline Support" },
            { value: "50+", label: "Geriatric Specialists" },
          ],
          patients: "25K+",
        },
        posts: [
          {
            date: "18 Jul",
            category: "Doctor",
            title: "Making your clinic visit painless",
            text: "Simple tips to prepare before your appointment and get the most out of your visit.",
            image: "/images/blog-1.jpg",
          },
          {
            date: "28 Sep",
            category: "Clinic",
            title: "Benefits of consulting an online doctor",
            text: "Why more patients are choosing telemedicine for follow-ups and minor concerns.",
            image: "/images/blog-2.jpg",
          },
          {
            date: "25 Sep",
            category: "Doctor",
            title: "5 reasons to book your doctor online",
            text: "Save time, compare specialists, and manage your bookings from one dashboard.",
            image: "/images/blog-3.jpg",
          },
        ],
        slides: [
          {
            badge: "🩺 Doctor Appointment Manager",
            title: "Discover Health: Find Your Trusted Doctors Today",
            subtitle:
              "Browse specialists, book appointments, and manage your visits online — all in one place.",
            image: "/images/hero-1.jpg",
          },
          {
            badge: "❤️ Trusted Care",
            title: "Book Appointments in Minutes",
            subtitle:
              "No phone calls. No long waits. Just fast, simple online booking for every specialty.",
            image: "/images/hero-2.jpg",
          },
          {
            badge: "🏥 Hospitals & Clinics",
            title: "Top Specialists for Every Need",
            subtitle:
              "Cardiology, Dermatology, Neurology, Pediatrics, Geriatrics and many more.",
            image: "/images/hero-3.jpg",
          },
          {
            badge: "👨‍⚕️ Expert Surgeons",
            title: "Advanced Care, Modern Facilities",
            subtitle:
              "State-of-the-art operation theatres and experienced surgical teams you can rely on.",
            image: "/images/hero-4.jpg",
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
