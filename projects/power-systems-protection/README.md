# Power System Fault Analysis & Protection Relay Modelling

**Portfolio owner:** Nnete Teise  
**Field:** Power Systems / Electrical Engineering  
**Files:** `GA_PowerSystems.slx` and `Task5_Visualisation.m`

## Overview
This repository contains an academic three-phase electrical power-system model and a MATLAB analysis script for normal operation, LLL faults, LG faults, bus voltages, fault currents and protection timing.

### What was identified in the `.slx` file
Three-phase source, transformer (two windings), distributed parameters line, RLC load, fault block, breaker, voltage-current measurement, powergui, scopes, and a protection subsystem with RMS, comparator and S-R flip-flop blocks.

### What is in the `.m` script
Task 5 visualisation with four graph groups: fault current vs time; bus voltage vs fault; relay timing comparison; and normal-vs-fault current. The script includes sample/reference parameters: 50 Hz; 415 V (load-side line-to-line); 100 kW / 50 kVAr; 0.5 s stop time; reference fault, trip and breaker times of 0.100 s, 0.120 s and 0.125 s.

## Important evidence limitations
- The .slx file includes **model design**, not a verified set of simulation outputs in this upload.
- The .m script looks for `Normal_run.mat`, `LLL_run.mat`, and `LG_run.mat` in the MATLAB working directory. When absent, it builds reconstructed signals; such plots are **illustrative, not recorded Simulink measurements**.
- The script's comments include "AI-Based", but no independently identifiable machine-learning/AI block is shown in the provided model or script. The public-facing project is labelled as conventional power-system fault and relay modelling.
- Relay pickup, TMS and event timings in the script include estimates/assumptions and should be validated against the actual model settings and scope exports.
- IEC curve formulae in the script are analytical comparisons, not evidence of a physical relay being tested.

## Opening files
1. Open `source/GA_PowerSystems.slx` in a compatible MATLAB/Simulink setup with the required electrical power-system blocks. The model was saved with MATLAB **R2024a** according to embedded metadata; compatibility with other releases is unverified.
2. For genuine measurement plots, export appropriately formatted `Normal_run.mat`, `LLL_run.mat`, and `LG_run.mat` with `t`, `V`, `I` and `relay` variables in each file (as expected by the script) after independently verifying the model and its outputs.
3. Run `source/Task5_Visualisation.m` from a working directory containing those `.mat` files. Without them, the script uses synthetic reconstruction described above.

## Before publishing more evidence
Add authentic oscilloscope/scope screenshots, exported `.mat` files, tested relay settings and verified observations when available. Do not present the fallback plots as measured simulation results.
