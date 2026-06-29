import React from "react";
import FrontendSVG from "@/assets/images/onboarding/frontend.svg";
import BackendSVG from "@/assets/images/onboarding/backend.svg";
import AiMlSVG from "@/assets/images/onboarding/ai_ml.svg";
import DevopsSVG from "@/assets/images/onboarding/devops.svg";
import DatabaseSVG from "@/assets/images/onboarding/database.svg";
import MobileSVG from "@/assets/images/onboarding/mobile.svg";
import SystemsSVG from "@/assets/images/onboarding/systems.svg";

import Gamepad2 from "@/assets/images/onboarding/gaming.svg";
import GraduationCap from "@/assets/images/onboarding/education.svg";
import Palette from "@/assets/images/onboarding/design.svg";
import Megaphone from "@/assets/images/onboarding/marketing.svg";
import Banknote from "@/assets/images/onboarding/finance.svg";
import HeartPulse from "@/assets/images/onboarding/health.svg";
import Music from "@/assets/images/onboarding/music.svg";
import Code2 from "@/assets/images/onboarding/open_source.svg";
import Brain from "@/assets/images/onboarding/ai.svg";
import Shield from "@/assets/images/onboarding/cybersecurity.svg";
import BarChart3 from "@/assets/images/onboarding/data_science.svg";
import PenTool from "@/assets/images/onboarding/writing.svg";
import Leaf from "@/assets/images/onboarding/sustainability.svg";
import Clapperboard from "@/assets/images/onboarding/movies.svg";
import Plane from "@/assets/images/onboarding/travel.svg";
import Lightbulb from "@/assets/images/onboarding/innovation.svg";
import Camera from "@/assets/images/onboarding/photography.svg";
import Users from "@/assets/images/onboarding/community.svg";
import Cloud from "@/assets/images/onboarding/cloud.svg";

export const CATEGORIES = [
  { id: "web", title: "Web / Frontend Frameworks", image: <FrontendSVG width={24} height={24} /> },
  { id: "backend", title: "Backend / APIs", image: <BackendSVG width={24} height={24} /> },
  { id: "data", title: "Data Engineering & AI/ML Pipelines", image: <AiMlSVG width={24} height={24} /> },
  { id: "devops", title: "DevOps, Infrastructure & Security", image: <DevopsSVG width={24} height={24} /> },
  { id: "databases", title: "Databases & Storage", image: <DatabaseSVG width={24} height={24} /> },
  { id: "mobile", title: "Mobile & Cross-Platform Applications", image: <MobileSVG width={24} height={24} /> },
  { id: "systems", title: "Systems & Embedded Programming", image: <SystemsSVG width={24} height={24} /> },
];

export const INTERESTS = [
  { categoryId: "web", keywords: ["react", "vue", "angular", "svelte", "nextjs", "nuxt", "frontend", "ui", "component", "tailwind", "css", "html", "browser", "dom"] },
  { categoryId: "backend", keywords: ["express", "django", "flask", "fastapi", "spring", "asp.net", "rails", "backend", "rest", "graphql", "api", "microservice", "server", "middleware", "rpc", "grpc"] },
  { categoryId: "data", keywords: ["tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "spark", "hadoop", "airflow", "kafka", "machine learning", "deep learning", "neural network", "data pipeline", "etl", "llm", "rag", "vector database", "model"] },
  { categoryId: "devops", keywords: ["docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "ci/cd", "aws", "gcp", "azure", "cloud", "infrastructure", "security", "authentication", "oauth", "deployment", "container"] },
  { categoryId: "databases", keywords: ["mysql", "postgresql", "mongodb", "redis", "cassandra", "elasticsearch", "database", "sql", "nosql", "orm", "storage", "cache"] },
  { categoryId: "mobile", keywords: ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile", "app", "cross-platform", "xamarin", "ionic"] },
  { categoryId: "systems", keywords: ["rust", "c++", "c", "go", "assembly", "embedded", "os", "kernel", "system", "performance", "memory management", "compiler", "webassembly", "wasm"] }
];

import ReactSVG from "@/assets/images/onboarding/react.svg";
import TypeScriptSVG from "@/assets/images/onboarding/typescript.svg";
import JavaScriptSVG from "@/assets/images/onboarding/javascript.svg";
import PythonSVG from "@/assets/images/onboarding/python.svg";
import JavaSVG from "@/assets/images/onboarding/java.svg";
import NodeJsSVG from "@/assets/images/onboarding/node_js.svg";
import ExpressSVG from "@/assets/images/onboarding/express.svg";
import DjangoSVG from "@/assets/images/onboarding/django.svg";
import FlaskSVG from "@/assets/images/onboarding/flask.svg";
import DockerSVG from "@/assets/images/onboarding/docker.svg";
import KubernetesSVG from "@/assets/images/onboarding/kubernetes.svg";
import GitSVG from "@/assets/images/onboarding/git.svg";
import GitHubSVG from "@/assets/images/onboarding/github.svg";
import FirebaseSVG from "@/assets/images/onboarding/firebase.svg";
import MongoDBSVG from "@/assets/images/onboarding/mongodb.svg";
import PostgreSQLSVG from "@/assets/images/onboarding/postgresql.svg";
import AWSSVG from "@/assets/images/onboarding/aws.svg";
import TailwindCssSVG from "@/assets/images/onboarding/tailwind_css.svg";
import DefaultTechSVG from "@/assets/images/onboarding/default_tech.svg";

export const getTechImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('react')) return <ReactSVG width={16} height={16} />;
  if (n.includes('typescript') || n === 'ts') return <TypeScriptSVG width={16} height={16} />;
  if (n.includes('javascript') || n === 'js') return <JavaScriptSVG width={16} height={16} />;
  if (n.includes('python')) return <PythonSVG width={16} height={16} />;
  if (n.includes('java') && !n.includes('script')) return <JavaSVG width={16} height={16} />;
  if (n.includes('node')) return <NodeJsSVG width={16} height={16} />;
  if (n.includes('express')) return <ExpressSVG width={16} height={16} />;
  if (n.includes('django')) return <DjangoSVG width={16} height={16} />;
  if (n.includes('flask')) return <FlaskSVG width={16} height={16} />;
  if (n.includes('docker')) return <DockerSVG width={16} height={16} />;
  if (n.includes('kubernetes') || n === 'k8s') return <KubernetesSVG width={16} height={16} />;
  if (n === 'git') return <GitSVG width={16} height={16} />;
  if (n.includes('github')) return <GitHubSVG width={16} height={16} />;
  if (n.includes('firebase')) return <FirebaseSVG width={16} height={16} />;
  if (n.includes('mongo')) return <MongoDBSVG width={16} height={16} />;
  if (n.includes('postgres')) return <PostgreSQLSVG width={16} height={16} />;
  if (n.includes('aws')) return <AWSSVG width={16} height={16} />;
  if (n.includes('tailwind')) return <TailwindCssSVG width={16} height={16} />;
  
  return <DefaultTechSVG width={16} height={16} />;
};
