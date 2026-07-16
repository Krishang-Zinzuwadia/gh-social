import React from 'react';
import {
  Binary,
  Boxes,
  Code2,
  Database,
  Orbit,
  PenTool,
  Terminal,
  Zap,
} from 'lucide-react-native';

import AndroidSvg from '../../assets/icons/android.svg';
import AstroSvg from '../../assets/icons/astro.svg';
import CplusplusSvg from '../../assets/icons/cplusplus.svg';
import CsharpSvg from '../../assets/icons/csharp.svg';
import CssSvg from '../../assets/icons/css.svg';
import GoSvg from '../../assets/icons/go.svg';
import HtmlSvg from '../../assets/icons/html.svg';
import JavaSvg from '../../assets/icons/java.svg';
import JavaScriptSvg from '../../assets/icons/javascript.svg';
import MongoDbSvg from '../../assets/icons/Vector (7).svg';
import PhpSvg from '../../assets/icons/php.svg';
import PythonSvg from '../../assets/icons/python.svg';
import ReactSvg from '../../assets/icons/react.svg';
import RubySvg from '../../assets/icons/ruby.svg';
import RustSvg from '../../assets/icons/rust.svg';
import ShellSvg from '../../assets/icons/shell.svg';
import TailwindSvg from '../../assets/icons/tailwind.svg';
import TypeScriptSvg from '../../assets/icons/typescript.svg';
import AwsSvg from '@/assets/images/onboarding/aws.svg';
import DjangoSvg from '@/assets/images/onboarding/django.svg';
import DockerSvg from '@/assets/images/onboarding/docker.svg';
import ExpressSvg from '@/assets/images/onboarding/express.svg';
import FirebaseSvg from '@/assets/images/onboarding/firebase.svg';
import FlaskSvg from '@/assets/images/onboarding/flask.svg';
import GitSvg from '@/assets/images/onboarding/git.svg';
import GitHubSvg from '@/assets/images/onboarding/github.svg';
import KubernetesSvg from '@/assets/images/onboarding/kubernetes.svg';
import NodeJsSvg from '@/assets/images/onboarding/node_js.svg';
import PostgreSqlSvg from '@/assets/images/onboarding/postgresql.svg';
import TerraformSvg from '@/assets/images/onboarding/terraform.svg';

type TechStackIconProps = {
  color: string;
  name: string;
  size: number;
};

function getBrandedIcon(name: string, size: number): React.ReactNode {
  const normalized = name.trim().toLowerCase();
  const iconProps = { accessibilityLabel: `${name} logo`, height: size, width: size };

  if (normalized.includes('react')) return <ReactSvg {...iconProps} />;
  if (normalized.includes('typescript') || normalized === 'ts') return <TypeScriptSvg {...iconProps} />;
  if (normalized.includes('javascript') || normalized === 'js') return <JavaScriptSvg {...iconProps} />;
  if (normalized.includes('python')) return <PythonSvg {...iconProps} />;
  if (normalized.includes('android')) return <AndroidSvg {...iconProps} />;
  if (normalized.includes('java')) return <JavaSvg {...iconProps} />;
  if (normalized.includes('c++') || normalized.includes('cplusplus')) return <CplusplusSvg {...iconProps} />;
  if (normalized === 'c#' || normalized.includes('csharp')) return <CsharpSvg {...iconProps} />;
  if (normalized === 'css' || normalized.includes('css3')) return <CssSvg {...iconProps} />;
  if (normalized === 'html' || normalized.includes('html5')) return <HtmlSvg {...iconProps} />;
  if (normalized.includes('tailwind')) return <TailwindSvg {...iconProps} />;
  if (normalized.includes('astro')) return <AstroSvg {...iconProps} />;
  if (normalized === 'go' || normalized.includes('golang')) return <GoSvg {...iconProps} />;
  if (normalized.includes('php')) return <PhpSvg {...iconProps} />;
  if (normalized.includes('ruby')) return <RubySvg {...iconProps} />;
  if (normalized.includes('rust')) return <RustSvg {...iconProps} />;
  if (normalized.includes('bash') || normalized.includes('shell') || normalized === 'zsh') return <ShellSvg {...iconProps} />;
  if (normalized.includes('node')) return <NodeJsSvg {...iconProps} />;
  if (normalized.includes('express')) return <ExpressSvg {...iconProps} />;
  if (normalized.includes('django')) return <DjangoSvg {...iconProps} />;
  if (normalized.includes('flask')) return <FlaskSvg {...iconProps} />;
  if (normalized.includes('docker')) return <DockerSvg {...iconProps} />;
  if (normalized.includes('kubernetes') || normalized === 'k8s') return <KubernetesSvg {...iconProps} />;
  if (normalized.includes('github')) return <GitHubSvg {...iconProps} />;
  if (normalized === 'git') return <GitSvg {...iconProps} />;
  if (normalized.includes('firebase')) return <FirebaseSvg {...iconProps} />;
  if (normalized.includes('mongo')) return <MongoDbSvg {...iconProps} />;
  if (normalized.includes('postgres')) return <PostgreSqlSvg {...iconProps} />;
  if (normalized.includes('terraform')) return <TerraformSvg {...iconProps} />;
  if (normalized === 'aws' || normalized.includes('amazon web services')) return <AwsSvg {...iconProps} />;

  return null;
}

export function TechStackIcon({ color, name, size }: TechStackIconProps) {
  const brandedIcon = getBrandedIcon(name, size);
  if (brandedIcon) return brandedIcon;

  const normalized = name.trim().toLowerCase();
  const fallbackProps = { color, size, strokeWidth: 1.9 };

  if (normalized.includes('database') || normalized.includes('sql') || normalized.includes('redis') || normalized.includes('qdrant')) {
    return <Database {...fallbackProps} />;
  }
  if (normalized.includes('numpy') || normalized.includes('pandas')) {
    return <Boxes {...fallbackProps} />;
  }
  if (normalized.includes('supabase')) return <Zap {...fallbackProps} />;
  if (normalized.includes('expo')) return <Orbit {...fallbackProps} />;
  if (normalized.includes('wasm') || normalized.includes('webassembly')) {
    return <Binary {...fallbackProps} />;
  }
  if (normalized === 'svg') return <PenTool {...fallbackProps} />;
  if (normalized.includes('terminal') || normalized.includes('powershell')) {
    return <Terminal {...fallbackProps} />;
  }

  return <Code2 {...fallbackProps} />;
}
