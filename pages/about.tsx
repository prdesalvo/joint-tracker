// pages/about.tsx
import { motion } from "framer-motion";
import NavHeader from "../components/NavHeader";
import Footer from "../components/Footer";
import type { NextPage } from "next";

const AboutPage: NextPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-3xl mx-auto"
    >
      <NavHeader />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Joint Tracker</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            Joint Tracker is a real-time motion analysis tool that helps you measure and track joint angles using computer vision technology. Built with MediaPipe Holistic, it provides accurate measurements for various body movements.
          </p>

        </div>
      </motion.div>

      <Footer />
    </motion.div>
  );
};

export default AboutPage;
