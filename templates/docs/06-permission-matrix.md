# Permission Matrix

| Action | Allowed before approval | Allowed after approval | Human approval required | Notes |
|---|---:|---:|---:|---|
| Read docs | yes | yes | no | [[PERMISSION_NOTES]] |
| Read source code | [[READ_SOURCE_BEFORE_APPROVAL]] | yes | [[READ_SOURCE_APPROVAL_REQUIRED]] | |
| Write source code | no | [[WRITE_SOURCE_AFTER_APPROVAL]] | yes | |
| Run tests | no | yes | no | |
| Add dependency | no | [[ADD_DEPENDENCY_AFTER_APPROVAL]] | yes | |
| Create PR | no | [[CREATE_PR_AFTER_APPROVAL]] | yes | |
| Deploy | no | no | yes | Critical action |
| Delete files | no | no | yes | Destructive action |
| Access secrets | no | no | yes | Blocked unless exceptional security-approved process |
