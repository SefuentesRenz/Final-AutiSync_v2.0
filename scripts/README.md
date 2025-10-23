Push helper script

Usage (PowerShell):

- Default: tries to upload LFS objects and push to `upstream/main`. If push fails it creates a clean branch without LFS files and pushes it.

  powershell -ExecutionPolicy Bypass -File .\scripts\push-auto.ps1 -Remote upstream -Branch main

- To force remote main to be replaced by the cleaned branch (destructive):

  powershell -ExecutionPolicy Bypass -File .\scripts\push-auto.ps1 -Remote upstream -Branch main -AllowForce

Notes:
- This script moves LFS-tracked files out of the index temporarily on the clean branch so you can push the rest of the repository. It creates a remote backup named `backup-before-clean-upload-<timestamp>`.
- The script is conservative by default and will not force-update the remote main unless you pass `-AllowForce`.
- Always review the pushed `clean-upload-*` branch on the remote before merging into `main`.
