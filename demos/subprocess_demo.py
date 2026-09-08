import subprocess

# This will run a command on the computer, and can be used to offload tasks.
result = subprocess.run(["bash", "delay.sh"], capture_output=True, text=True, check=True)
print(result.stdout)
