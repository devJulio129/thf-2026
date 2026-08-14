import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El proyecto vive dentro de OneDrive, debajo de C:\Users\Admin, donde hay un
  // package-lock.json suelto. Sin esto Turbopack sube demasiado a buscar la raiz.
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
