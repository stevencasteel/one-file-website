#!/usr/bin/env zsh

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

printf '\e[8;42;85t'

CYAN='\x1b[36m'
YELLOW='\x1b[33m'
NC='\x1b[0m'

clear
echo ""
echo -e "${YELLOW}  ┌──────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}  │${NC}          ${CYAN}STEVEN CASTEEL ARCHIVE PROJECT          ${NC}${YELLOW}│${NC}"
echo -e "${YELLOW}  │${NC}             Compiling AI Context...              ${YELLOW}│${NC}"
echo -e "${YELLOW}  └──────────────────────────────────────────────────┘${NC}"
echo ""

node create_source_context.js