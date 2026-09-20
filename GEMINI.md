# Project Guidelines & Rules

## Port & Server Management
- **Primary Port**: The user runs the application on port **3000** (`http://localhost:3000`).
- **Do Not Kill Server/Terminal**: NEVER kill port 3000, any running server process, or any active user terminal unless explicitly requested by the user.
- **No Extra Ports**: NEVER launch alternate dev servers or spin up auxiliary ports (e.g. 3001, 3002).
- **Test on Active Port**: Always perform checks, curls, and tests directly against the user's currently running port (**3000**).
- **Strict Prohibition**: Absolutely NEVER kill running processes or spawn secondary dev servers/ports (3001, 3002, etc.). All verification MUST occur solely on the pre-existing active port.
- **Theme Standard**: The admin panel must always match the public site's theme (Rose/Crimson `#E11D48`, dark `#1A1A2E`, clean white & light gray background `#F8FAFC`/`bg-gray-50`), strictly NO gold or beige colors.


