import { addPath, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { downloadTool } from '@actions/tool-cache';
import { platform as getPlatform } from 'node:os';

const getLatestDownloadUrlOf = (tool) => {
  const osPlat = getPlatform()
  const platform = osPlat === 'win32' ? 'windows' : osPlat
  const suffix = osPlat === 'win32' ? '.exe' : ''

  const map = {
    'kn': 'knative/client',
    'kn-quickstart': 'knative-sandbox/kn-plugin-quickstart',
  };

  if (map[tool]) {
    return `https://github.com/${map[tool]}/releases/latest/download/${tool}-${platform}-amd64${suffix}`;
  }

  throw new Error(`Dont support ${tool}`)
}

async function install(tool) {
  // Download the specific version of the tool, e.g. as a tarball
  const pathToCLI = await downloadTool(getLatestDownloadUrlOf(tool));

  // Expose the tool by adding it to the PATH
  addPath(pathToCLI)
}

async function setup() {
  await install('kn');
  await install('kn-quickstart');

  await exec('kn quickstart minikube');
}

try {
  setup()
} catch(e) {
  setFailed(e);
}
