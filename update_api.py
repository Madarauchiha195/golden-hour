import os
import glob
import re

api_dir = r"d:\AIML\golden-hourtitle--golden-hour-page-incredible-space-6iit\app\api"

for filepath in glob.glob(os.path.join(api_dir, "**", "route.ts"), recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = False

    # Replace import
    if "import { authMiddleware, getCurrentUserId } from 'lyzr-architect';" in content:
        content = content.replace(
            "import { authMiddleware, getCurrentUserId } from 'lyzr-architect';",
            "// @ts-ignore\nimport { getCurrentUserId } from 'lyzr-architect';\nconst getCurrentUserIdMock = () => 'demo-user-123';"
        )
        # Replace usage
        content = content.replace("getCurrentUserId()", "getCurrentUserIdMock()")
        modified = True
    elif "import { authMiddleware } from 'lyzr-architect';" in content:
        content = content.replace(
            "import { authMiddleware } from 'lyzr-architect';",
            "// Removed authMiddleware import"
        )
        modified = True

    # Replace protected handlers
    if "const protectedHandler = authMiddleware(handler);" in content:
        content = content.replace("const protectedHandler = authMiddleware(handler);", "")
        content = content.replace("export const GET = protectedHandler;", "export const GET = handler;")
        content = content.replace("export const POST = protectedHandler;", "export const POST = handler;")
        content = content.replace("export const PUT = protectedHandler;", "export const PUT = handler;")
        content = content.replace("export const DELETE = protectedHandler;", "export const DELETE = handler;")
        modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
