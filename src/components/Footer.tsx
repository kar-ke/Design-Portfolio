import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

// Refined double box icon as seen in screenshot
const CustomBoxIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="10" width="10" height="10" rx="1.5" />
    <path d="M10 4h10a2 2 0 0 1 2 2v10" strokeLinecap="round" />
  </svg>
);

export function Footer() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const email = "karthikramesh.work@gmail.com";
  const phone = "+91 9498875422";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    const event = new CustomEvent('show-toast', { detail: 'Email copied to clipboard' });
    window.dispatchEvent(event);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
    const event = new CustomEvent('show-toast', { detail: 'Phone number copied' });
    window.dispatchEvent(event);
  };

  return (
    <footer className="relative w-full bg-[#000000] text-[#e5e5e5] py-16 md:py-0 md:h-[340px] px-8 md:px-16 lg:px-24 z-50 flex flex-col justify-center">
      <div className="max-w-[1500px] mx-auto w-full flex flex-col gap-12 lg:gap-16">
        
        {/* Top & Middle Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
          <div className="flex flex-col gap-6 w-full">
            <p className="font-geist font-thin text-[20px] opacity-90 leading-relaxed tracking-[-0.02em]">
              wheather you&apos;re hiring, freelancing, or just want to chat about something feel free to
            </p>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div 
                onClick={handleCopyPhone}
                className="flex items-baseline gap-2 group cursor-pointer active:scale-95 transition-all opacity-80 hover:opacity-100"
              >
                <div className="text-[#D295EB] self-center">
                  {copiedPhone ? <Check size={20} className="text-green-400" /> : <CustomBoxIcon size={20} />}
                </div>
                <span className="font-serif font-normal text-[24px] text-[#D295EB]">Call</span>
              </div>
              
              <span className="font-geist font-thin text-[20px] opacity-90 tracking-[-0.02em]">or email</span>
              
              <div 
                onClick={handleCopyEmail}
                className="flex items-baseline gap-2 group cursor-pointer active:scale-95 transition-all opacity-80 hover:opacity-100"
              >
                <div className="text-[#ED840C] self-center">
                  {copiedEmail ? <Check size={20} className="text-green-400" /> : <CustomBoxIcon size={20} />}
                </div>
                <span className="font-serif font-normal text-[24px] text-[#ED840C] hover:opacity-80 transition-opacity">
                  {email}
                </span>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-10 lg:ml-auto">
            <motion.a 
              href="#" 
              className="opacity-100 hover:opacity-60 transition-opacity"
              whileHover={{ y: -4, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/Icons/x.svg" alt="X" className="w-[20px] h-[20px]" />
            </motion.a>
            <motion.a 
              href="#" 
              className="opacity-100 hover:opacity-60 transition-opacity"
              whileHover={{ y: -4, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/Icons/behance.svg" alt="Behance" className="w-[24px] h-[24px]" />
            </motion.a>
            <motion.a 
              href="#" 
              className="opacity-100 hover:opacity-60 transition-opacity"
              whileHover={{ y: -4, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/Icons/linkedin.svg" alt="LinkedIn" className="w-[22px] h-[22px]" />
            </motion.a>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-[1px] bg-white opacity-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          <h3 className="font-serif font-normal text-[24px] opacity-30">
            Karthikeyan Ramesh
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            {[
              { label: 'About', id: 'about' },
              { label: 'work', id: 'work' },
              { label: 'resume', id: 'resume' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={`#${item.id}`} 
                className="font-geist font-light text-[14px] opacity-40 hover:opacity-100 transition-opacity tracking-[-0.04em]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
