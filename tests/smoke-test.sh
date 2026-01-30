#!/usr/bin/env bash

# Run smoke test of load test
# All args are passed to k6 which is useful for removing the randomised values
# for VUS and duration
kind create cluster --config=tests/kind-cluster.yaml

kubectl apply -k overlays/shared
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

kubectl apply -k overlays/load/foo
kubectl apply -k overlays/load/bar
kubectl wait \
  --for=condition=ready pod \
  --selector 'app in (foo,bar)'\
  --timeout=60s

k6 run tests/load-test.js $@

kind delete cluster -n load-test
