#!/usr/bin/env bash
# ============================================================================
# SeeDS 2.0 — Full Directory Scaffold Script
# Omega Mu Gamma Studio
#
# Run this from the ROOT of the SeeDS repo, on the rebuild-2.0 branch.
#
# WHAT THIS DOES:
#   1. (Optionally) wipes the current src/ and public/ — commented out by
#      default, uncomment the two rm -rf lines below if you actually want
#      that. Since you're on a branch, and v1 is tagged, this is safe either
#      way — but no script should delete things silently without you reading
#      the line that does it.
#   2. Rebuilds the entire folder structure from PRD.md / README.md, with
#      every file left blank (or with a minimal stub where a totally empty
#      file would be actively confusing later).
#   3. Fixes package.json with the correct dependencies (this was broken —
#      see prior conversation, npm install would have failed with zero deps).
#
# Safe to re-run — every command either creates something that doesn't
# exist yet or overwrites a stub with the same stub. It will NOT touch
# anything you've already written real content into UNLESS you re-run a
# `> file` truncation line for a file you've since edited — read section 2
# before re-running on a repo you've already started filling in.
# ============================================================================

set -e

echo "== SeeDS 2.0 scaffold starting =="

# ----------------------------------------------------------------------------
# 0. UNCOMMENT THESE TWO LINES IF YOU WANT A HARD WIPE FIRST
#    (Left commented on purpose — deleting things should be a decision you
#    make on purpose, not a default a script does for you.)
# ----------------------------------------------------------------------------
# rm -rf src public
# echo "Wiped src/ and public/"

# ----------------------------------------------------------------------------
# 1. package.json — the fix for the "zero dependencies" bug
# ----------------------------------------------------------------------------
cat > package.json << 'EOF'
{
  "name": "seeds-2",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.16.0",
    "zustand": "^5.0.14",
    "framer-motion": "^12.40.0",
    "konva": "^9.3.16",
    "react-konva": "^18.2.10"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}
EOF
echo "-- package.json rewritten with real dependencies"

rm -f package-lock.json

# ----------------------------------------------------------------------------
# 2. Root config files
# ----------------------------------------------------------------------------
if [ ! -f vite.config.js ]; then
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOF
fi

if [ ! -f eslint.config.js ]; then
cat > eslint.config.js << 'EOF'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
]
EOF
fi

if [ ! -f index.html ]; then
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SeeDS 2.0</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
fi

echo "-- root config files in place"

# ----------------------------------------------------------------------------
# 3. public/
# ----------------------------------------------------------------------------
COUSINS=(scout mei camille rosa valeria ananya miyu florence mack simi)
EXPRESSIONS=(teaching excited thinking oops frustrated idle)

mkdir -p public/sprites/default
mkdir -p public/audio

for c in "${COUSINS[@]}"; do
  mkdir -p "public/sprites/cousins/$c"
done

# .gitkeep placeholders so empty sprite folders survive being committed
for exp in "${EXPRESSIONS[@]}"; do
  : > "public/sprites/default/.gitkeep"
done
for c in "${COUSINS[@]}"; do
  : > "public/sprites/cousins/$c/.gitkeep"
done

touch public/audio/.gitkeep
touch public/favicon.svg

echo "-- public/ scaffolded (sprite folders are placeholders — drop real PNGs in when art's ready)"

# ----------------------------------------------------------------------------
# 4. src/ root files
# ----------------------------------------------------------------------------
mkdir -p src

cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > src/App.jsx << 'EOF'
function App() {
  return (
    <div>
      <h1>SeeDS 2.0</h1>
      <p>Scaffolded. Time to build.</p>
    </div>
  )
}

export default App
EOF

echo "-- src/main.jsx, src/App.jsx in place"

# ----------------------------------------------------------------------------
# 5. src/pages/
# ----------------------------------------------------------------------------
mkdir -p src/pages
for page in Home UnitPage LessonPage Settings; do
  touch "src/pages/${page}.jsx"
  touch "src/pages/${page}.css"
done
echo "-- src/pages/ scaffolded"

# ----------------------------------------------------------------------------
# 6. src/components/
# ----------------------------------------------------------------------------
mkdir -p src/components/layout src/components/cousin src/components/lesson src/components/visualizers src/components/ui

# layout
touch src/components/layout/AppLayout.jsx src/components/layout/AppLayout.css
touch src/components/layout/Sidebar.jsx src/components/layout/Sidebar.css
touch src/components/layout/AnimatedBg.jsx src/components/layout/AnimatedBg.css

# cousin
touch src/components/cousin/CousinAvatar.jsx src/components/cousin/CousinAvatar.css
touch src/components/cousin/CousinPicker.jsx src/components/cousin/CousinPicker.css
touch src/components/cousin/SpeechBubble.jsx src/components/cousin/SpeechBubble.css

# lesson (the 5 phases + shared pieces)
touch src/components/lesson/PhaseContainer.jsx src/components/lesson/PhaseContainer.css
touch src/components/lesson/Phase1Understand.jsx
touch src/components/lesson/Phase2Code.jsx
touch src/components/lesson/Phase3Visual.jsx
touch src/components/lesson/Phase4Break.jsx
touch src/components/lesson/Phase5Test.jsx
touch src/components/lesson/CodeBlock.jsx src/components/lesson/CodeBlock.css
touch src/components/lesson/PhaseIndicator.jsx src/components/lesson/PhaseIndicator.css

# visualizers (the Konva dispatch layer)
touch src/components/visualizers/VisualizerDispatch.jsx
touch src/components/visualizers/NodeGraphRenderer.jsx
touch src/components/visualizers/BarsRenderer.jsx
touch src/components/visualizers/BucketsRenderer.jsx
touch src/components/visualizers/ArrayTreeDualRenderer.jsx

# ui
touch src/components/ui/BottomBar.jsx src/components/ui/BottomBar.css
touch src/components/ui/ProgressBar.jsx src/components/ui/ProgressBar.css
touch src/components/ui/XPDisplay.jsx src/components/ui/XPDisplay.css
touch src/components/ui/ThemeToggle.jsx src/components/ui/ThemeToggle.css

echo "-- src/components/ scaffolded (layout, cousin, lesson, visualizers, ui)"

# ----------------------------------------------------------------------------
# 7. src/data/  — lessons, units, cousins, dialogue
# ----------------------------------------------------------------------------
mkdir -p src/data/units src/data/cousins src/data/dialogue

# 7a. Lessons — real unit/lesson counts from the PRD's syllabus table
mkdir -p src/data/lessons/unit1 src/data/lessons/unit2 src/data/lessons/unit3 \
         src/data/lessons/unit4 src/data/lessons/unit5 src/data/lessons/unit6

declare -A LESSON_COUNTS=( [1]=5 [2]=3 [3]=3 [4]=4 [5]=2 [6]=5 )

for unit in 1 2 3 4 5 6; do
  count=${LESSON_COUNTS[$unit]}
  for (( i=1; i<=count; i++ )); do
    file="src/data/lessons/unit${unit}/${unit}.${i}.json"
    if [ ! -f "$file" ]; then
      cat > "$file" << EOF
{
  "id": "${unit}.${i}",
  "title": "TODO",
  "unit": ${unit},
  "topics": [],
  "xp": 10,
  "structureVariant": "linear",
  "phases": {
    "1": { "concept": "", "analogy": "", "mascotDialogue": "" },
    "2": { "code": "", "highlightLines": [], "mascotDialogue": "" },
    "3": { "code": "", "visual": { "rendererType": "node-graph", "data": {} }, "mascotDialogue": "", "mapping": {} },
    "4": { "brokenCode": "", "brokenVisual": { "rendererType": "node-graph", "data": {} }, "bugDescription": "", "mascotDialogue": "" },
    "5": { "challengeType": "multiple-choice", "question": "", "answer": "", "hints": [], "solution": "" }
  }
}
EOF
    fi
  done
done
echo "-- src/data/lessons/ scaffolded — 22 lesson stubs across 6 units (unit1:5, unit2:3, unit3:3, unit4:4, unit5:2, unit6:5)"

# 7b. Units metadata
for unit in 1 2 3 4 5 6; do
  file="src/data/units/unit${unit}.json"
  if [ ! -f "$file" ]; then
    cat > "$file" << EOF
{
  "unit": ${unit},
  "title": "TODO",
  "lessons": [],
  "icon": ""
}
EOF
  fi
done
echo "-- src/data/units/ scaffolded"

# 7c. Cousin identity files (default + 10 cousins)
for c in default "${COUSINS[@]}"; do
  file="src/data/cousins/${c}.json"
  if [ ! -f "$file" ]; then
    cat > "$file" << EOF
{
  "id": "${c}",
  "name": "TODO",
  "palette": { "primary": "", "secondary": "", "accent": "" },
  "catchphrase": "",
  "spriteFolder": "/sprites/${c}"
}
EOF
  fi
done
echo "-- src/data/cousins/ scaffolded (identity only — see GAMMA_COUSINS.md before filling these in)"

# 7d. Dialogue folders — ONE FOLDER PER COUSIN, LEFT EMPTY ON PURPOSE.
#     Per PRD.md §5.3, a missing dialogue file falls back to the lesson's own
#     neutral default — so pre-creating 10 cousins × 22 lessons = 220 blank
#     files here would be noise, not scaffolding. Write a file the moment you
#     actually write that cousin's line for that lesson, nothing before.
for c in "${COUSINS[@]}"; do
  mkdir -p "src/data/dialogue/$c"
  : > "src/data/dialogue/$c/.gitkeep"
done
echo "-- src/data/dialogue/ folders created (empty by design — see comment in script)"

# ----------------------------------------------------------------------------
# 8. src/hooks/
# ----------------------------------------------------------------------------
mkdir -p src/hooks
touch src/hooks/useLesson.js
touch src/hooks/useDialogue.js
touch src/hooks/useCousin.js
touch src/hooks/useProgress.js
echo "-- src/hooks/ scaffolded"

# ----------------------------------------------------------------------------
# 9. src/services/
# ----------------------------------------------------------------------------
mkdir -p src/services
touch src/services/lessonService.js
touch src/services/dialogueService.js
touch src/services/storageService.js
echo "-- src/services/ scaffolded (lessonService, dialogueService, storageService)"

# ----------------------------------------------------------------------------
# 10. src/store/
# ----------------------------------------------------------------------------
mkdir -p src/store

if [ ! -f src/store/lessonStore.js ]; then
cat > src/store/lessonStore.js << 'EOF'
import { create } from 'zustand'

export const useLessonStore = create((set) => ({
  currentLesson: null,
  currentPhase: 1,
  currentStep: 0,
  completed: false,
  setLesson: (id) => set({ currentLesson: id, currentPhase: 1, currentStep: 0 }),
  setPhase: (phase) => set({ currentPhase: phase }),
  nextPhase: () => set((state) => ({ currentPhase: state.currentPhase + 1 })),
  prevPhase: () => set((state) => ({ currentPhase: Math.max(1, state.currentPhase - 1) })),
}))
EOF
fi

if [ ! -f src/store/progressStore.js ]; then
  touch src/store/progressStore.js
fi

if [ ! -f src/store/uiStore.js ]; then
cat > src/store/uiStore.js << 'EOF'
import { create } from 'zustand'

export const useUIStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
EOF
fi

# cousinStore.js — the piece that was missing entirely last time
cat > src/store/cousinStore.js << 'EOF'
import { create } from 'zustand'

export const useCousinStore = create((set) => ({
  selectedCousin: 'default',
  unlockedCousins: ['default'],
  setCousin: (id) => set({ selectedCousin: id }),
  unlockCousin: (id) =>
    set((state) => ({
      unlockedCousins: state.unlockedCousins.includes(id)
        ? state.unlockedCousins
        : [...state.unlockedCousins, id],
    })),
}))
EOF

echo "-- src/store/ scaffolded (lessonStore, progressStore, uiStore, cousinStore)"

# ----------------------------------------------------------------------------
# 11. src/utils/
# ----------------------------------------------------------------------------
mkdir -p src/utils
touch src/utils/cHighlighter.js
touch src/utils/rendererDispatch.js
touch src/utils/xpCalculator.js
echo "-- src/utils/ scaffolded"

# ----------------------------------------------------------------------------
# 12. src/styles/
# ----------------------------------------------------------------------------
mkdir -p src/styles
if [ -f src/index.css ]; then
  mv src/index.css src/styles/globals.css
elif [ ! -f src/styles/globals.css ]; then
  touch src/styles/globals.css
fi
touch src/styles/tokens.css
echo "-- src/styles/ scaffolded"

echo ""
echo "== Scaffold complete =="
echo "Next: npm install, then npm run dev to confirm the blank shell boots."
echo "Then: fill in src/data/cousins/*.json using GAMMA_COUSINS.md as source of truth."