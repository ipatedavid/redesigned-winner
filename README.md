![screenshot](screenshot.png)
# Overview

This is a website that allows me and my collaborator to play our old DOS games library through DOSBox.
The entirety of the website HTML and Javascript code was written by Theodor20, while the hosting infrastructure and CI/CD pipeline was implemented by ipatedavid.

---

## CI/CD Pipeline & Infrastructure

The web app is served from a self-managed, bare-metal Kubernetes cluster running on an Orange Pi Zero 3. The full deployment lifecycle is automated via a GitOps workflow:

- **CI:** GitHub Actions builds and versions a Docker image on every push to `main`, pushing the resulting artifact to a private Docker Hub repository and updating `deployment.yaml` with the new image tag.
- **CD:** Argo CD continuously monitors the repository for manifest changes and automatically synchronises the cluster to the desired state.

### Database

The website features integration with Firebase for accounts. 

###  Storage

The games library is stored in a single shared Google Drive folder, synchronized to the cluster using a self-hosted Actions runner that triggers `rclone` every 5 minutes and on every commit to `main`.

#### Setting up rclone

After configuring rclone for Google Drive, you may need to manually restrict its root folder. Add the following line to your `rclone.conf` under the remote you created:
```ini
root_folder_id = YOUR_FOLDER_ID
```

> The folder ID is the last segment of your Google Drive folder URL:
> `https://drive.google.com/drive/folders/`**`YOUR_FOLDER_ID`**

#### Runner permissions

The self-hosted runner requires write access to the cluster's local storage folder used for the game library. When installing the runner, ensure it runs under a user with appropriate permissions to that directory.

See [GitHub's self-hosted runner docs](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners) for installation instructions.

--- 
```mermaid
flowchart TD
    A[Developer\ngit push] --> B[GitHub Actions\nbuild · tag · push]
    B --> C[Docker Hub\nprivate repo]
    B --> D[deployment.yaml\nimage tag updated]
    D --> E[Argo CD\nwatches repo]
    E --> F[K3s Cluster]
    F --> G[NodePort service]
    G --> H[Pod: game-hub]
    H --> I[Browser/End User]
```

## Setup Notes

### Image Pull Secret

Create a Docker Hub credentials secret in your cluster to allow the deployment to pull from the private registry:

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  --docker-email=YOUR_EMAIL
```

### Argo CD — Cluster-Scoped Resources

If your Argo CD project is namespace-scoped, cluster-wide resources such as `PersistentVolume` objects will fail to deploy. To resolve this, add the relevant resource types to the project's **Cluster Resource Allow List** via the Argo CD UI or project manifest.
