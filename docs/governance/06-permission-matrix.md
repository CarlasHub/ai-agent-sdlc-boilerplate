# Permission Matrix

| Action | Allowed before approval | Allowed after approval | Human approval required | Notes |
|---|---:|---:|---:|---|
| Read docs | yes | yes | no | The agent may only work inside the approved scope. It must not modify governance policies, approval records after sign-off, audit logs after creation, deployment credentials or restricted files without explicit human approval. |
| Read source code | yes | yes | no | |
| Write source code | no | yes | yes | |
| Run tests | no | yes | no | |
| Add dependency | no | security approval only | yes | |
| Create PR | no | yes | yes | |
| Create GitHub repository | no | yes | yes | Release-approved public demo only |
| Push release commit | no | yes | yes | Release-approved public demo only |
| Deploy | no | GitHub Pages demo only | yes | Critical action |
| Delete files | no | no | yes | Destructive action |
| Access secrets | no | no | yes | Blocked unless exceptional security-approved process |
