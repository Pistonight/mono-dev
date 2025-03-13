# Setup

The setup is a composite action that sets up the tools and environment.

Copy the action below, and delete parts not needed.
```yaml
name: "Workflow Setup"
description: "Workflow Setup"

inputs:
  token:
    description: "GitHub Token"
    required: true
  rust_targets:
    description: "Targets for rust-toolchain"
    default: ""

runs:
  using: composite
  steps:
    - uses: arduino/setup-task@v2
      with:
        version: 3.x
        repo-token: ${{ inputs.token }}

    # js stuff
    - uses: pnpm/action-setup@v4
      with:
        version: 10
    - uses: actions/setup-node@v4 # useblacksmith/setup-node@v5
      with:
        node-version: 22
        cache: 'pnpm'
    - uses: oven-sh/setup-bun@v2

    # rust toolchain
    - uses: dtolnay/rust-toolchain@stable
      with:
        targets: ${{ inputs.rust_targets }}
    - uses: Swatinem/rust-cache@v2 # useblacksmith/rust-cache@v3

    # cargo tools
    - uses: taiki-e/install-action@v2
      with:
        tool: wasm-pack,mdbook,mdbook-admonish,ripgrep
    - uses: baptiste0928/cargo-install@v3
      with:
        crate: workex
        git: https://github.com/Pistonite/workex

    # python
    - uses: actions/setup-python@v5 # useblacksmith/setup-python@v6
      with:
        python-version: '3.13'
        cache: 'pip'
    - uses: BSFishy/pip-action@v1
      with:
        packages: |
          package1
          package2

    # gcloud
    # see https://github.com/google-github-actions/auth#preferred-direct-workload-identity-federation
    - id: auth
      uses: google-github-actions/auth@v2
      with:
        project_id: XXX
        workload_identity_provider: XXX
    - uses: google-github-actions/setup-gcloud@v2
```
