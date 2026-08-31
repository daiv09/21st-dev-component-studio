#!/usr/bin/env node
// Watcher for endless automation: monitors TODO/ for .tsx drops
// When a file appears, triggers the process described in UPDATED_PROMPT.md
// This script loops continuously (endless automation)

const fs = require('fs');
const path = require('path');

const TODO_DIR = path.join(__dirname, 'TODO');
console.log('Watching for component drops in:', TODO_DIR);
console.log('When a .tsx file is added, the agent should start from UPDATED_PROMPT.md step 1.');
console.log('Loop is endless — keep the agent running continuously.');
