
## About setup-knative
- build/deploy/test your application against a real Kubernetes cluster that installed Knative in GitHub Actions.
- Install minikube, kn, kn-quickstart and create a new `Knative` minikube cluster for you.

## Basic Usage
```
    steps:
    - name: start knative
      id: knative
      uses: mapleeit/actions-setup-knative@main
```
