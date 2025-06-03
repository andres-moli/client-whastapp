import React from "react";
import {
  FaBeer,
  FaCoffee,
  FaApple,
  FaCar,
  FaHeart,
  FaKey,
  FaBell,
  FaBook,
  FaCamera,
  FaCloud,
  FaEnvelope,
  FaGlobe,
  FaHome,
  FaLock,
  FaMusic,
  FaSearch,
  FaStar,
  FaThumbsUp,
  FaUser,
  FaWifi,
  FaNetworkWired,
  FaEthernet,
  FaServer,
  FaDatabase,
  FaLaptop,
  FaDesktop,
  FaMobileAlt,
  FaTools,
  FaShieldAlt,
  FaBug,
  FaCode,
  FaTerminal,
  FaCogs,
  FaMicrochip,
  FaSatellite,
  FaSignal,
  FaRoute,
  FaPlug,
  FaProjectDiagram,
  FaHeadset,
  FaHardHat,
  FaBroadcastTower,
  FaFolder,
  FaHdd,
  FaPhone,
  FaTabletAlt,
  FaSitemap,
  FaFileAlt,
  FaTasks,
  FaClipboard,
} from "react-icons/fa";

const iconsMap: Record<string, React.ReactNode> = {
  // Comunes
  "fa fa-beer": <FaBeer />,
  "fa fa-coffee": <FaCoffee />,
  "fa fa-apple": <FaApple />,
  "fa fa-car": <FaCar />,
  "fa fa-heart": <FaHeart />,
  "fa fa-key": <FaKey />,
  "fa fa-bell": <FaBell />,
  "fa fa-book": <FaBook />,
  "fa fa-camera": <FaCamera />,
  "fa fa-envelope": <FaEnvelope />,
  "fa fa-globe": <FaGlobe />,
  "fa fa-home": <FaHome />,
  "fa fa-lock": <FaLock />,
  "fa fa-music": <FaMusic />,
  "fa fa-search": <FaSearch />,
  "fa fa-star": <FaStar />,
  "fa fa-thumbs-up": <FaThumbsUp />,
  "fa fa-user": <FaUser />,

  // Redes y tecnología
  "fa fa-wifi": <FaWifi />,
  "fa fa-network-wired": <FaNetworkWired />,
  "fa fa-ethernet": <FaEthernet />,
  "fa fa-server": <FaServer />,
  "fa fa-database": <FaDatabase />,
  "fa fa-laptop": <FaLaptop />,
  "fa fa-desktop": <FaDesktop />,
  "fa fa-mobile-alt": <FaMobileAlt />,
  "fa fa-tools": <FaTools />,
  "fa fa-shield-alt": <FaShieldAlt />,
  "fa fa-bug": <FaBug />,
  "fa fa-code": <FaCode />,
  "fa fa-terminal": <FaTerminal />,
  "fa fa-cogs": <FaCogs />,
  "fa fa-microchip": <FaMicrochip />,
  "fa fa-satellite": <FaSatellite />,
  "fa fa-signal": <FaSignal />,
  "fa fa-route": <FaRoute />,
  "fa fa-plug": <FaPlug />,
  "fa fa-project-diagram": <FaProjectDiagram />,
  "fa fa-headset": <FaHeadset />,
  "fa fa-hard-hat": <FaHardHat />,
  "fa fa-broadcast-tower": <FaBroadcastTower />,
  "fa fa-folder": <FaFolder />,
  "fa fa-hdd": <FaHdd />,
  "fa fa-phone": <FaPhone />,
  "fa fa-tablet-alt": <FaTabletAlt />,
  "fa fa-sitemap": <FaSitemap />,
  "fa fa-file-alt": <FaFileAlt />,
  "fa fa-tasks": <FaTasks />,
  "fa fa-clipboard": <FaClipboard />,
};

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(iconsMap).map(([key, icon]) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`p-2 border rounded cursor-pointer text-3xl ${
              selected ? "border-blue-600 bg-blue-100" : "border-gray-300"
            }`}
            title={key}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
