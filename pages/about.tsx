
import { motion } from 'framer-motion';
import NavHeader from '../components/NavHeader';
import Footer from '../components/Footer';

export default function AboutPage() {
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
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4">
            Joint Tracker is a real-time motion analysis tool that helps you measure and track joint angles using computer vision technology. Built with MediaPipe Holistic, it provides accurate measurements for various body movements.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">How It Works</h2>
          <p className="text-gray-600 mb-4">
            Using your device's camera, Joint Tracker identifies key body landmarks and calculates angles between joints in real-time. This makes it perfect for:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li className="mb-2">Physical therapy assessments</li>
            <li className="mb-2">Movement analysis</li>
            <li className="mb-2">Posture evaluation</li>
            <li>Range of motion tracking</li>
          </ul>
        </div>
      </motion.div>
      
      <Footer />
    </motion.div>
  );
}
