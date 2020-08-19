import json
import requests

from kubernetes import client, config

def get_latest_sha(repo):
    latest = requests.get("https://hub.docker.com/v2/repositories/" + repo + "/tags/latest")
    data = json.loads(latest.text)
    sha = data["images"][0]["digest"]
    return sha

def k8s_get_deploy(name, namespace):
    config.load_incluster_config()

    v1 = client.AppsV1Api()
    deploys = v1.list_namespaced_deployment(watch=False, namespace=namespace)
    for i in deploys.items:
        if i.metadata.name == name:
            print("=== %s\t%s\t%s\t%s" %
                (i.spec.replicas, i.metadata.namespace, i.metadata.name, i.spec.template.spec.containers[0].image))
            return i

    return False

def k8s_patch_deploy(deploy):
    v1 = client.AppsV1Api()

    api_response = v1.patch_namespaced_deployment( name=deploy.metadata.name, namespace=deploy.metadata.namespace, body=deploy)
    print("Deployment updated. status='%s'" % str(api_response.status))

if __name__ == "__main__":
    repo = "digitalcollab/profile-apollo"
    digest=get_latest_sha(repo)

    config.load_incluster_config()
    deploy = k8s_get_deploy("profile-apollo", "paas")

    print("\n")
    print("%s\t%s\t%s\t%s" %
        (deploy.spec.replicas, deploy.metadata.namespace, deploy.metadata.name, deploy.spec.template.spec.containers[0].image))

    deploy.spec.template.spec.containers[0].image = repo+"@"+digest
    k8s_patch_deploy(deploy)

