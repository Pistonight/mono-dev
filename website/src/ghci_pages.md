# GitHub Pages

Copy this for deploying to GitHub Pages after building
```yaml
jobs:
  deploy-to-pages:
    name: deploy-to-pages
    needs:
      - build
    if: github.event_name != 'pull_request'
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
