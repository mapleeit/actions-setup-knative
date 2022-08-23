import { platform as getPlatform } from 'node:os';
import { join } from 'node:path';
import { addPath, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { downloadTool } from '@actions/tool-cache';
import { mkdirP, mv } from '@actions/io';

const getLatestDownloadUrlOf = (tool) => {
  const osPlat = getPlatform()
  const platform = osPlat === 'win32' ? 'windows' : osPlat
  const suffix = osPlat === 'win32' ? '.exe' : ''

  const map = {
    'kn': 'knative/client',
    'kn-quickstart': 'knative-sandbox/kn-plugin-quickstart',
    'minikube': 'kubernetes/minikube',
  };

  if (map[tool]) {
    return `https://github.com/${map[tool]}/releases/latest/download/${tool}-${platform}-amd64${suffix}`;
  }

  throw new Error(`Dont support ${tool}`)
}

async function install(tool) {
  // Download the specific version of the tool, e.g. as a tarball
  const downloadPath = await downloadTool(getLatestDownloadUrlOf(tool));
  const binPath =
    getPlatform() === 'darwin' ? '/Users/runner/bin' : '/home/runner/bin';
  await mkdirP(binPath);
  await exec('chmod', ['+x', downloadPath])
  await mv(downloadPath, join(binPath, tool))

  // Expose the tool by adding it to the PATH
  addPath(binPath)
}

async function setup() {
  await install('minikube');
  await install('kn');
  await install('kn-quickstart');

  await exec('minikube config set cpus 2');
  await exec('minikube config set embed-certs true');
  
  await exec('kn quickstart minikube --install-serving');
}

try {
  setup()
} catch(e) {
  setFailed(e);
}
