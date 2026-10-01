import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde 127.0.0.1 y desde el móvil en la red local
  allowedDevOrigins: ["127.0.0.1", "10.10.14.155"],
};

export default nextConfig;
