# Security Specification for Sentinax AI

## Data Invariants
- A `log` must have a non-empty `username`.
- A `log` must have a non-empty `code` (Pine Script).
- `createdAt` must be the server time.
- Only users in the `admins` collection can read `logs`.
- Logs are immutable once created.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Empty Log**: `{}` - Should be denied by schema.
2. **Missing username**: `{"code": "Pine Script here", "createdAt": request.time}` - Denied.
3. **Missing code**: `{"username": "hemanaruto", "createdAt": request.time}` - Denied.
4. **Spoofed createdAt**: `{"username": "hacker", "code": " Pine Script", "createdAt": timestamp.date(2020, 1, 1)}` - Denied.
5. **Unauthorized Read**: Attempting to read `logs` as a non-admin signed-in user - Denied.
6. **Unauthorized Delete**: Attempting to delete a log as a non-admin - Denied.
7. **Unauthorized Update**: Attempting to modify a log's code - Denied.
8. **Admin Privilege Escalation**: Attempting to write to the `admins` collection - Denied by catch-all/global deny.
9. **Identity Spoofing**: Attempting to create a log with a huge username (DoS) - Denied by size constraints.
10. **Huge Script injection**: Attempting to save a 2MB script - Denied by Firestore limits (and size constraints in rules).
11. **Path variable injection**: Attempting to target a document with an invalid ID format - Denied by `isValidId`.
12. **PII Leak**: Attempting to fetch the entire `admins` list as a guest - Denied.
