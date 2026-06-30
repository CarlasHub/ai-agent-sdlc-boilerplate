# Tool Access Map

| Tool | Purpose | Read | Write | Execute | Data accessed | Risk | Approval required | Logging required | Owner |
|---|---|---:|---:|---:|---|---|---|---|---|
| Local file system | Read and update approved project files | yes | yes | no | public fictional demo data | medium | required before implementation | yes | Project owner |
| npm scripts | Run governance, eval, local app and release checks | yes | no | yes | public project metadata | medium | required | yes | Project owner |
| Git status | Review changed files | yes | no | no | public project metadata | low | not required | yes | Project owner |
| Official web research | Read public UX, accessibility and engineering standards | yes | no | no | public standards documentation | low | approved for UI quality review | yes | Project owner |
| In-app browser | Test local app at 127.0.0.1 only | yes | no | yes | public local demo UI | low | approved for local UI verification | yes | Project owner |
| Git CLI | Initialise repository, record release commit and push approved public demo files | yes | yes | yes | public project source and metadata | high | release approval required | yes | Project owner |
| GitHub CLI | Create public GitHub repository, configure remote and enable GitHub Pages | yes | yes | yes | public project source and repository metadata | high | release approval required | yes | Project owner |
| GitHub Pages | Host the static app demo from the approved repository workflow | yes | yes | yes | public fictional demo UI | medium | release approval required | yes | Project owner |
| Local screen recording | Record a local demonstration video of the approved fictional-data demo only | yes | yes | yes | public local demo UI and generated fictional project files | medium | required before demo recording | yes | Project owner |
| Local browser automation | Drive the approved local demo UI and VS Code web view for high-resolution fictional-data recording only | yes | no | yes | public local demo UI and generated fictional project files | medium | required before demo recording | yes | Project owner |
| Visual Studio Code | Open the generated fictional boilerplate workspace locally for demonstration review only | yes | no | yes | public generated fictional project files | low | required before demo recording | yes | Project owner |

Blocked tools:

Paid map APIs, production deployment tools outside this approved GitHub Pages demo, real databases, secret stores, HR systems, client systems, candidate systems, email sending tools and any tool that can affect real users or real business data.
