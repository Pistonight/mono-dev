# GitHub Actions

Since the development activity is on GitHub, I use GitHub Actions
to run CI. I use runners from [Blacksmith](https://app.blacksmith.sh/)
to speed up some hot workflows.

The Standard provides composite actions for common workflows
as well as copy-paste configs for composing workflows

## File Structure

The workflow files should be placed in the following directory structure:

```
- .github/
  - steps/
    - setup/
      - action.yml
    - ... (more repo-specific reusable steps)
  - workflows/
    - pr.yml
    - ... (more .yml for workflows)
```

