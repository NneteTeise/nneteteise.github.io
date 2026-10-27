# Telecom Network Monitoring System — Software Development

**Portfolio owner:** Nnete Teise  
**Original environment:** Code::Blocks / GCC, C language  
**Type:** menu-driven console exercise

This package contains the source program, a Code::Blocks project, original report evidence with identifying student number masked, and a separate HTML/JavaScript demonstration.

## Functions and sample outputs

1. **Simulate Call Traffic:** enter number of calls then each duration. Multiply summed minutes by the fixed R2.50/min rate. Original example: `7` + `3` minutes → **10.00 minutes** and **R25.00**.
2. **Calculate Total Data Usage:** enter number of sessions then each MB amount. Multiply summed MB by the fixed R0.10/MB rate. Original example: `57.10`, `32.60`, `40.00` → **129.70 MB** and **R12.97**.
3. **Exit:** prints the closing message.

## Compile

```bash
gcc -std=c11 -Wall -Wextra telecom_network_monitor.c -o telecom_network_monitor
./telecom_network_monitor
```

For Code::Blocks, open `telecom_network_monitor.cbp`. The project file has been adjusted to point at the supplied `.c` filename; the C calculation logic is otherwise retained from the uploaded archive. Precompiled EXE/object files were excluded from the public download.

## Boundaries

The original code handles one menu choice per run and requests data through `scanf`. There is no input validation, network API, packet inspection, persisted log, database, or live billing system. The browser demonstration is a **separate educational reconstruction** of the same arithmetic; it improves validation and can restart without re-launching an executable. 
