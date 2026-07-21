import React from "react";
// import {  } from "lucide-react";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full h-16 flex flex-col items-center justify-evenly">
      <span className="text-sm opactiy-75">
        Made with care for busy students
      </span>
      <div className="flex gap-3">
        <span className="text-xs hover:scale-110 hover:text-blue-900">
          <a href="">
            <FaLinkedin size={24} />
          </a>
        </span>
        <span className="text-xs hover:scale-110 hover:text-pink-700 ">
          <a href="">
            <FaInstagram size={24} />
          </a>
        </span>
        <span className="text-xs hover:scale-110 hover:text-gray-950">
          <a href="">
            <FaGithub size={24} />
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
