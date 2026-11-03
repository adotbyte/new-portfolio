# How I Freed Up 440 GB of Disk Space on My Docker Server

When my home server started showing that disk usage was nearing almost 500 GB, I was confused. It didn't add up in my head: after all, the server is meant for configurations, not heavy files. I only had a few **docker-compose.yml** files and running containers. Where did all the space go?

Today I'll tell you how, with the help of AI, I uncovered the real culprit, why standard Linux commands kept "freezing," and how I made the Docker system take care of its own garbage.

### The Problem: When a "Clean" Server Becomes a Junkyard
My server runs on an NVMe SSD drive, so I didn't have any speed issues. But when 

```bash
df -h
```
showed that the disk was using hundreds of gigabytes, I realized something was wrong.

My first thought was to find the largest files. The standard command for that is 

```bash
du (disk usage)
```
Unfortunately, in my case it became a real headache. When I tried to calculate the total size of the entire disk with 


```bash
du -h --max-depth=1 /
```
I just waited. And waited. And waited. The command simply "hung."

It turned out that the root directory had a huge number of small files (Docker layers, system processes), so du's attempt to recalculate everything was hopeless.

### The Solution: ncdu and AI Assistance
Since time was precious and I wanted a quick answer, I turned to my AI assistant. It suggested using ncdu instead of du – an interactive tool that runs much faster and lets you browse through directories like a file manager.

The command was simple:
```bash
sudo apt install ncdu -y
sudo ncdu /
```
After opening the interactive menu, I quickly saw this:

```text
485.0 GiB [####################] /var
```
Going deeper, I found the true cause of the problem:

```text
/var/lib/docker/overlay2   481.6 GiB
```
It turned out that the Docker build cache (the intermediate layers Docker creates while building images) was taking up almost all the disk space. Since I frequently build new containers and rebuild old ones, Docker was "quietly" accumulating this garbage, assuming it would be useful in the future.

How did I fix it?
Docker has a special tool for cleaning up this cache. There's no need to delete any files manually (which could break the system) – a single command is enough:


```bash
docker builder prune -a -f
```
After this command, disk usage instantly dropped from **27% (496 GB)** to **3% (52 GB)**. I freed up more than **440 GB** of space that I don't need at all!

### How to Prevent This in the Future?
Clearing the cache once is fine, but I wanted to make sure it didn't happen again. Since I use **cron** to automate my server, I added a weekly task that clears the Docker build cache automatically:

```bash
# Open the cron file
crontab -e

# Add a line (every Sunday at 4:00 AM)
0 4 * * 0 docker builder prune -a -f >> /var/log/docker_cleanup.log 2>&1
```
In addition, I set up Docker log rotation so that the container logs themselves don't grow infinitely. For this you need to create the file **/etc/docker/daemon.json**:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

And restart the Docker service:

```bash
sudo systemctl restart docker
```

### Lessons Learned
1. **du** is not a universal tool. If you have a lot of small files (especially in a Docker environment), it's better to use **ncdu**.

2. **Docker accumulates more than you think.** If you build images frequently, the build cache can grow to hundreds of gigabytes.

3. **Automation is key.** Instead of cleaning up manually every month, now **cron** does it.

Today my server breathes freely again, and I know that a week from now it will be clean once more. If you also use Docker for your home server, check the size of your overlay2 – maybe there are a few hundred gigabytes hiding there that you never even suspected.