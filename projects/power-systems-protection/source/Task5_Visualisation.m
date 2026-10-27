%% TASK 5: MATLAB DATA VISUALISATION
%  AI-Based Power System Protection Relay Analysis - Power Systems 2
%
%  Graph 1: Fault Current vs Time
%  Graph 2: Bus Voltage During Fault
%  Graph 3: Relay Operating Time Comparison
%  Graph 4: Normal vs Fault Current

clear; clc; close all;

%% 1. System data (from the Task 2 parameter table)
P.f        = 50;          % Hz
P.Vll      = 415;         % V, load-side phase-to-phase voltage
P.Pload    = 100e3;       % W
P.Qload    = 50e3;        % var
P.Ts       = 50e-6;       % s, powergui sample time
P.Tstop    = 0.5;         % s
P.tFault   = 0.10;        % s, fault inception (edit to match your fault block)
P.tRelay   = 0.12;        % s, relay output goes to 0 (read from your relay scope)
P.tBreaker = 0.125;       % s, current reaches zero (read from your current scope)

P.Iload_rms = hypot(P.Pload, P.Qload) / (sqrt(3) * P.Vll);   % about 155 A
P.Ipk_load  = sqrt(2) * P.Iload_rms;
P.Vpk       = sqrt(2) * P.Vll;                                % phase-to-phase peak

% Fault-current peaks read from your Task 2 scopes (scope axis x10 = amps).
% Used ONLY when no .mat file is found.
P.IfaultPk.LLL = 270;     % LLL current rises from ~220 A to ~270 A before tripping
P.IfaultPk.LG  = 255;     % LG current rises from ~220 A to ~255 A before tripping

%% 2. Relay setting assumptions for Graph 3 (match these to your Task 3 values)
Ipickup = 1.10 * P.Iload_rms;   % A (RMS), pickup = 110 % of load current
TMS     = 0.1;                  % time multiplier setting

%% 3. Load (or build) the three cases
[tN, VN, IN, rN] = getRun('Normal', 'Normal_run.mat', P);
[tL, VL, IL, rL] = getRun('LLL',    'LLL_run.mat',    P);
[tG, VG, IG, rG] = getRun('LG',     'LG_run.mat',     P);

Nwin = round((1 / P.f) / P.Ts);                 % samples in one cycle
rms1 = @(x) sqrt(movmean(x.^2, Nwin, 1, 'Endpoints', 'shrink'));

col = [0.85 0.33 0.10; 0.93 0.69 0.13; 0.00 0.45 0.74];   % phase colours

%% GRAPH 1: Fault current vs time
figure('Name', 'Graph 1', 'Color', 'w', 'Position', [100 100 900 600]);
subplot(2,1,1); hold on; grid on;
for k = 1:3, plot(tL, IL(:,k), 'Color', col(k,:), 'LineWidth', 1); end
markEvents(P);
title('Graph 1a: Fault Current vs Time - Three-Phase (LLL) Fault');
ylabel('Current (A)'); legend('Phase A','Phase B','Phase C','Location','northeast');
xlim([0 P.Tstop]);

subplot(2,1,2); hold on; grid on;
for k = 1:3, plot(tG, IG(:,k), 'Color', col(k,:), 'LineWidth', 1); end
markEvents(P);
title('Graph 1b: Fault Current vs Time - Phase-to-Ground (LG) Fault');
xlabel('Time (s)'); ylabel('Current (A)');
xlim([0 P.Tstop]);
saveas(gcf, 'Graph1_Fault_Current_vs_Time.png');

%% GRAPH 2: Bus voltage during fault
figure('Name', 'Graph 2', 'Color', 'w', 'Position', [100 100 900 600]);
subplot(2,1,1); hold on; grid on;
for k = 1:3, plot(tL, VL(:,k), 'Color', col(k,:), 'LineWidth', 1); end
markEvents(P);
title('Graph 2a: Bus 2 Voltage During Three-Phase (LLL) Fault');
ylabel('Voltage (V)'); legend('Phase A','Phase B','Phase C','Location','northeast');
xlim([0 P.Tstop]);

subplot(2,1,2); hold on; grid on;
for k = 1:3, plot(tG, VG(:,k), 'Color', col(k,:), 'LineWidth', 1); end
markEvents(P);
title('Graph 2b: Bus 2 Voltage During Phase-to-Ground (LG) Fault');
xlabel('Time (s)'); ylabel('Voltage (V)');
xlim([0 P.Tstop]);
saveas(gcf, 'Graph2_Bus_Voltage_During_Fault.png');

%% GRAPH 3: Relay operating time comparison
% Simulated time = relay output drop minus fault inception.
opLLL = tL(find(rL < 0.5, 1)) - P.tFault;
opLG  = tG(find(rG < 0.5, 1)) - P.tFault;

% Fault RMS current seen by the relay (max one-cycle RMS in the fault window)
winL = tL >= P.tFault & tL <= P.tBreaker;
winG = tG >= P.tFault & tG <= P.tBreaker;
IfL  = max(max(rms1(IL(winL,:)), [], 2));
IfG  = max(max(rms1(IG(winG,:)), [], 2));
PSM  = [IfL IfG] / Ipickup;                       % Plug Setting Multiplier

% Standard IEC 60255 curves for comparison
tSI = TMS * 0.14 ./ (PSM.^0.02 - 1);              % Standard Inverse
tVI = TMS * 13.5 ./ (PSM - 1);                    % Very Inverse
tEI = TMS * 80   ./ (PSM.^2 - 1);                 % Extremely Inverse
tSI(PSM <= 1) = NaN; tVI(PSM <= 1) = NaN; tEI(PSM <= 1) = NaN;

T = [opLL_safe(opLLL) opLL_safe(opLG);
     tSI;
     tVI;
     tEI] * 1000;                                 % convert to ms
% rows = relay type, columns = fault type

figure('Name', 'Graph 3', 'Color', 'w', 'Position', [100 100 900 500]);
b = bar(T', 'grouped'); grid on;
set(gca, 'XTickLabel', {'LLL Fault', 'LG Fault'});
ylabel('Relay Operating Time (ms)');
title('Graph 3: Relay Operating Time Comparison');
legend({'Simulated (instantaneous)', 'IEC Standard Inverse', ...
        'IEC Very Inverse', 'IEC Extremely Inverse'}, 'Location', 'northwest');
set(gca, 'YScale', 'log');                        % log scale: 20 ms vs hundreds of ms
for i = 1:numel(b)
    xt = b(i).XEndPoints; yt = b(i).YData;
    text(xt, yt, compose('%.0f', yt), 'HorizontalAlignment', 'center', ...
         'VerticalAlignment', 'bottom', 'FontSize', 8);
end
saveas(gcf, 'Graph3_Relay_Operating_Time_Comparison.png');

%% GRAPH 4: Normal vs fault current
figure('Name', 'Graph 4', 'Color', 'w', 'Position', [100 100 900 600]);
subplot(2,1,1); hold on; grid on;
plot(tN, IN(:,1), 'b', 'LineWidth', 1);
plot(tL, IL(:,1), 'r', 'LineWidth', 1);
markEvents(P);
title('Graph 4a: Phase A Current - Normal vs Three-Phase Fault');
ylabel('Current (A)'); legend('Normal','LLL fault','Location','northeast');
xlim([0 P.Tstop]);

subplot(2,1,2); hold on; grid on;
plot(tN, max(rms1(IN), [], 2), 'b', 'LineWidth', 1.5);
plot(tL, max(rms1(IL), [], 2), 'r', 'LineWidth', 1.5);
plot(tG, max(rms1(IG), [], 2), 'm--', 'LineWidth', 1.5);
yline(Ipickup, 'k:', 'Relay pickup', 'LineWidth', 1.2);
title('Graph 4b: RMS Current - Normal vs LLL vs LG');
xlabel('Time (s)'); ylabel('RMS current (A)');
legend('Normal','LLL fault','LG fault','Location','northeast');
xlim([0 P.Tstop]);
saveas(gcf, 'Graph4_Normal_vs_Fault_Current.png');

%% Summary printed to the command window (useful for the report table)
fprintf('\n---- Summary ----\n');
fprintf('Load current (RMS)          : %.1f A\n', P.Iload_rms);
fprintf('Relay pickup current        : %.1f A\n', Ipickup);
fprintf('LLL: fault RMS %.0f A, PSM %.2f, simulated op. time %.0f ms\n', IfL, PSM(1), opLLL*1000);
fprintf('LG : fault RMS %.0f A, PSM %.2f, simulated op. time %.0f ms\n', IfG, PSM(2), opLG*1000);

%% ---------------- Local functions ----------------
function markEvents(P)
    xline(P.tFault,   'k--', 'Fault',   'LabelVerticalAlignment', 'bottom');
    xline(P.tRelay,   'g--', 'Relay trip', 'LabelVerticalAlignment', 'bottom');
    xline(P.tBreaker, 'm--', 'Breaker open', 'LabelVerticalAlignment', 'bottom');
end

function x = opLL_safe(x)
    if isempty(x), x = NaN; end
end

function [t, V, I, relay] = getRun(kind, file, P)
    if isfile(file)
        S = load(file);
        t = S.t(:); V = S.V; I = S.I; relay = S.relay(:);
        return
    end
    warning('%s not found. Rebuilding the %s case from the Task 2 screenshots.', file, kind);
    t  = (0:P.Ts:P.Tstop)';
    w  = 2*pi*P.f;
    ph = [0 -2*pi/3 2*pi/3];
    V  = P.Vpk * sin(w*t + ph);                    % about +/-587 V (scope shows ~60 x10)
    I  = P.Ipk_load * sin(w*t + ph - 0.4636);      % about +/-220 A, lagging pf
    relay = ones(size(t));
    if strcmp(kind, 'Normal'), return; end

    inF   = t >= P.tFault & t < P.tBreaker;
    after = t >= P.tBreaker;
    tf    = t(inF) - P.tFault;
    frac  = tf / (P.tBreaker - P.tFault);          % 0 to 1 across the fault window

    % Current grows slightly during the fault, then the breaker cuts it to zero
    Iamp = P.Ipk_load + (P.IfaultPk.(kind) - P.Ipk_load) * frac;
    I(inF,:)   = Iamp .* sin(w*t(inF) + ph - 0.4636);
    I(after,:) = 0;
    relay(t >= P.tRelay) = 0;

    switch kind
        case 'LLL'      % voltage collapses to zero at fault inception
            V(t >= P.tFault, :) = 0;
        case 'LG'       % voltage sags during the fault, then decays after tripping
            V(inF,:) = V(inF,:) .* (1 - 0.5*frac);
            V(after,:) = 0.5 * P.Vpk * sin(w*t(after) + ph) ...
                         .* exp(-(t(after) - P.tBreaker)/0.004);
    end
end
