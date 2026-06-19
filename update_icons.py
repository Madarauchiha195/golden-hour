import os
import glob
import re

components_dir = r"d:\AIML\golden-hourtitle--golden-hour-page-incredible-space-6iit\app\sections"

for filepath in glob.glob(os.path.join(components_dir, "*.tsx")):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    modified = False

    # Find the import line for react-icons/fi
    import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]react-icons/fi['\"]", content)
    if import_match:
        # Extract all imported icons
        icons_str = import_match.group(1)
        icons = [i.strip() for i in icons_str.split(',')]
        
        # Build replacement mapping
        # e.g. FiActivity -> Activity
        replacements = {}
        new_icons = []
        for icon in icons:
            if icon.startswith('Fi'):
                new_icon = icon[2:]
                replacements[icon] = new_icon
                new_icons.append(new_icon)
        
        # Replace the import statement
        new_import = f"import {{ {', '.join(new_icons)} }} from 'lucide-react'"
        content = content.replace(import_match.group(0), new_import)
        
        # Replace all usages in the code
        for old_icon, new_icon in replacements.items():
            # Replace exactly the tag or component usage
            content = re.sub(rf"\b{old_icon}\b", new_icon, content)
            
        modified = True

    # Also remove <AuthScreen /> from GoldenHourApp.tsx and the !user condition
    if filepath.endswith("GoldenHourApp.tsx"):
        if "import { AuthScreen, Header } from './AuthAndHeader'" in content:
            content = content.replace("import { AuthScreen, Header } from './AuthAndHeader'", "import { Header } from './AuthAndHeader'")
            modified = True
        
        if "if (!user) {" in content:
            # We want to remove:
            # if (!user) {
            #   return <div style={THEME_VARS}><AuthScreen /></div>
            # }
            content = re.sub(r"if\s*\(!user\)\s*\{\s*return\s*<div\s*style=\{THEME_VARS\}><AuthScreen\s*/></div>\s*\}", "", content)
            modified = True

    # Also fix exhaustive-deps in IncidentIntake.tsx
    if filepath.endswith("IncidentIntake.tsx"):
        if "React.useEffect(() => {" in content and "}, [sampleMode])" in content:
            content = content.replace("}, [sampleMode])", "}, [sampleMode, onFormChange])")
            modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")
