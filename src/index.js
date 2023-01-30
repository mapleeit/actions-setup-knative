import { platform as getPlatform } from 'node:os';
import { join } from 'node:path';
import { addPath, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { downloadTool } from '@actions/tool-cache';
import { mkdirP, mv } from '@actions/io';

const getLatestDownloadUrlOf = (tool, version) => {
  const osPlat = getPlatform()
  const platform = osPlat === 'win32' ? 'windows' : osPlat
  const suffix = osPlat === 'win32' ? '.exe' : ''

  const map = {
    'kn': 'knative/client',
    'kn-quickstart': 'knative-sandbox/kn-plugin-quickstart',
    'minikube': 'kubernetes/minikube',
  };

  if (map[tool]) {
    return `https://github.com/${map[tool]}/releases/${version}/download/${tool}-${platform}-amd64${suffix}`;
  }

  throw new Error(`Dont support ${tool}`)
}

async function install(tool, version = 'latest') {
  // Download the specific version of the tool, e.g. as a tarball
  const downloadPath = await downloadTool(getLatestDownloadUrlOf(tool, version));
  const binPath =
    getPlatform() === 'darwin' ? '/Users/runner/bin' : '/home/runner/bin';
  await mkdirP(binPath);
  await exec('chmod', ['+x', downloadPath])
  await mv(downloadPath, join(binPath, tool))

  // Expose the tool by adding it to the PATH
  addPath(binPath)
}

async function setup() {
  await install('minikube', 'v1.28.0');
  await install('kn');
  await install('kn-quickstart');

  await exec('minikube config set cpus 2');
  await exec('minikube config set EmbedCerts true');
  
  await exec('kn quickstart minikube --install-serving', undefined, { input: Buffer.from('\n\n') });
}

try {
  setup()
} catch(e) {
  setFailed(e);
}
