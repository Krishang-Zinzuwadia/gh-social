import React from "react";
import FrontendSVG from "@/assets/images/onboarding/frontend.svg";
import BackendSVG from "@/assets/images/onboarding/backend.svg";
import AiMlSVG from "@/assets/images/onboarding/ai_ml.svg";
import DevopsSVG from "@/assets/images/onboarding/devops.svg";
import DatabaseSVG from "@/assets/images/onboarding/database.svg";
import MobileSVG from "@/assets/images/onboarding/mobile.svg";
import SystemsSVG from "@/assets/images/onboarding/systems.svg";

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

export interface SkillCategory {
  id: string;
  title: string;
  icon: React.JSX.Element;
  order: number;
}

export interface TechStack {
  id: string;
  name: string;
  icon: React.JSX.Element;
}

export interface Interest {
  id: string;
  name: string;
  icon: React.JSX.Element;
}

export interface InterestCategory {
  id: string;
  title: string;
  interests: Interest[];
}

export const getTechIcon = (name: string): React.JSX.Element => {
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

export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: "web", title: "Web / Frontend Frameworks", icon: <FrontendSVG width={24} height={24} />, order: 1 },
  { id: "backend", title: "Backend / APIs", icon: <BackendSVG width={24} height={24} />, order: 2 },
  { id: "data", title: "Data Engineering & AI/ML Pipelines", icon: <AiMlSVG width={24} height={24} />, order: 3 },
  { id: "devops", title: "DevOps, Infrastructure & Security", icon: <DevopsSVG width={24} height={24} />, order: 4 },
  { id: "databases", title: "Databases & Storage", icon: <DatabaseSVG width={24} height={24} />, order: 5 },
  { id: "mobile", title: "Mobile & Cross-Platform Applications", icon: <MobileSVG width={24} height={24} />, order: 6 },
  { id: "systems", title: "Systems & Embedded Programming", icon: <SystemsSVG width={24} height={24} />, order: 7 },
];

export const SUGGESTED_TECHS: TechStack[] = [
  "React",
  "MongoDB",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Next.js",
  "TypeScript",
  "GraphQL",
  "Docker",
  "Prisma",
  "AWS",
].map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, icon: getTechIcon(name) }));

const RAW_INTERESTS = [
  { categoryId: "web", keywords: ["react", "vue", "angular", "svelte", "nextjs", "nuxt", "frontend", "ui", "component", "tailwind", "css", "html", "browser", "dom"] },
  { categoryId: "backend", keywords: ["express", "django", "flask", "fastapi", "spring", "asp.net", "rails", "backend", "rest", "graphql", "api", "microservice", "server", "middleware", "rpc", "grpc"] },
  { categoryId: "data", keywords: ["tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "spark", "hadoop", "airflow", "kafka", "machine learning", "deep learning", "neural network", "data pipeline", "etl", "llm", "rag", "vector database", "model"] },
  { categoryId: "devops", keywords: ["docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "ci/cd", "aws", "gcp", "azure", "cloud", "infrastructure", "security", "authentication", "oauth", "deployment", "container"] },
  { categoryId: "databases", keywords: ["mysql", "postgresql", "mongodb", "redis", "cassandra", "elasticsearch", "database", "sql", "nosql", "orm", "storage", "cache"] },
  { categoryId: "mobile", keywords: ["react native", "flutter", "swift", "kotlin", "android", "ios", "mobile", "app", "cross-platform", "xamarin", "ionic"] },
  { categoryId: "systems", keywords: ["rust", "c++", "c", "go", "assembly", "embedded", "os", "kernel", "system", "performance", "memory management", "compiler", "webassembly", "wasm"] }
];

export const INTEREST_CATEGORIES: InterestCategory[] = SKILL_CATEGORIES.map(category => {
  const raw = RAW_INTERESTS.find(r => r.categoryId === category.id);
  const interests: Interest[] = (raw?.keywords || []).map(keyword => ({
    id: keyword,
    name: keyword, // keep as is or format? The UI currently just renders keyword directly
    icon: getTechIcon(keyword)
  }));
  return {
    id: category.id,
    title: category.title,
    interests
  };
});
