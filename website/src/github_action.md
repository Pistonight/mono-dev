# GitHub Actions

Since the development activity is on GitHub, I use GitHub Actions
to run CI. I use runners from [Blacksmith](https://app.blacksmith.sh/)
to speed up some hot workflows.

This section has copy-paste configs for action. Once setup, the actions
are actually rarely need to be changed, so there's no ROI to automate this.

To get started, create this directory structure:
```
- .github/
  - steps/
    - setup/
      - action.yml
  - workflows/
    - pr.yml
    - ... (more .yml for workflows)
```
