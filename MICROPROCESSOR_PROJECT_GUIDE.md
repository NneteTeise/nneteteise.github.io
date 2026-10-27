# MCP261S Microprocessor project — portfolio addition

Project page: `projects/microprocessor-active-filter/index.html`
Interactive web demo: `projects/microprocessor-active-filter/demo.html`

This website keeps the existing Power Systems and four PLC lab pages. The MCP261S project card has been added to the homepage.

## What the archive contained
- Original SimulIDE `.sim1` model for five sources, relay selector and active RC low-pass filter
- Arduino C++ source `.ino` using D2-D6, 10-second dwell and 300-millisecond all-off gap
- MATLAB `frequency_response.m` plotting measured and theoretical gain
- Final 17-page academic report and screenshots
- Arduino build binaries (excluded from public package because source is provided and binaries include archived identity strings)

## How to use
1. Copy the complete website files into the correct GitHub repository working folder (do not remove `.git`).
2. In a browser, open `index.html`, then the Microprocessor card, then the interactive demo.
3. Use GitHub Desktop: Commit to main > Push origin. GitHub Pages can serve it from main/root.

## Reproducing the engineering simulation
The browser demo is **not** the SimulIDE simulation. To run the actual model, open the `.sim1` file in a compatible version of SimulIDE, compile the included `.ino` for an Arduino Uno, export a `.hex`, then assign the compiled firmware to the Arduino program property in SimulIDE. The public SimulIDE circuit's original machine-specific program path was replaced with a local filename; point it to the built `.hex` if the default local path does not resolve.

## Evidence and privacy
The report and screenshots are copies drawn from the submitted project. ID-number text was masked in public copies; the engineering calculations and main code logic are preserved. Before sharing publicly, have the project owner verify their permission to post the work and check that no remaining identifying or private information is included. All simulations are educational and are not evidence of physical hardware validation.
